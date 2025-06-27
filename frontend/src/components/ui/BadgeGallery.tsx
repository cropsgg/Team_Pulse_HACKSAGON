'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@apollo/client';
import { Badge } from './badge';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { GridSkeleton } from './LoadingSkeletons';
import { GET_MY_BADGES } from '@/graphql/queries';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface SBTBadge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  metadata: Record<string, any>;
  earnedAt: string;
}

interface BadgeGalleryProps {
  className?: string;
  showHeader?: boolean;
  maxDisplay?: number;
  variant?: 'grid' | 'carousel' | 'compact';
}

export const BadgeGallery: React.FC<BadgeGalleryProps> = ({
  className,
  showHeader = true,
  maxDisplay,
  variant = 'grid'
}) => {
  const { data, loading, error } = useQuery(GET_MY_BADGES);
  
  const badges: SBTBadge[] = data?.me?.badges || [];
  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges;

  const getRarityColor = (metadata: Record<string, any>) => {
    const rarity = metadata?.rarity?.toLowerCase();
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-400 to-yellow-600';
      case 'epic':
        return 'from-purple-400 to-purple-600';
      case 'rare':
        return 'from-blue-400 to-blue-600';
      case 'uncommon':
        return 'from-green-400 to-green-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBadgeVariant = (metadata: Record<string, any>) => {
    const rarity = metadata?.rarity?.toLowerCase();
    switch (rarity) {
      case 'legendary':
        return 'secondary';
      case 'epic':
        return 'secondary';
      case 'rare':
        return 'secondary';
      case 'uncommon':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return <GridSkeleton count={6} />;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">Error loading badges</p>
      </div>
    );
  }

  if (!badges.length) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No Badges Yet</h3>
          <p className="text-muted-foreground text-sm">
            Start contributing to earn your first achievement badge!
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderBadge = (badge: SBTBadge, index: number) => (
    <motion.div
      key={badge.id}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="group cursor-pointer"
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105">
        <CardContent className="p-4">
          <div className="relative mb-4">
            <div
              className={cn(
                'w-16 h-16 mx-auto rounded-full bg-gradient-to-br p-1',
                getRarityColor(badge.metadata)
              )}
            >
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                {badge.imageUrl ? (
                  <img
                    src={badge.imageUrl}
                    alt={badge.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-xl">🏆</span>
                  </div>
                )}
              </div>
            </div>
            {badge.metadata?.rarity && (
              <div className="absolute -top-1 -right-1">
                <Badge variant={getRarityBadgeVariant(badge.metadata)} className="text-xs">
                  {badge.metadata.rarity}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="text-center space-y-2">
            <h4 className="font-semibold text-sm truncate">{badge.name}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {badge.description}
            </p>
            <p className="text-xs text-muted-foreground">
              Earned {formatDistanceToNow(new Date(badge.earnedAt), { addSuffix: true })}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {displayBadges.map((badge, index) => (
          <div
            key={badge.id}
            className={cn(
              'w-8 h-8 rounded-full bg-gradient-to-br p-0.5',
              getRarityColor(badge.metadata)
            )}
            title={badge.name}
          >
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
              {badge.imageUrl ? (
                <img
                  src={badge.imageUrl}
                  alt={badge.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <span className="text-xs">🏆</span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'carousel') {
    return (
      <div className={cn('overflow-x-auto', className)}>
        <div className="flex space-x-4 pb-4">
          {displayBadges.map((badge, index) => (
            <div key={badge.id} className="flex-shrink-0 w-32">
              {renderBadge(badge, index)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Achievement Badges</h3>
          <Badge variant="outline">{badges.length} earned</Badge>
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displayBadges.map((badge, index) => renderBadge(badge, index))}
      </div>
      
      {maxDisplay && badges.length > maxDisplay && (
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            +{badges.length - maxDisplay} more badges
          </p>
        </div>
      )}
    </div>
  );
}; 