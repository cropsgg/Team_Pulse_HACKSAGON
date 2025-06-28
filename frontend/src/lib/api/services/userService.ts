import { apiClient, ApiResponse } from '../client';

// User types
export interface User {
  id: string;
  walletAddress: string;
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
  role: UserRole;
  roles: UserRole[];
  isVerified: boolean;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'not_submitted';
  socialLinks?: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
    privacy: {
      showEmail: boolean;
      showWallet: boolean;
      showActivity: boolean;
    };
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
  stats: {
    totalDonated: number;
    totalReceived: number;
    projectsCreated: number;
    projectsSupported: number;
    reputation: number;
  };
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export enum UserRole {
  DONOR = 'DONOR',
  NGO_ADMIN = 'NGO_ADMIN',
  VC = 'VC',
  FOUNDER = 'FOUNDER',
  ADMIN = 'ADMIN',
  VERIFIER = 'VERIFIER',
}

export interface CreateUserRequest {
  walletAddress: string;
  name: string;
  email?: string;
  role: UserRole;
  signature: string;
  message: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  bio?: string;
  avatar?: string;
  socialLinks?: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface UpdatePreferencesRequest {
  notifications?: {
    email?: boolean;
    push?: boolean;
    inApp?: boolean;
  };
  privacy?: {
    showEmail?: boolean;
    showWallet?: boolean;
    showActivity?: boolean;
  };
  theme?: 'light' | 'dark' | 'system';
  language?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface UserSearchFilters {
  role?: UserRole;
  verified?: boolean;
  search?: string;
  sortBy?: 'createdAt' | 'reputation' | 'totalDonated' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'donation' | 'investment' | 'project_created' | 'vote_cast' | 'milestone_completed';
  description: string;
  metadata: Record<string, any>;
  createdAt: string;
}

class UserService {
  // Authentication
  async signInWithWallet(walletAddress: string, signature: string, message: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/wallet', {
      walletAddress,
      signature,
      message,
    });
    
    // Store tokens
    apiClient.setTokens(response.data.accessToken, response.data.refreshToken);
    
    return response.data;
  }

  async signOut(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      apiClient.clearTokens();
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/refresh');
    
    // Update stored tokens
    apiClient.setTokens(response.data.accessToken, response.data.refreshToken);
    
    return response.data;
  }

  // User profile management
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  }

  async getUserById(userId: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${userId}`);
    return response.data;
  }

  async getUserByWallet(walletAddress: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/wallet/${walletAddress}`);
    return response.data;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<User>('/users', userData);
    return response.data;
  }

  async updateUser(userData: UpdateUserRequest): Promise<User> {
    const response = await apiClient.patch<User>('/users/me', userData);
    return response.data;
  }

  async updatePreferences(preferences: UpdatePreferencesRequest): Promise<User> {
    const response = await apiClient.patch<User>('/users/me/preferences', preferences);
    return response.data;
  }

  async deleteUser(): Promise<void> {
    await apiClient.delete('/users/me');
    apiClient.clearTokens();
  }

  // Avatar management
  async uploadAvatar(file: File, onProgress?: (progress: number) => void): Promise<User> {
    const response = await apiClient.uploadFile<User>('/users/me/avatar', file, onProgress);
    return response.data;
  }

  async removeAvatar(): Promise<User> {
    const response = await apiClient.delete<User>('/users/me/avatar');
    return response.data;
  }

  // User search and discovery
  async searchUsers(filters: UserSearchFilters = {}): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await apiClient.get<{
      users: User[];
      total: number;
      page: number;
      totalPages: number;
    }>('/users/search', {
      params: filters,
    });
    return response.data;
  }

  async getUsersByRole(role: UserRole, page = 1, limit = 20): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.searchUsers({ role, page, limit });
  }

  async getVerifiedUsers(page = 1, limit = 20): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.searchUsers({ verified: true, page, limit });
  }

  // User activity
  async getUserActivity(userId?: string, page = 1, limit = 20): Promise<{
    activities: UserActivity[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const endpoint = userId ? `/users/${userId}/activity` : '/users/me/activity';
    const response = await apiClient.get<{
      activities: UserActivity[];
      total: number;
      page: number;
      totalPages: number;
    }>(endpoint, {
      params: { page, limit },
    });
    return response.data;
  }

  // KYC and verification
  async submitKYC(documents: {
    idDocument: File;
    proofOfAddress: File;
    selfie?: File;
  }): Promise<void> {
    const formData = new FormData();
    formData.append('idDocument', documents.idDocument);
    formData.append('proofOfAddress', documents.proofOfAddress);
    if (documents.selfie) {
      formData.append('selfie', documents.selfie);
    }

    await apiClient.post('/users/me/kyc', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async getKYCStatus(): Promise<{
    status: 'pending' | 'approved' | 'rejected' | 'not_submitted';
    submittedAt?: string;
    reviewedAt?: string;
    reason?: string;
  }> {
    const response = await apiClient.get<{
      status: 'pending' | 'approved' | 'rejected' | 'not_submitted';
      submittedAt?: string;
      reviewedAt?: string;
      reason?: string;
    }>('/users/me/kyc/status');
    return response.data;
  }

  // User statistics
  async getUserStats(userId?: string): Promise<{
    totalDonated: number;
    totalReceived: number;
    projectsCreated: number;
    projectsSupported: number;
    reputation: number;
    monthlyDonations: Array<{ month: string; amount: number }>;
    topCategories: Array<{ category: string; amount: number }>;
  }> {
    const endpoint = userId ? `/users/${userId}/stats` : '/users/me/stats';
    const response = await apiClient.get<{
      totalDonated: number;
      totalReceived: number;
      projectsCreated: number;
      projectsSupported: number;
      reputation: number;
      monthlyDonations: Array<{ month: string; amount: number }>;
      topCategories: Array<{ category: string; amount: number }>;
    }>(endpoint);
    return response.data;
  }

  // Role management (admin only)
  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${userId}/role`, { role });
    return response.data;
  }

  async verifyUser(userId: string): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${userId}/verify`);
    return response.data;
  }

  async unverifyUser(userId: string): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${userId}/unverify`);
    return response.data;
  }

  // Follow/unfollow functionality
  async followUser(userId: string): Promise<void> {
    await apiClient.post(`/users/${userId}/follow`);
  }

  async unfollowUser(userId: string): Promise<void> {
    await apiClient.delete(`/users/${userId}/follow`);
  }

  async getFollowers(userId?: string, page = 1, limit = 20): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const endpoint = userId ? `/users/${userId}/followers` : '/users/me/followers';
    const response = await apiClient.get<{
      users: User[];
      total: number;
      page: number;
      totalPages: number;
    }>(endpoint, {
      params: { page, limit },
    });
    return response.data;
  }

  async getFollowing(userId?: string, page = 1, limit = 20): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const endpoint = userId ? `/users/${userId}/following` : '/users/me/following';
    const response = await apiClient.get<{
      users: User[];
      total: number;
      page: number;
      totalPages: number;
    }>(endpoint, {
      params: { page, limit },
    });
    return response.data;
  }

  // Reputation system
  async updateReputation(userId: string, score: number, reason: string): Promise<void> {
    await apiClient.post(`/users/${userId}/reputation`, {
      score,
      reason,
    });
  }

  async getReputationHistory(userId?: string): Promise<Array<{
    id: string;
    score: number;
    reason: string;
    createdAt: string;
    createdBy: string;
  }>> {
    const endpoint = userId ? `/users/${userId}/reputation/history` : '/users/me/reputation/history';
    const response = await apiClient.get<Array<{
      id: string;
      score: number;
      reason: string;
      createdAt: string;
      createdBy: string;
    }>>(endpoint);
    return response.data;
  }

  // Blocking/reporting
  async blockUser(userId: string): Promise<void> {
    await apiClient.post(`/users/${userId}/block`);
  }

  async unblockUser(userId: string): Promise<void> {
    await apiClient.delete(`/users/${userId}/block`);
  }

  async reportUser(userId: string, reason: string, description?: string): Promise<void> {
    await apiClient.post(`/users/${userId}/report`, {
      reason,
      description,
    });
  }

  async getBlockedUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users/me/blocked');
    return response.data;
  }
}

// Create singleton instance
export const userService = new UserService(); 