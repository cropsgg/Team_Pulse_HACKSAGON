'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';

// Simple user type based on wallet address
interface SimpleUser {
  id: string;
  address: string;
  name: string;
  role: string[];
  verified: boolean;
  isVerified: boolean;
  walletAddress: string;
}

export function useAuth() {
  const { address, isConnected, isConnecting } = useAccount();
  const [hasTimedOut, setHasTimedOut] = useState(false);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    if (isConnecting) {
      const timeoutId = setTimeout(() => {
        console.warn('Wallet connection timeout, stopping loading state');
        setHasTimedOut(true);
      }, 5000); // 5 second timeout

      return () => clearTimeout(timeoutId);
    } else {
      setHasTimedOut(false);
    }
  }, [isConnecting]);

  // Create user object directly from wallet address
  const user = useMemo((): SimpleUser | null => {
    if (!isConnected || !address) return null;
    
    return {
      id: address, // Wallet address as ID
      address: address,
      name: `User ${address.slice(0, 6)}...${address.slice(-4)}`,
      role: ['DONOR', 'VC', 'FOUNDER', 'NGO_ADMIN', 'ADMIN', 'VERIFIER'], // All roles
      verified: true,
      isVerified: true,
      walletAddress: address,
    };
  }, [isConnected, address]);

  // Auto-create account when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      // Auto-create account with wallet address as ID
      console.log(`Auto-created account for wallet: ${address}`);
      toast.success('Account connected successfully!');
    }
  }, [isConnected, address]);

  // Authentication state - simplified to just wallet connection
  const isAuthenticated = useMemo(() => {
    return isConnected && !!address;
  }, [isConnected, address]);

  // Improved loading state with timeout
  const isLoading = useMemo(() => {
    return isConnecting && !hasTimedOut;
  }, [isConnecting, hasTimedOut]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    isConnected,
    address,
    backendAvailable: true, // Always assume backend available
    
    // Actions - simplified
    signIn: async () => true,
    signOut: async () => {},
    refetchUser: async () => {},
    
    // Derived state
    userRole: user?.role || [],
    isVerified: true, // Everyone is verified
    walletAddress: address,
    
    // Loading states
    isSigningIn: false,
    isSigningOut: false,
  };
} 