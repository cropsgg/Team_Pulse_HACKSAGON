'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { useCurrentUser, useSignInWithWallet, useSignOut } from '@/hooks/api/useUserApi';
import { toast } from 'sonner';

export function useAuth() {
  const { address, isConnected, isConnecting } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [lastHealthCheck, setLastHealthCheck] = useState(0);
  
  // API hooks with error handling
  const { data: user, isLoading: isLoadingUser, refetch: refetchUser, error: userError } = useCurrentUser();
  const signInMutation = useSignInWithWallet();
  const signOutMutation = useSignOut();

  // Check if backend is available based on errors
  useEffect(() => {
    const now = Date.now();
    if (userError && now - lastHealthCheck > 30000) { // Check every 30 seconds
      const isNetworkError = userError.message?.includes('Network Error') || 
                           userError.message?.includes('ECONNREFUSED') ||
                           userError.status === undefined;
      
      if (isNetworkError) {
        setBackendAvailable(false);
        if (now - lastHealthCheck > 60000) { // Show toast only once per minute
          toast.error('Backend service is unavailable. Some features may not work properly.');
          setLastHealthCheck(now);
        }
      }
    } else if (!userError && !backendAvailable) {
      setBackendAvailable(true);
      toast.success('Backend service is now available.');
    }
  }, [userError, backendAvailable, lastHealthCheck]);

  // Authentication state
  const isAuthenticated = useMemo(() => {
    // If backend is unavailable, consider wallet connection as basic auth
    if (!backendAvailable) {
      return isConnected && !!address;
    }
    return isConnected && !!user && !!address;
  }, [isConnected, user, address, backendAvailable]);

  const isLoading = useMemo(() => {
    return isConnecting || (backendAvailable && isLoadingUser) || signInMutation.isPending;
  }, [isConnecting, isLoadingUser, signInMutation.isPending, backendAvailable]);

  // Sign in with wallet
  const signIn = useCallback(async () => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet first');
      return false;
    }

    // If backend is unavailable, skip API authentication
    if (!backendAvailable) {
      toast.info('Using wallet-only authentication (backend unavailable)');
      return true;
    }

    try {
      // Generate message to sign
      const message = `Sign in to ImpactChain with your wallet.\n\nWallet: ${address}\nTimestamp: ${Date.now()}`;
      
      // Request signature
      const signature = await signMessageAsync({
        message,
      });

      // Authenticate with backend
      await signInMutation.mutateAsync({
        walletAddress: address,
        signature,
        message,
      });

      // Refetch user data
      await refetchUser();
      
      return true;
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Check if it's a network error
      const isNetworkError = error.message?.includes('Network Error') || 
                           error.message?.includes('ECONNREFUSED');
      
      if (isNetworkError) {
        setBackendAvailable(false);
        toast.info('Backend unavailable. Using wallet-only authentication.');
        return true; // Allow wallet-only auth
      }
      
      if (error.name === 'UserRejectedRequestError') {
        toast.error('Signature rejected by user');
      } else {
        toast.error(error.message || 'Failed to sign in');
      }
      
      return false;
    }
  }, [address, isConnected, signMessageAsync, signInMutation, refetchUser, backendAvailable]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      if (backendAvailable) {
        await signOutMutation.mutateAsync();
      }
      disconnect();
    } catch (error) {
      console.error('Sign out error:', error);
      // Still disconnect wallet even if API call fails
      disconnect();
    }
  }, [signOutMutation, disconnect, backendAvailable]);

  // Auto-authenticate when wallet connects (only if backend is available)
  useEffect(() => {
    if (isConnected && address && !user && !isLoadingUser && backendAvailable) {
      // Check if user exists in backend, if not prompt for registration
      signIn();
    }
  }, [isConnected, address, user, isLoadingUser, signIn, backendAvailable]);

  // Handle wallet disconnect
  useEffect(() => {
    if (!isConnected && user && backendAvailable) {
      // Clear user data when wallet disconnects
      signOutMutation.mutate();
    }
  }, [isConnected, user, signOutMutation, backendAvailable]);

  return {
    // State
    user: backendAvailable ? user : null,
    isAuthenticated,
    isLoading,
    isConnected,
    address,
    backendAvailable,
    
    // Actions
    signIn,
    signOut,
    refetchUser,
    
    // Derived state
    userRole: user?.role,
    isVerified: user?.isVerified,
    walletAddress: address,
    
    // Loading states
    isSigningIn: signInMutation.isPending,
    isSigningOut: signOutMutation.isPending,
  };
} 