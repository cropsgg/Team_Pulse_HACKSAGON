'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/api/services/userService';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: UserRole[];
  fallbackComponent?: ReactNode;
  redirectTo?: string;
  showFallback?: boolean;
}

export function ProtectedRoute({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  fallbackComponent,
  redirectTo = '/login',
  showFallback = true,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    userRole,
    signIn,
    isConnected 
  } = useAuth();

  // Simple permission check based on user role
  const hasRequiredPermissions = requiredPermissions.length === 0 || 
    (user && user.role);

  // Check if user has required roles
  const hasRequiredRoles = requiredRoles.length === 0 || 
    (userRole && requiredRoles.includes(userRole));

  // Combined authorization check
  const isAuthorized = hasRequiredPermissions && hasRequiredRoles;

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !redirectTo.includes('/login')) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    if (showFallback) {
      return (
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                You need to connect your wallet and sign in to access this page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isConnected ? (
                <p className="text-sm text-muted-foreground text-center">
                  Please connect your wallet first from the header.
                </p>
              ) : (
                <div className="space-y-4">
                  <Button 
                    onClick={() => signIn()}
                    className="w-full"
                  >
                    Sign In with Wallet
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    This will not cost any gas fees. It's just for authentication.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }
    return fallbackComponent || null;
  }

  // Not authorized (authenticated but lacks permissions/roles)
  if (!isAuthorized) {
    if (showFallback) {
      return (
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You don't have permission to access this page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Your Role:</strong> {userRole}</p>
                {requiredRoles.length > 0 && (
                  <p><strong>Required Roles:</strong> {requiredRoles.join(', ')}</p>
                )}
                {requiredPermissions.length > 0 && (
                  <p><strong>Required Permissions:</strong> {requiredPermissions.join(', ')}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Go Back
                </Button>
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="flex-1"
                >
                  Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    return fallbackComponent || null;
  }

  // All checks passed - render children
  return <>{children}</>;
}

// Higher-order component for easier usage
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  protectionOptions: Omit<ProtectedRouteProps, 'children'>
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...protectionOptions}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Predefined protection levels for common use cases
export const ProtectionLevels = {
  // Anyone can access (just needs wallet connection)
  PUBLIC: {
    requiredPermissions: [],
    requiredRoles: [],
  },
  
  // Authenticated users only
  AUTHENTICATED: {
    requiredPermissions: ['view_public'],
    requiredRoles: [],
  },
  
  // Donors and above
  DONOR: {
    requiredPermissions: ['donate'],
    requiredRoles: [UserRole.DONOR, UserRole.NGO_ADMIN, UserRole.VC, UserRole.ADMIN],
  },
  
  // NGO administrators only
  NGO_ADMIN: {
    requiredPermissions: ['manage_ngo_profile'],
    requiredRoles: [UserRole.NGO_ADMIN, UserRole.ADMIN],
  },
  
  // VC users only
  VC: {
    requiredPermissions: ['invest'],
    requiredRoles: [UserRole.VC, UserRole.ADMIN],
  },
  
  // Startup founders only
  FOUNDER: {
    requiredPermissions: ['create_startup'],
    requiredRoles: [UserRole.FOUNDER, UserRole.ADMIN],
  },
  
  // Admin only
  ADMIN: {
    requiredPermissions: ['*'],
    requiredRoles: [UserRole.ADMIN],
  },
  
  // Verifiers
  VERIFIER: {
    requiredPermissions: ['verify_projects'],
    requiredRoles: [UserRole.VERIFIER, UserRole.ADMIN],
  },
} as const; 