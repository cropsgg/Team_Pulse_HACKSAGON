'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface BackendStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
}

export function BackendStatusIndicator({ className, showLabel = true }: BackendStatusIndicatorProps) {
  const { backendAvailable, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Badge variant="outline" className={className} title="Checking backend connection...">
        <Clock className="w-3 h-3 mr-1" />
        {showLabel && 'Checking...'}
      </Badge>
    );
  }

  if (backendAvailable) {
    return (
      <Badge 
        variant="default" 
        className={`bg-green-500 hover:bg-green-600 ${className}`}
        title="Backend service is available"
      >
        <CheckCircle className="w-3 h-3 mr-1" />
        {showLabel && 'Online'}
      </Badge>
    );
  }

  return (
    <Badge 
      variant="destructive" 
      className={className}
      title="Backend service is unavailable - Some features may not work properly"
    >
      <AlertCircle className="w-3 h-3 mr-1" />
      {showLabel && 'Offline'}
    </Badge>
  );
} 