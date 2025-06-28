'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  userService, 
  User, 
  CreateUserRequest, 
  UpdateUserRequest, 
  UpdatePreferencesRequest,
  UserSearchFilters,
  UserRole,
  AuthResponse
} from '@/lib/api/services/userService';

// Query keys for consistent cache management
export const userKeys = {
  all: ['users'] as const,
  me: () => [...userKeys.all, 'me'] as const,
  user: (id: string) => [...userKeys.all, 'user', id] as const,
  wallet: (address: string) => [...userKeys.all, 'wallet', address] as const,
  search: (filters: UserSearchFilters) => [...userKeys.all, 'search', filters] as const,
  activity: (userId?: string) => [...userKeys.all, 'activity', userId] as const,
  stats: (userId?: string) => [...userKeys.all, 'stats', userId] as const,
  following: (userId?: string) => [...userKeys.all, 'following', userId] as const,
  followers: (userId?: string) => [...userKeys.all, 'followers', userId] as const,
  kyc: () => [...userKeys.all, 'kyc'] as const,
};

// Authentication hooks
export function useSignInWithWallet() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ walletAddress, signature, message }: {
      walletAddress: string;
      signature: string;
      message: string;
    }) => userService.signInWithWallet(walletAddress, signature, message),
    
    onSuccess: (data: AuthResponse) => {
      queryClient.setQueryData(userKeys.me(), data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Failed to sign in');
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => userService.signOut(),
    
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: userKeys.all });
      toast.success('Signed out successfully');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Failed to sign out');
    },
  });
}

// User profile hooks
export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: () => userService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.status === 401) return false;
      return failureCount < 3;
    },
  });
}

export function useUser(userId: string, enabled = true) {
  return useQuery({
    queryKey: userKeys.user(userId),
    queryFn: () => userService.getUserById(userId),
    enabled: enabled && !!userId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useUserByWallet(walletAddress: string, enabled = true) {
  return useQuery({
    queryKey: userKeys.wallet(walletAddress),
    queryFn: () => userService.getUserByWallet(walletAddress),
    enabled: enabled && !!walletAddress,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: CreateUserRequest) => userService.createUser(userData),
    
    onSuccess: (user: User) => {
      queryClient.setQueryData(userKeys.me(), user);
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      
      toast.success('Account created successfully!');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create account');
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: UpdateUserRequest) => userService.updateUser(userData),
    
    onMutate: async (userData: UpdateUserRequest) => {
      await queryClient.cancelQueries({ queryKey: userKeys.me() });
      
      const previousUser = queryClient.getQueryData(userKeys.me());
      
      if (previousUser) {
        queryClient.setQueryData(userKeys.me(), {
          ...previousUser,
          ...userData,
        });
      }
      
      return { previousUser };
    },
    
    onSuccess: (user: User) => {
      queryClient.setQueryData(userKeys.me(), user);
      queryClient.setQueryData(userKeys.user(user.id), user);
      toast.success('Profile updated successfully!');
    },
    
    onError: (error: any, userData, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(userKeys.me(), context.previousUser);
      }
      toast.error(error.message || 'Failed to update profile');
    },
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (preferences: UpdatePreferencesRequest) => userService.updatePreferences(preferences),
    
    onMutate: async (preferences: UpdatePreferencesRequest) => {
      await queryClient.cancelQueries({ queryKey: userKeys.me() });
      
      const previousUser = queryClient.getQueryData<User>(userKeys.me());
      
      if (previousUser) {
        queryClient.setQueryData(userKeys.me(), {
          ...previousUser,
          preferences: {
            ...previousUser.preferences,
            ...preferences,
          },
        });
      }
      
      return { previousUser };
    },
    
    onSuccess: (user: User) => {
      queryClient.setQueryData(userKeys.me(), user);
      toast.success('Preferences updated successfully!');
    },
    
    onError: (error: any, preferences, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(userKeys.me(), context.previousUser);
      }
      toast.error(error.message || 'Failed to update preferences');
    },
  });
}

// Avatar management
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (progress: number) => void }) => 
      userService.uploadAvatar(file, onProgress),
    
    onSuccess: (user: User) => {
      queryClient.setQueryData(userKeys.me(), user);
      queryClient.setQueryData(userKeys.user(user.id), user);
      toast.success('Avatar uploaded successfully!');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload avatar');
    },
  });
}

export function useRemoveAvatar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => userService.removeAvatar(),
    
    onSuccess: (user: User) => {
      queryClient.setQueryData(userKeys.me(), user);
      queryClient.setQueryData(userKeys.user(user.id), user);
      toast.success('Avatar removed successfully!');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove avatar');
    },
  });
}

// User search and discovery
export function useSearchUsers(filters: UserSearchFilters, enabled = true) {
  return useQuery({
    queryKey: userKeys.search(filters),
    queryFn: () => userService.searchUsers(filters),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

export function useUsersByRole(role: UserRole, page = 1, limit = 20, enabled = true) {
  return useQuery({
    queryKey: userKeys.search({ role, page, limit }),
    queryFn: () => userService.getUsersByRole(role, page, limit),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useVerifiedUsers(page = 1, limit = 20, enabled = true) {
  return useQuery({
    queryKey: userKeys.search({ verified: true, page, limit }),
    queryFn: () => userService.getVerifiedUsers(page, limit),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// User activity
export function useUserActivity(userId?: string, page = 1, limit = 20, enabled = true) {
  return useQuery({
    queryKey: userKeys.activity(userId),
    queryFn: () => userService.getUserActivity(userId, page, limit),
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// KYC hooks
export function useSubmitKYC() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (documents: {
      idDocument: File;
      proofOfAddress: File;
      selfie?: File;
    }) => userService.submitKYC(documents),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.kyc() });
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      
      toast.success('KYC documents submitted successfully!');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit KYC documents');
    },
  });
}

export function useKYCStatus() {
  return useQuery({
    queryKey: userKeys.kyc(),
    queryFn: () => userService.getKYCStatus(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// User statistics
export function useUserStats(userId?: string, enabled = true) {
  return useQuery({
    queryKey: userKeys.stats(userId),
    queryFn: () => userService.getUserStats(userId),
    enabled,
    staleTime: 10 * 60 * 1000,
  });
}

// Following/followers
export function useFollowUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => userService.followUser(userId),
    
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.following() });
      queryClient.invalidateQueries({ queryKey: userKeys.followers(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.user(userId) });
      
      toast.success('User followed successfully!');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Failed to follow user');
    },
  });
}

export function useUnfollowUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => userService.unfollowUser(userId),
    
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.following() });
      queryClient.invalidateQueries({ queryKey: userKeys.followers(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.user(userId) });
      
      toast.success('User unfollowed successfully!');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Failed to unfollow user');
    },
  });
}

export function useFollowers(userId?: string, page = 1, limit = 20, enabled = true) {
  return useQuery({
    queryKey: userKeys.followers(userId),
    queryFn: () => userService.getFollowers(userId, page, limit),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useFollowing(userId?: string, page = 1, limit = 20, enabled = true) {
  return useQuery({
    queryKey: userKeys.following(userId),
    queryFn: () => userService.getFollowing(userId, page, limit),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Admin operations
export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) => 
      userService.updateUserRole(userId, role),
    
    onSuccess: (user: User) => {
      queryClient.setQueryData(userKeys.user(user.id), user);
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      
      toast.success('User role updated successfully!');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user role');
    },
  });
}

export function useVerifyUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => userService.verifyUser(userId),
    
    onSuccess: (user: User) => {
      queryClient.setQueryData(userKeys.user(user.id), user);
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      
      toast.success('User verified successfully!');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Failed to verify user');
    },
  });
} 