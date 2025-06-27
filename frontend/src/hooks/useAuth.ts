import { useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { useAuthStore } from '@/store/authStore';
import { REFRESH_TOKEN, LOGIN, REGISTER, LOGOUT } from '@/graphql/mutations';
import { toast } from 'react-hot-toast';

export const useAuth = () => {
  const router = useRouter();
  const { accessToken, refreshToken, user, isAuthenticated, login, logout, needsRefresh, setTokens } = useAuthStore();
  
  const [refreshTokenMutation] = useMutation(REFRESH_TOKEN);
  const [loginMutation] = useMutation(LOGIN);
  const [registerMutation] = useMutation(REGISTER);
  const [logoutMutation] = useMutation(LOGOUT);

  const silentRefresh = useCallback(async () => {
    if (!refreshToken) return;
    
    try {
      const { data } = await refreshTokenMutation({
        variables: { refreshToken }
      });
      
      if (data?.refreshToken) {
        setTokens(data.refreshToken.accessToken, data.refreshToken.refreshToken);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      router.push('/login');
    }
  }, [refreshToken, refreshTokenMutation, setTokens, logout, router]);

  useEffect(() => {
    if (isAuthenticated && needsRefresh()) {
      silentRefresh();
    }
  }, [isAuthenticated, needsRefresh, silentRefresh]);

  // Check for token refresh every 60 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      if (needsRefresh()) {
        silentRefresh();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated, needsRefresh, silentRefresh]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: { 
          input: { email, password }
        }
      });
      
      if (data?.login) {
        login(data.login.accessToken, data.login.refreshToken, data.login.user);
        toast.success('Welcome back!');
        return { success: true };
      }
      return { success: false, error: 'Invalid response' };
    } catch (error) {
      const errorMessage = (error as Error).message || 'Login failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (username: string, email: string, password: string, walletAddress?: string) => {
    try {
      const { data } = await registerMutation({
        variables: { 
          input: { username, email, password, walletAddress }
        }
      });
      
      if (data?.register) {
        login(data.register.accessToken, data.register.refreshToken, data.register.user);
        toast.success('Account created successfully!');
        return { success: true };
      }
      return { success: false, error: 'Invalid response' };
    } catch (error) {
      const errorMessage = (error as Error).message || 'Registration failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      if (accessToken) {
        await logoutMutation();
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      logout();
      router.push('/');
      toast.success('Signed out successfully');
    }
  };

  return {
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    silentRefresh
  };
};

export const useAuthGuard = (allowedRoles?: string[]) => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const isAuthorized = useMemo(() => {
    if (!isAuthenticated || !user) return false;
    if (!allowedRoles) return true;
    return allowedRoles.includes(user.role);
  }, [isAuthenticated, user, allowedRoles]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      toast.error('Please sign in to access this page');
    } else if (!isAuthorized) {
      router.push('/dashboard');
      toast.error('You do not have permission to access this page');
    }
  }, [isAuthenticated, isAuthorized, router]);

  return {
    isAuthorized,
    isAuthenticated,
    user
  };
}; 