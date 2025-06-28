import { apiClient, ApiResponse } from '../client';

// Project types
export interface Project {
  id: string;
  type: 'ngo' | 'startup';
  title: string;
  description: string;
  shortDescription: string;
  category: ProjectCategory;
  subcategory?: string;
  images: string[];
  videos?: string[];
  documents?: ProjectDocument[];
  
  // Organization details
  organizationName: string;
  organizationLogo?: string;
  organizationDescription: string;
  website?: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
  
  // Financial details
  fundingGoal: number;
  currentFunding: number;
  currency: 'ETH' | 'USDC' | 'DAI';
  minimumDonation?: number;
  
  // Status and verification
  status: ProjectStatus;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  isActive: boolean;
  isFeatured: boolean;
  
  // Location
  location: {
    country: string;
    state?: string;
    city?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  
  // Timing
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relationships
  createdBy: string;
  teamMembers: ProjectMember[];
  
  // Metrics
  stats: {
    donorCount: number;
    totalDonations: number;
    averageDonation: number;
    viewCount: number;
    shareCount: number;
    followerCount: number;
  };
  
  // Additional fields for startups
  businessModel?: string;
  revenueModel?: string;
  marketSize?: string;
  competition?: string;
  fundingStage?: 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c' | 'ipo';
  equity?: {
    totalShares: number;
    availableShares: number;
    pricePerShare: number;
  };
  
  // Additional fields for NGOs
  beneficiaryCount?: number;
  impactMetrics?: ImpactMetric[];
  sdgGoals?: number[]; // UN Sustainable Development Goals
}

export enum ProjectCategory {
  // NGO Categories
  EDUCATION = 'education',
  HEALTHCARE = 'healthcare',
  ENVIRONMENT = 'environment',
  POVERTY = 'poverty',
  DISASTER_RELIEF = 'disaster_relief',
  HUMAN_RIGHTS = 'human_rights',
  CHILDREN = 'children',
  ELDERLY = 'elderly',
  DISABILITY = 'disability',
  ANIMALS = 'animals',
  
  // Startup Categories
  FINTECH = 'fintech',
  HEALTHTECH = 'healthtech',
  EDTECH = 'edtech',
  GREENTECH = 'greentech',
  AGRICULTURE = 'agriculture',
  LOGISTICS = 'logistics',
  ECOMMERCE = 'ecommerce',
  SAAS = 'saas',
  MARKETPLACE = 'marketplace',
  MOBILITY = 'mobility',
}

export enum ProjectStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

export interface ProjectMember {
  id: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'advisor';
  joinedAt: string;
  permissions: string[];
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'image' | 'video';
  url: string;
  size: number;
  uploadedAt: string;
  isPublic: boolean;
}

export interface ImpactMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  description: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface CreateProjectRequest {
  type: 'ngo' | 'startup';
  title: string;
  description: string;
  shortDescription: string;
  category: ProjectCategory;
  subcategory?: string;
  organizationName: string;
  organizationDescription: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
  fundingGoal: number;
  currency: 'ETH' | 'USDC' | 'DAI';
  minimumDonation?: number;
  location: {
    country: string;
    state?: string;
    city?: string;
  };
  startDate: string;
  endDate?: string;
  
  // Startup-specific fields
  businessModel?: string;
  revenueModel?: string;
  marketSize?: string;
  competition?: string;
  fundingStage?: 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c' | 'ipo';
  
  // NGO-specific fields
  beneficiaryCount?: number;
  sdgGoals?: number[];
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  shortDescription?: string;
  category?: ProjectCategory;
  subcategory?: string;
  organizationName?: string;
  organizationDescription?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
  fundingGoal?: number;
  minimumDonation?: number;
  location?: {
    country?: string;
    state?: string;
    city?: string;
  };
  endDate?: string;
  isActive?: boolean;
  
  // Startup-specific fields
  businessModel?: string;
  revenueModel?: string;
  marketSize?: string;
  competition?: string;
  
  // NGO-specific fields
  beneficiaryCount?: number;
  sdgGoals?: number[];
}

export interface ProjectSearchFilters {
  type?: 'ngo' | 'startup';
  category?: ProjectCategory;
  status?: ProjectStatus;
  verified?: boolean;
  featured?: boolean;
  country?: string;
  fundingRange?: {
    min?: number;
    max?: number;
  };
  search?: string;
  sortBy?: 'createdAt' | 'fundingGoal' | 'currentFunding' | 'donorCount' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface Donation {
  id: string;
  projectId: string;
  donorId: string;
  amount: number;
  currency: string;
  message?: string;
  isAnonymous: boolean;
  transactionHash: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  project?: Partial<Project>;
  donor?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface Investment {
  id: string;
  projectId: string;
  investorId: string;
  amount: number;
  currency: string;
  shares: number;
  pricePerShare: number;
  equityPercentage: number;
  transactionHash: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  project?: Partial<Project>;
  investor?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

class ProjectService {
  // Project CRUD operations
  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    const response = await apiClient.post<Project>('/projects', projectData);
    return response.data;
  }

  async getProject(projectId: string): Promise<Project> {
    const response = await apiClient.get<Project>(`/projects/${projectId}`);
    return response.data;
  }

  async getProjectBySlug(slug: string): Promise<Project> {
    const response = await apiClient.get<Project>(`/projects/slug/${slug}`);
    return response.data;
  }

  async updateProject(projectId: string, updates: UpdateProjectRequest): Promise<Project> {
    const response = await apiClient.patch<Project>(`/projects/${projectId}`, updates);
    return response.data;
  }

  async deleteProject(projectId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}`);
  }

  // Project search and discovery
  async searchProjects(filters: ProjectSearchFilters = {}): Promise<{
    projects: Project[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await apiClient.get<{
      projects: Project[];
      total: number;
      page: number;
      totalPages: number;
    }>('/projects/search', {
      params: filters,
    });
    return response.data;
  }

  async getFeaturedProjects(type?: 'ngo' | 'startup', limit = 10): Promise<Project[]> {
    const response = await apiClient.get<Project[]>('/projects/featured', {
      params: { type, limit },
    });
    return response.data;
  }

  async getTrendingProjects(type?: 'ngo' | 'startup', limit = 10): Promise<Project[]> {
    const response = await apiClient.get<Project[]>('/projects/trending', {
      params: { type, limit },
    });
    return response.data;
  }

  async getProjectsByCategory(category: ProjectCategory, page = 1, limit = 20): Promise<{
    projects: Project[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.searchProjects({ category, page, limit });
  }

  async getProjectsByUser(userId?: string, page = 1, limit = 20): Promise<{
    projects: Project[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const endpoint = userId ? `/users/${userId}/projects` : '/users/me/projects';
    const response = await apiClient.get<{
      projects: Project[];
      total: number;
      page: number;
      totalPages: number;
    }>(endpoint, {
      params: { page, limit },
    });
    return response.data;
  }

  // Media management
  async uploadProjectImage(projectId: string, file: File, onProgress?: (progress: number) => void): Promise<string> {
    const response = await apiClient.uploadFile<{ url: string }>(`/projects/${projectId}/images`, file, onProgress);
    return response.data.url;
  }

  async uploadProjectVideo(projectId: string, file: File, onProgress?: (progress: number) => void): Promise<string> {
    const response = await apiClient.uploadFile<{ url: string }>(`/projects/${projectId}/videos`, file, onProgress);
    return response.data.url;
  }

  async uploadProjectDocument(
    projectId: string, 
    file: File, 
    isPublic = false,
    onProgress?: (progress: number) => void
  ): Promise<ProjectDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isPublic', String(isPublic));

    const response = await apiClient.post<ProjectDocument>(`/projects/${projectId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  }

  async removeProjectImage(projectId: string, imageUrl: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/images`, {
      data: { imageUrl },
    });
  }

  async removeProjectDocument(projectId: string, documentId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/documents/${documentId}`);
  }

  // Project team management
  async addTeamMember(
    projectId: string, 
    userId: string, 
    role: 'admin' | 'member' | 'advisor'
  ): Promise<ProjectMember> {
    const response = await apiClient.post<ProjectMember>(`/projects/${projectId}/team`, {
      userId,
      role,
    });
    return response.data;
  }

  async updateTeamMember(
    projectId: string, 
    memberId: string, 
    updates: { role?: string; permissions?: string[] }
  ): Promise<ProjectMember> {
    const response = await apiClient.patch<ProjectMember>(`/projects/${projectId}/team/${memberId}`, updates);
    return response.data;
  }

  async removeTeamMember(projectId: string, memberId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/team/${memberId}`);
  }

  // Donations
  async makeDonation(donation: {
    projectId: string;
    amount: number;
    currency: string;
    message?: string;
    isAnonymous?: boolean;
    transactionHash: string;
  }): Promise<Donation> {
    const response = await apiClient.post<Donation>('/donations', donation);
    return response.data;
  }

  async getProjectDonations(projectId: string, page = 1, limit = 20): Promise<{
    donations: Donation[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await apiClient.get<{
      donations: Donation[];
      total: number;
      page: number;
      totalPages: number;
    }>(`/projects/${projectId}/donations`, {
      params: { page, limit },
    });
    return response.data;
  }

  async getUserDonations(userId?: string, page = 1, limit = 20): Promise<{
    donations: Donation[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const endpoint = userId ? `/users/${userId}/donations` : '/users/me/donations';
    const response = await apiClient.get<{
      donations: Donation[];
      total: number;
      page: number;
      totalPages: number;
    }>(endpoint, {
      params: { page, limit },
    });
    return response.data;
  }

  // Investments (for startups)
  async makeInvestment(investment: {
    projectId: string;
    amount: number;
    currency: string;
    shares: number;
    transactionHash: string;
  }): Promise<Investment> {
    const response = await apiClient.post<Investment>('/investments', investment);
    return response.data;
  }

  async getProjectInvestments(projectId: string, page = 1, limit = 20): Promise<{
    investments: Investment[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await apiClient.get<{
      investments: Investment[];
      total: number;
      page: number;
      totalPages: number;
    }>(`/projects/${projectId}/investments`, {
      params: { page, limit },
    });
    return response.data;
  }

  async getUserInvestments(userId?: string, page = 1, limit = 20): Promise<{
    investments: Investment[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const endpoint = userId ? `/users/${userId}/investments` : '/users/me/investments';
    const response = await apiClient.get<{
      investments: Investment[];
      total: number;
      page: number;
      totalPages: number;
    }>(endpoint, {
      params: { page, limit },
    });
    return response.data;
  }

  // Project verification and moderation
  async submitForVerification(projectId: string): Promise<void> {
    await apiClient.post(`/projects/${projectId}/verify`);
  }

  async verifyProject(projectId: string, approved: boolean, reason?: string): Promise<Project> {
    const response = await apiClient.patch<Project>(`/projects/${projectId}/verification`, {
      approved,
      reason,
    });
    return response.data;
  }

  // Project following
  async followProject(projectId: string): Promise<void> {
    await apiClient.post(`/projects/${projectId}/follow`);
  }

  async unfollowProject(projectId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/follow`);
  }

  async getProjectFollowers(projectId: string, page = 1, limit = 20): Promise<{
    users: Array<{ id: string; name: string; avatar?: string }>;
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await apiClient.get<{
      users: Array<{ id: string; name: string; avatar?: string }>;
      total: number;
      page: number;
      totalPages: number;
    }>(`/projects/${projectId}/followers`, {
      params: { page, limit },
    });
    return response.data;
  }

  async getFollowedProjects(userId?: string, page = 1, limit = 20): Promise<{
    projects: Project[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const endpoint = userId ? `/users/${userId}/following/projects` : '/users/me/following/projects';
    const response = await apiClient.get<{
      projects: Project[];
      total: number;
      page: number;
      totalPages: number;
    }>(endpoint, {
      params: { page, limit },
    });
    return response.data;
  }

  // Project analytics
  async getProjectAnalytics(projectId: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    views: Array<{ date: string; count: number }>;
    donations: Array<{ date: string; amount: number; count: number }>;
    followers: Array<{ date: string; count: number }>;
    topCountries: Array<{ country: string; count: number }>;
    topReferrers: Array<{ source: string; count: number }>;
  }> {
    const response = await apiClient.get<{
      views: Array<{ date: string; count: number }>;
      donations: Array<{ date: string; amount: number; count: number }>;
      followers: Array<{ date: string; count: number }>;
      topCountries: Array<{ country: string; count: number }>;
      topReferrers: Array<{ source: string; count: number }>;
    }>(`/projects/${projectId}/analytics`, {
      params: { period },
    });
    return response.data;
  }

  // Impact metrics (for NGOs)
  async addImpactMetric(projectId: string, metric: {
    name: string;
    value: number;
    unit: string;
    description: string;
  }): Promise<ImpactMetric> {
    const response = await apiClient.post<ImpactMetric>(`/projects/${projectId}/impact-metrics`, metric);
    return response.data;
  }

  async updateImpactMetric(projectId: string, metricId: string, updates: {
    name?: string;
    value?: number;
    unit?: string;
    description?: string;
  }): Promise<ImpactMetric> {
    const response = await apiClient.patch<ImpactMetric>(`/projects/${projectId}/impact-metrics/${metricId}`, updates);
    return response.data;
  }

  async verifyImpactMetric(projectId: string, metricId: string): Promise<ImpactMetric> {
    const response = await apiClient.patch<ImpactMetric>(`/projects/${projectId}/impact-metrics/${metricId}/verify`);
    return response.data;
  }

  async removeImpactMetric(projectId: string, metricId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/impact-metrics/${metricId}`);
  }
}

// Create singleton instance
export const projectService = new ProjectService(); 