import mongoose from 'mongoose';
import { Project, IProject, ProjectStatus, ProjectType, Currency } from '@/models/Project.model';
import { NGO } from '@/models/NGO.model';
import { User } from '@/models/User.model';
import { cacheService, CACHE_KEYS, CACHE_TTL } from '@/config/redis';
import { logger } from '@/utils/logger';
import { ValidationError, NotFoundError, AuthorizationError } from '@/middleware/errorHandler';
import { PaginatedResult, CreateResponse, UpdateResponse } from '@/types/common';

export interface CreateProjectData {
  title: string;
  description: string;
  summary: string;
  category: string;
  subcategory?: string;
  type: ProjectType;
  entityId: mongoose.Types.ObjectId;
  entityType: 'ngo' | 'startup';
  coverImage?: string;
  gallery?: string[];
  documents?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  fundingGoal: {
    amount: number;
    currency: Currency;
  };
  minimumFunding?: {
    amount: number;
    currency: Currency;
  };
  deadline: Date;
  equity?: {
    percentage: number;
    valuation: number;
    currency: Currency;
    vestingSchedule?: string;
    liquidationPreference?: string;
  };
  impactGoals?: {
    beneficiaries: number;
    regions: string[];
    sdgGoals: number[];
    customMetrics?: Array<{
      name: string;
      target: number;
      unit: string;
    }>;
  };
  milestones: Array<{
    title: string;
    description: string;
    targetDate: Date;
    fundingPercentage: number;
    deliverables: string[];
  }>;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
  location?: {
    country: string;
    state?: string;
    city?: string;
    coordinates?: [number, number];
  };
}

export interface ProjectFilters {
  type?: ProjectType;
  category?: string;
  status?: ProjectStatus;
  entityType?: 'ngo' | 'startup';
  fundingRange?: {
    min?: number;
    max?: number;
  };
  location?: {
    country?: string;
    coordinates?: {
      longitude: number;
      latitude: number;
      radius: number;
    };
  };
  tags?: string[];
  deadlineBefore?: Date;
  deadlineAfter?: Date;
  minScore?: number;
}

export interface ProjectAnalytics {
  totalProjects: number;
  totalFunding: number;
  averageFunding: number;
  successRate: number;
  popularCategories: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    projects: number;
    funding: number;
  }>;
  geographicDistribution: Array<{
    country: string;
    projects: number;
    funding: number;
  }>;
}

export class ProjectService {
  /**
   * Create a new project
   */
  async createProject(
    data: CreateProjectData,
    userId: mongoose.Types.ObjectId
  ): Promise<CreateResponse<IProject>> {
    try {
      logger.info('Creating new project', { userId, projectType: data.type, title: data.title });

      // Validate entity exists and user has permission
      await this.validateEntityPermission(data.entityId, data.entityType, userId);

      // Generate milestone IDs
      const milestonesWithIds = data.milestones.map(milestone => ({
        ...milestone,
        id: new mongoose.Types.ObjectId().toString(),
        status: 'pending' as const
      }));

      // Validate milestone funding percentages
      this.validateMilestoneFunding(milestonesWithIds);

      const projectData = {
        ...data,
        milestones: milestonesWithIds,
        createdBy: userId,
        status: ProjectStatus.DRAFT
      };

      const project = new Project(projectData);
      await project.save();

      // Clear relevant caches
      await this.clearProjectCaches();

      logger.info('Project created successfully', {
        projectId: project._id,
        userId,
        type: data.type
      });

      return {
        success: true,
        data: project,
        message: 'Project created successfully'
      };
    } catch (error) {
      logger.error('Project creation failed:', error);
      if (error instanceof ValidationError || error instanceof AuthorizationError) {
        throw error;
      }
      throw new Error('Failed to create project');
    }
  }

  /**
   * Get project by ID with population
   */
  async getProjectById(
    projectId: string,
    populateFields: string[] = []
  ): Promise<IProject> {
    try {
      const cacheKey = CACHE_KEYS.PROJECT(projectId);
      let project = await cacheService.get<IProject>(cacheKey);

      if (!project) {
        let query = Project.findById(projectId);
        
        if (populateFields.length > 0) {
          populateFields.forEach(field => {
            query = query.populate(field);
          });
        }

        project = await query.exec();
        
        if (!project) {
          throw new NotFoundError('Project not found');
        }

        // Cache for 30 minutes
        await cacheService.set(cacheKey, project, CACHE_TTL.MEDIUM);
      }

      return project;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error('Error fetching project:', error);
      throw new Error('Failed to fetch project');
    }
  }

  /**
   * Update project
   */
  async updateProject(
    projectId: string,
    updates: Partial<CreateProjectData>,
    userId: mongoose.Types.ObjectId
  ): Promise<UpdateResponse<IProject>> {
    try {
      const project = await this.getProjectById(projectId);

      // Check permissions
      if (!this.canUserModifyProject(project, userId)) {
        throw new AuthorizationError('Insufficient permissions to modify project');
      }

      // Validate project can be updated
      if (project.status === ProjectStatus.COMPLETED || project.status === ProjectStatus.CANCELLED) {
        throw new ValidationError('Cannot update completed or cancelled projects');
      }

      // Validate milestone funding if milestones are being updated
      if (updates.milestones) {
        this.validateMilestoneFunding(updates.milestones as any);
      }

      Object.assign(project, updates);
      project.updatedBy = userId;

      await project.save();

      // Clear caches
      await this.clearProjectCaches(projectId);

      logger.info('Project updated successfully', {
        projectId,
        userId,
        updatedFields: Object.keys(updates)
      });

      return {
        success: true,
        data: project,
        message: 'Project updated successfully'
      };
    } catch (error) {
      logger.error('Project update failed:', error);
      if (error instanceof ValidationError || error instanceof AuthorizationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to update project');
    }
  }

  /**
   * Submit project for review
   */
  async submitProject(
    projectId: string,
    userId: mongoose.Types.ObjectId
  ): Promise<UpdateResponse<IProject>> {
    try {
      const project = await this.getProjectById(projectId);

      if (!this.canUserModifyProject(project, userId)) {
        throw new AuthorizationError('Insufficient permissions to submit project');
      }

      if (project.status !== ProjectStatus.DRAFT) {
        throw new ValidationError('Only draft projects can be submitted');
      }

      // Validate project completeness
      this.validateProjectCompleteness(project);

      project.status = ProjectStatus.SUBMITTED;
      project.updatedBy = userId;

      await project.save();

      // Clear caches
      await this.clearProjectCaches(projectId);

      // TODO: Trigger AI screening process
      // await this.triggerAIScreening(project);

      logger.info('Project submitted for review', { projectId, userId });

      return {
        success: true,
        data: project,
        message: 'Project submitted successfully for review'
      };
    } catch (error) {
      logger.error('Project submission failed:', error);
      if (error instanceof ValidationError || error instanceof AuthorizationError) {
        throw error;
      }
      throw new Error('Failed to submit project');
    }
  }

  /**
   * Get projects with filters and pagination
   */
  async getProjects(
    filters: ProjectFilters = {},
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<PaginatedResult<IProject>> {
    try {
      const cacheKey = `projects:${JSON.stringify(filters)}:${page}:${limit}:${sortBy}:${sortOrder}`;
      const cached = await cacheService.get<PaginatedResult<IProject>>(cacheKey);

      if (cached) {
        return cached;
      }

      // Build query
      const query = this.buildProjectQuery(filters);

      // Execute count and data queries in parallel
      const [total, projects] = await Promise.all([
        Project.countDocuments(query),
        Project.find(query)
          .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate('entityId')
          .populate('createdBy', 'name email')
          .exec()
      ]);

      const result: PaginatedResult<IProject> = {
        data: projects,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPreviousPage: page > 1
        }
      };

      // Cache for 10 minutes
      await cacheService.set(cacheKey, result, 600);

      return result;
    } catch (error) {
      logger.error('Error fetching projects:', error);
      throw new Error('Failed to fetch projects');
    }
  }

  /**
   * Search projects
   */
  async searchProjects(
    query: string,
    filters: ProjectFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResult<IProject>> {
    try {
      const searchQuery = {
        $text: { $search: query },
        ...this.buildProjectQuery(filters)
      };

      const [total, projects] = await Promise.all([
        Project.countDocuments(searchQuery),
        Project.find(searchQuery)
          .sort({ score: { $meta: 'textScore' } })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate('entityId')
          .populate('createdBy', 'name email')
          .exec()
      ]);

      return {
        data: projects,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPreviousPage: page > 1
        }
      };
    } catch (error) {
      logger.error('Error searching projects:', error);
      throw new Error('Failed to search projects');
    }
  }

  /**
   * Get project analytics
   */
  async getProjectAnalytics(
    timeRange: { start: Date; end: Date },
    filters: ProjectFilters = {}
  ): Promise<ProjectAnalytics> {
    try {
      const cacheKey = `project_analytics:${timeRange.start.getTime()}:${timeRange.end.getTime()}:${JSON.stringify(filters)}`;
      const cached = await cacheService.get<ProjectAnalytics>(cacheKey);

      if (cached) {
        return cached;
      }

      const matchQuery = {
        createdAt: { $gte: timeRange.start, $lte: timeRange.end },
        ...this.buildProjectQuery(filters)
      };

      const [
        totalStats,
        categoryStats,
        monthlyStats,
        geoStats
      ] = await Promise.all([
        this.getTotalProjectStats(matchQuery),
        this.getCategoryStats(matchQuery),
        this.getMonthlyStats(matchQuery),
        this.getGeographicStats(matchQuery)
      ]);

      const analytics: ProjectAnalytics = {
        totalProjects: totalStats.count,
        totalFunding: totalStats.totalFunding,
        averageFunding: totalStats.averageFunding,
        successRate: totalStats.successRate,
        popularCategories: categoryStats,
        monthlyTrends: monthlyStats,
        geographicDistribution: geoStats
      };

      // Cache for 1 hour
      await cacheService.set(cacheKey, analytics, CACHE_TTL.LONG);

      return analytics;
    } catch (error) {
      logger.error('Error generating project analytics:', error);
      throw new Error('Failed to generate analytics');
    }
  }

  /**
   * Update project funding
   */
  async updateProjectFunding(
    projectId: string,
    amount: number,
    currency: Currency,
    transactionHash?: string
  ): Promise<UpdateResponse<IProject>> {
    try {
      const project = await this.getProjectById(projectId);

      if (!project.canReceiveFunding()) {
        throw new ValidationError('Project cannot receive funding in current state');
      }

      project.fundingRaised.amount += amount;
      project.fundingRaised.currency = currency;

      // Update status if fully funded
      if (project.fundingProgress >= 100 && project.status === ProjectStatus.APPROVED) {
        project.status = ProjectStatus.FUNDED;
      }

      await project.save();

      // Clear caches
      await this.clearProjectCaches(projectId);

      logger.info('Project funding updated', {
        projectId,
        amount,
        currency,
        newTotal: project.fundingRaised.amount,
        progress: project.fundingProgress
      });

      return {
        success: true,
        data: project,
        message: 'Funding updated successfully'
      };
    } catch (error) {
      logger.error('Error updating project funding:', error);
      throw error;
    }
  }

  // Private helper methods

  private async validateEntityPermission(
    entityId: mongoose.Types.ObjectId,
    entityType: 'ngo' | 'startup',
    userId: mongoose.Types.ObjectId
  ): Promise<void> {
    if (entityType === 'ngo') {
      const ngo = await NGO.findById(entityId);
      if (!ngo) {
        throw new NotFoundError('NGO not found');
      }
      
      const isAdmin = ngo.admins.some(admin => admin.equals(userId)) || ngo.founder.equals(userId);
      if (!isAdmin) {
        throw new AuthorizationError('User is not authorized to create projects for this NGO');
      }
    }
    // TODO: Add similar validation for startups when startup model is created
  }

  private validateMilestoneFunding(milestones: Array<{ fundingPercentage: number }>): void {
    const totalPercentage = milestones.reduce((sum, milestone) => sum + milestone.fundingPercentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new ValidationError('Milestone funding percentages must sum to 100%');
    }
  }

  private validateProjectCompleteness(project: IProject): void {
    const requiredFields = ['title', 'description', 'summary', 'category', 'fundingGoal', 'deadline'];
    
    for (const field of requiredFields) {
      if (!project[field as keyof IProject]) {
        throw new ValidationError(`${field} is required before submission`);
      }
    }

    if (!project.milestones || project.milestones.length === 0) {
      throw new ValidationError('At least one milestone is required');
    }

    if (project.type === ProjectType.CHARITY && (!project.impactGoals || !project.impactGoals.beneficiaries)) {
      throw new ValidationError('Impact goals with beneficiaries count is required for charity projects');
    }
  }

  private canUserModifyProject(project: IProject, userId: mongoose.Types.ObjectId): boolean {
    return project.createdBy.equals(userId);
    // TODO: Add additional permission checks based on user role and entity permissions
  }

  private buildProjectQuery(filters: ProjectFilters): any {
    const query: any = {};

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.status) {
      query.status = filters.status;
    } else {
      // By default, exclude draft projects unless specifically requested
      query.status = { $ne: ProjectStatus.DRAFT };
    }

    if (filters.entityType) {
      query.entityType = filters.entityType;
    }

    if (filters.fundingRange) {
      const fundingQuery: any = {};
      if (filters.fundingRange.min !== undefined) {
        fundingQuery.$gte = filters.fundingRange.min;
      }
      if (filters.fundingRange.max !== undefined) {
        fundingQuery.$lte = filters.fundingRange.max;
      }
      if (Object.keys(fundingQuery).length > 0) {
        query['fundingGoal.amount'] = fundingQuery;
      }
    }

    if (filters.location) {
      if (filters.location.country) {
        query['location.country'] = filters.location.country;
      }
      
      if (filters.location.coordinates) {
        const { longitude, latitude, radius } = filters.location.coordinates;
        query['location.coordinates'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: radius
          }
        };
      }
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    if (filters.deadlineBefore || filters.deadlineAfter) {
      const deadlineQuery: any = {};
      if (filters.deadlineBefore) {
        deadlineQuery.$lte = filters.deadlineBefore;
      }
      if (filters.deadlineAfter) {
        deadlineQuery.$gte = filters.deadlineAfter;
      }
      query.deadline = deadlineQuery;
    }

    if (filters.minScore) {
      query['aiScreeningResults.overallScore'] = { $gte: filters.minScore };
    }

    return query;
  }

  private async getTotalProjectStats(matchQuery: any): Promise<{
    count: number;
    totalFunding: number;
    averageFunding: number;
    successRate: number;
  }> {
    const stats = await Project.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalFunding: { $sum: '$fundingRaised.amount' },
          completedCount: {
            $sum: {
              $cond: [{ $eq: ['$status', ProjectStatus.COMPLETED] }, 1, 0]
            }
          }
        }
      }
    ]);

    const result = stats[0] || { count: 0, totalFunding: 0, completedCount: 0 };
    
    return {
      count: result.count,
      totalFunding: result.totalFunding,
      averageFunding: result.count > 0 ? result.totalFunding / result.count : 0,
      successRate: result.count > 0 ? (result.completedCount / result.count) * 100 : 0
    };
  }

  private async getCategoryStats(matchQuery: any): Promise<Array<{
    category: string;
    count: number;
    percentage: number;
  }>> {
    const stats = await Project.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const total = stats.reduce((sum, stat) => sum + stat.count, 0);
    
    return stats.map(stat => ({
      category: stat._id,
      count: stat.count,
      percentage: total > 0 ? (stat.count / total) * 100 : 0
    }));
  }

  private async getMonthlyStats(matchQuery: any): Promise<Array<{
    month: string;
    projects: number;
    funding: number;
  }>> {
    const stats = await Project.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          projects: { $sum: 1 },
          funding: { $sum: '$fundingRaised.amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    return stats.map(stat => ({
      month: `${stat._id.year}-${stat._id.month.toString().padStart(2, '0')}`,
      projects: stat.projects,
      funding: stat.funding
    }));
  }

  private async getGeographicStats(matchQuery: any): Promise<Array<{
    country: string;
    projects: number;
    funding: number;
  }>> {
    const stats = await Project.aggregate([
      { $match: { ...matchQuery, 'location.country': { $exists: true } } },
      {
        $group: {
          _id: '$location.country',
          projects: { $sum: 1 },
          funding: { $sum: '$fundingRaised.amount' }
        }
      },
      { $sort: { projects: -1 } }
    ]);

    return stats.map(stat => ({
      country: stat._id,
      projects: stat.projects,
      funding: stat.funding
    }));
  }

  private async clearProjectCaches(projectId?: string): Promise<void> {
    try {
      if (projectId) {
        await cacheService.delete(CACHE_KEYS.PROJECT(projectId));
      }
      
      // Clear project list caches (this is a simplified approach)
      const cachePattern = 'projects:*';
      // TODO: Implement pattern-based cache clearing if Redis supports it
      
      logger.debug('Project caches cleared', { projectId });
    } catch (error) {
      logger.error('Error clearing project caches:', error);
    }
  }
} 