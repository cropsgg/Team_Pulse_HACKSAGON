'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  projectService,
  Project,
  CreateProjectRequest,
  ProjectSearchFilters,
  ProjectCategory,
  Donation,
} from '@/lib/api/services/projectService';

// Query keys for consistent cache management
export const projectKeys = {
  all: ['projects'] as const,
  project: (id: string) => [...projectKeys.all, 'project', id] as const,
  slug: (slug: string) => [...projectKeys.all, 'slug', slug] as const,
  search: (filters: ProjectSearchFilters) => [...projectKeys.all, 'search', filters] as const,
  featured: (type?: 'ngo' | 'startup') => [...projectKeys.all, 'featured', type] as const,
  trending: (type?: 'ngo' | 'startup') => [...projectKeys.all, 'trending', type] as const,
  category: (category: ProjectCategory) => [...projectKeys.all, 'category', category] as const,
  userProjects: (userId?: string) => [...projectKeys.all, 'user', userId] as const,
  donations: (projectId: string) => [...projectKeys.all, 'donations', projectId] as const,
  followers: (projectId: string) => [...projectKeys.all, 'followers', projectId] as const,
  analytics: (projectId: string, period: string) => [...projectKeys.all, 'analytics', projectId, period] as const,
};

// Project CRUD hooks
export function useProject(projectId: string, enabled = true) {
  return useQuery({
    queryKey: projectKeys.project(projectId),
    queryFn: () => projectService.getProject(projectId),
    enabled: enabled && !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProjectBySlug(slug: string, enabled = true) {
  return useQuery({
    queryKey: projectKeys.slug(slug),
    queryFn: () => projectService.getProjectBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectData: CreateProjectRequest) => projectService.createProject(projectData),
    
    onSuccess: (project: Project) => {
      // Add to cache
      queryClient.setQueryData(projectKeys.project(project.id), project);
      
      // Invalidate relevant lists
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({ queryKey: projectKeys.userProjects() });
      
      toast.success('Project created successfully!');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create project');
    },
  });
}

// Project search and discovery
export function useSearchProjects(filters: ProjectSearchFilters, enabled = true) {
  return useQuery({
    queryKey: projectKeys.search(filters),
    queryFn: () => projectService.searchProjects(filters),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useFeaturedProjects(type?: 'ngo' | 'startup', limit = 10, enabled = true) {
  return useQuery({
    queryKey: projectKeys.featured(type),
    queryFn: () => projectService.getFeaturedProjects(type, limit),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useTrendingProjects(type?: 'ngo' | 'startup', limit = 10, enabled = true) {
  return useQuery({
    queryKey: projectKeys.trending(type),
    queryFn: () => projectService.getTrendingProjects(type, limit),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProjectsByCategory(category: ProjectCategory, page = 1, limit = 20, enabled = true) {
  return useQuery({
    queryKey: projectKeys.search({ category, page, limit }),
    queryFn: () => projectService.getProjectsByCategory(category, page, limit),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUserProjects(userId?: string, page = 1, limit = 20, enabled = true) {
  return useQuery({
    queryKey: projectKeys.userProjects(userId),
    queryFn: () => projectService.getProjectsByUser(userId, page, limit),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Media upload hooks
export function useUploadProjectImage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      projectId, 
      file, 
      onProgress 
    }: { 
      projectId: string; 
      file: File; 
      onProgress?: (progress: number) => void;
    }) => projectService.uploadProjectImage(projectId, file, onProgress),
    
    onSuccess: (imageUrl: string, { projectId }) => {
      // Update project cache with new image
      const project = queryClient.getQueryData<Project>(projectKeys.project(projectId));
      if (project) {
        const updatedProject = {
          ...project,
          images: [...project.images, imageUrl],
        };
        queryClient.setQueryData(projectKeys.project(projectId), updatedProject);
      }
      
      toast.success('Image uploaded successfully!');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload image');
    },
  });
}

// Donation hooks
export function useMakeDonation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (donation: {
      projectId: string;
      amount: number;
      currency: string;
      message?: string;
      isAnonymous?: boolean;
      transactionHash: string;
    }) => projectService.makeDonation(donation),
    
    onMutate: async (donation) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: projectKeys.project(donation.projectId) });
      
      // Snapshot the previous value
      const previousProject = queryClient.getQueryData<Project>(projectKeys.project(donation.projectId));
      
      // Optimistically update the project
      if (previousProject) {
        const updatedProject = {
          ...previousProject,
          currentFunding: previousProject.currentFunding + donation.amount,
          stats: {
            ...previousProject.stats,
            donorCount: previousProject.stats.donorCount + 1,
            totalDonations: previousProject.stats.totalDonations + donation.amount,
          },
        };
        queryClient.setQueryData(projectKeys.project(donation.projectId), updatedProject);
      }
      
      return { previousProject };
    },
    
    onSuccess: (donationResult: Donation, donation) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: projectKeys.project(donation.projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.donations(donation.projectId) });
      
      toast.success('Donation submitted successfully!');
    },
    
    onError: (error: any, donation, context) => {
      // Rollback optimistic update
      if (context?.previousProject) {
        queryClient.setQueryData(projectKeys.project(donation.projectId), context.previousProject);
      }
      
      toast.error(error.message || 'Failed to process donation');
    },
  });
}

export function useProjectDonations(projectId: string, page = 1, limit = 20, enabled = true) {
  return useQuery({
    queryKey: projectKeys.donations(projectId),
    queryFn: () => projectService.getProjectDonations(projectId, page, limit),
    enabled: enabled && !!projectId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Project following hooks
export function useFollowProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectId: string) => projectService.followProject(projectId),
    
    onMutate: async (projectId: string) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.project(projectId) });
      
      const previousProject = queryClient.getQueryData<Project>(projectKeys.project(projectId));
      
      // Optimistically update follower count
      if (previousProject) {
        const updatedProject = {
          ...previousProject,
          stats: {
            ...previousProject.stats,
            followerCount: previousProject.stats.followerCount + 1,
          },
        };
        queryClient.setQueryData(projectKeys.project(projectId), updatedProject);
      }
      
      return { previousProject };
    },
    
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.project(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.followers(projectId) });
      
      toast.success('Project followed successfully!');
    },
    
    onError: (error: any, projectId, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(projectKeys.project(projectId), context.previousProject);
      }
      
      toast.error(error.message || 'Failed to follow project');
    },
  });
}

export function useUnfollowProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectId: string) => projectService.unfollowProject(projectId),
    
    onMutate: async (projectId: string) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.project(projectId) });
      
      const previousProject = queryClient.getQueryData<Project>(projectKeys.project(projectId));
      
      // Optimistically update follower count
      if (previousProject) {
        const updatedProject = {
          ...previousProject,
          stats: {
            ...previousProject.stats,
            followerCount: Math.max(0, previousProject.stats.followerCount - 1),
          },
        };
        queryClient.setQueryData(projectKeys.project(projectId), updatedProject);
      }
      
      return { previousProject };
    },
    
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.project(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.followers(projectId) });
      
      toast.success('Project unfollowed successfully!');
    },
    
    onError: (error: any, projectId, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(projectKeys.project(projectId), context.previousProject);
      }
      
      toast.error(error.message || 'Failed to unfollow project');
    },
  });
}

export function useProjectFollowers(projectId: string, page = 1, limit = 20, enabled = true) {
  return useQuery({
    queryKey: projectKeys.followers(projectId),
    queryFn: () => projectService.getProjectFollowers(projectId, page, limit),
    enabled: enabled && !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Project analytics
export function useProjectAnalytics(
  projectId: string, 
  period: 'day' | 'week' | 'month' | 'year' = 'month', 
  enabled = true
) {
  return useQuery({
    queryKey: projectKeys.analytics(projectId, period),
    queryFn: () => projectService.getProjectAnalytics(projectId, period),
    enabled: enabled && !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 