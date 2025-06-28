'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BaseChartProps {
  title: string;
  description?: string;
  value?: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period: string;
  };
  loading?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function BaseChart({
  title,
  description,
  value,
  change,
  loading,
  error,
  children,
  className,
  headerActions,
  size = 'md',
}: BaseChartProps) {
  const sizeClasses = {
    sm: 'h-64',
    md: 'h-80',
    lg: 'h-96',
  };

  if (loading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            {headerActions && <div>{headerActions}</div>}
          </div>
        </CardHeader>
        <CardContent>
          <div className={cn('w-full', sizeClasses[size])}>
            <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('w-full border-destructive/50', className)}>
        <CardHeader className="pb-4">
          <CardTitle className="text-destructive">{title}</CardTitle>
          <CardDescription>Failed to load chart data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn('flex items-center justify-center text-muted-foreground', sizeClasses[size])}>
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = () => {
    if (!change) return null;
    
    switch (change.type) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'neutral':
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    if (!change) return '';
    
    switch (change.type) {
      case 'increase':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'decrease':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'neutral':
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">{title}</CardTitle>
            {description && (
              <CardDescription className="text-sm">{description}</CardDescription>
            )}
          </div>
          {headerActions && <div>{headerActions}</div>}
        </div>
        
        {(value || change) && (
          <div className="flex items-center gap-4 pt-2">
            {value && (
              <div className="text-2xl font-bold">{value}</div>
            )}
            {change && (
              <Badge 
                variant="outline" 
                className={cn('flex items-center gap-1', getTrendColor())}
              >
                {getTrendIcon()}
                <span className="text-xs">
                  {Math.abs(change.value)}% {change.period}
                </span>
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className={cn('w-full', sizeClasses[size])}>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

// Chart color palette for consistent theming
export const chartColors = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  light: '#64748b',
  dark: '#1e293b',
} as const;

// Chart theme configuration
export const chartTheme = {
  grid: {
    stroke: '#f1f5f9',
    strokeDasharray: '3 3',
  },
  axis: {
    stroke: '#64748b',
    fontSize: 12,
    fontFamily: 'inherit',
  },
  tooltip: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  },
} as const;

// Common chart data transformers
export const chartUtils = {
  formatCurrency: (value: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  },

  formatNumber: (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  },

  formatPercent: (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  },

  formatCompactNumber: (value: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  },

  generateDateRange: (days: number): string[] => {
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  },

  calculatePercentageChange: (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  },

  getTrendType: (change: number): 'increase' | 'decrease' | 'neutral' => {
    if (change > 0) return 'increase';
    if (change < 0) return 'decrease';
    return 'neutral';
  },
}; 