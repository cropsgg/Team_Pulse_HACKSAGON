'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { WalletButton } from '@/components/wallet/WalletButton';
import { Wallet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[]; // Ignored now, keeping for compatibility
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredPermissions, // Ignored
  fallback 
}: ProtectedRouteProps) {
  const { isConnected, isLoading } = useAuth();
  const [hasTimedOut, setHasTimedOut] = useState(false);

  // Add timeout for loading state
  useEffect(() => {
    if (isLoading) {
      const timeoutId = setTimeout(() => {
        console.warn('ProtectedRoute loading timeout, showing fallback');
        setHasTimedOut(true);
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeoutId);
    } else {
      setHasTimedOut(false);
    }
  }, [isLoading]);

  // Show loading state (with timeout)
  if (isLoading && !hasTimedOut) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show timeout message if loading took too long
  if (hasTimedOut && !isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Connection Timeout</h2>
          <p className="text-muted-foreground mb-6">
            The wallet connection is taking longer than expected. Please try connecting manually.
          </p>
          <WalletButton size="lg" className="w-full mb-4" />
          <Button 
            variant="ghost" 
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // Show wallet connection prompt if not connected
  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            Please connect your wallet to access this page. Your wallet address will be used as your account ID.
          </p>
          <WalletButton size="lg" className="w-full" />
          {fallback && (
            <div className="mt-6">
              {fallback}
            </div>
          )}
        </div>
      </div>
    );
  }

  // If connected, allow access to everything
  return <>{children}</>;
} 