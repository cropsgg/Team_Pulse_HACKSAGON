'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowUpRight, 
  ArrowDownRight,
  Eye,
  Heart,
  Users,
  DollarSign,
  Target,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { chartUtils } from './BaseChart';

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period: string;
  };
  icon?: 'eye' | 'heart' | 'users' | 'dollar' | 'target' | 'award';
  loading?: boolean;
  error?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  description?: string;
  target?: {
    value: number;
    label: string;
  };
}

export function MetricsCard({
  title,
  value,
  change,
  icon,
  loading,
  error,
  className,
  size = 'md',
  variant = 'default',
  description,
  target,
}: MetricsCardProps) {
  const getIcon = () => {
    const iconClasses = cn(
      'transition-colors',
      size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6'
    );

    switch (icon) {
      case 'eye':
        return <Eye className={iconClasses} />;
      case 'heart':
        return <Heart className={iconClasses} />;
      case 'users':
        return <Users className={iconClasses} />;
      case 'dollar':
        return <DollarSign className={iconClasses} />;
      case 'target':
        return <Target className={iconClasses} />;
      case 'award':
        return <Award className={iconClasses} />;
      default:
        return null;
    }
  };

  const getTrendIcon = () => {
    if (!change) return null;
    
    const iconClasses = 'h-3 w-3';
    
    switch (change.type) {
      case 'increase':
        return <ArrowUpRight className={cn(iconClasses, 'text-green-500')} />;
      case 'decrease':
        return <ArrowDownRight className={cn(iconClasses, 'text-red-500')} />;
      case 'neutral':
        return <Minus className={cn(iconClasses, 'text-gray-500')} />;
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return {
          card: 'border-green-200 bg-green-50/50',
          icon: 'text-green-600',
          value: 'text-green-900',
        };
      case 'warning':
        return {
          card: 'border-yellow-200 bg-yellow-50/50',
          icon: 'text-yellow-600',
          value: 'text-yellow-900',
        };
      case 'danger':
        return {
          card: 'border-red-200 bg-red-50/50',
          icon: 'text-red-600',
          value: 'text-red-900',
        };
      case 'info':
        return {
          card: 'border-blue-200 bg-blue-50/50',
          icon: 'text-blue-600',
          value: 'text-blue-900',
        };
      default:
        return {
          card: '',
          icon: 'text-gray-600',
          value: 'text-gray-900',
        };
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

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantClasses = getVariantClasses();

  if (loading) {
    return (
      <Card className={cn('w-full', variantClasses.card, className)}>
        <CardContent className={sizeClasses[size]}>
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-10 w-10 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('w-full border-destructive/50', className)}>
        <CardContent className={sizeClasses[size]}>
          <div className="flex items-center justify-center text-center">
            <div>
              <p className="text-sm font-medium text-destructive">{title}</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate target progress if target is provided
  const targetProgress = target && typeof value === 'number' 
    ? Math.min((value / target.value) * 100, 100) 
    : null;

  return (
    <Card className={cn('w-full transition-all hover:shadow-md', variantClasses.card, className)}>
      <CardContent className={sizeClasses[size]}>
        <div className="flex items-center justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              {icon && (
                <div className={cn('rounded p-1', variantClasses.icon)}>
                  {getIcon()}
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <p className={cn(
                'font-bold',
                size === 'sm' ? 'text-xl' : size === 'md' ? 'text-2xl' : 'text-3xl',
                variantClasses.value
              )}>
                {typeof value === 'number' ? chartUtils.formatCompactNumber(value) : value}
              </p>
              
              {description && (
                <p className="text-xs text-gray-500">{description}</p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              {change && (
                <Badge 
                  variant="outline" 
                  className={cn('flex items-center gap-1 text-xs', getTrendColor())}
                >
                  {getTrendIcon()}
                  <span>
                    {Math.abs(change.value)}% {change.period}
                  </span>
                </Badge>
              )}
              
              {target && targetProgress !== null && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${targetProgress}%` }}
                    />
                  </div>
                  <span>{Math.round(targetProgress)}% of {target.label}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Preset metric cards for common use cases
export function DonationMetrics({ amount, count, loading }: { 
  amount: number; 
  count: number; 
  loading?: boolean; 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MetricsCard
        title="Total Donations"
        value={chartUtils.formatCurrency(amount)}
        icon="dollar"
        variant="success"
        loading={loading}
      />
      <MetricsCard
        title="Donors"
        value={count}
        icon="users"
        variant="info"
        loading={loading}
      />
    </div>
  );
}

export function ProjectMetrics({ 
  views, 
  followers, 
  funding, 
  goal, 
  loading 
}: { 
  views: number; 
  followers: number; 
  funding: number; 
  goal: number; 
  loading?: boolean; 
}) {
  const fundingProgress = goal > 0 ? (funding / goal) * 100 : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricsCard
        title="Views"
        value={views}
        icon="eye"
        loading={loading}
      />
      <MetricsCard
        title="Followers"
        value={followers}
        icon="heart"
        loading={loading}
      />
      <MetricsCard
        title="Funding"
        value={chartUtils.formatCurrency(funding)}
        icon="dollar"
        variant="success"
        target={{
          value: goal,
          label: 'goal'
        }}
        loading={loading}
      />
      <MetricsCard
        title="Progress"
        value={`${Math.round(fundingProgress)}%`}
        icon="target"
        variant={fundingProgress >= 100 ? 'success' : fundingProgress >= 75 ? 'warning' : 'default'}
        loading={loading}
      />
    </div>
  );
} 