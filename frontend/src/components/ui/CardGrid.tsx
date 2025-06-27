'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentNode } from 'graphql';
import { useInfiniteFeed, useIntersectionObserver } from '@/hooks/useInfiniteFeed';
import { GridSkeleton } from './LoadingSkeletons';
import { cn } from '@/lib/utils';

interface CardGridProps<T = any> {
  query?: DocumentNode;
  dataEndpoint?: string;
  variables?: Record<string, any>;
  data?: T[];
  loading?: boolean;
  error?: any;
  renderCard: (item: T, index: number) => React.ReactNode;
  getItemKey?: (item: T, index: number) => string | number;
  columns?: {
    base?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
  emptyMessage?: string;
  loadingCount?: number;
  enableInfiniteScroll?: boolean;
  staggerChildren?: boolean;
  animationDelay?: number;
}

export const CardGrid = <T,>({
  query,
  dataEndpoint = 'items',
  variables,
  data: externalData,
  loading: externalLoading,
  error: externalError,
  renderCard,
  getItemKey = (item: any, index: number) => item?.id || index,
  columns = {
    base: 1,
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4
  },
  gap = 6,
  className,
  emptyMessage = 'No items found',
  loadingCount = 6,
  enableInfiniteScroll = true,
  staggerChildren = true,
  animationDelay = 0.1
}: CardGridProps<T>) => {
  const {
    data: infiniteData,
    loading: infiniteLoading,
    error: infiniteError,
    hasMore,
    loadMore
  } = useInfiniteFeed<T>({
    query: query!,
    variables,
    dataKey: dataEndpoint,
    enabled: !!query
  });

  const loadMoreRef = useIntersectionObserver(() => {
    if (enableInfiniteScroll && hasMore && !infiniteLoading) {
      loadMore();
    }
  });

  // Use external data if provided, otherwise use infinite feed data
  const data = externalData || infiniteData;
  const loading = externalLoading !== undefined ? externalLoading : infiniteLoading;
  const error = externalError || infiniteError;

  const gridCols = {
    'grid-cols-1': columns.base === 1,
    'grid-cols-2': columns.base === 2,
    'grid-cols-3': columns.base === 3,
    'grid-cols-4': columns.base === 4,
    'sm:grid-cols-1': columns.sm === 1,
    'sm:grid-cols-2': columns.sm === 2,
    'sm:grid-cols-3': columns.sm === 3,
    'sm:grid-cols-4': columns.sm === 4,
    'md:grid-cols-1': columns.md === 1,
    'md:grid-cols-2': columns.md === 2,
    'md:grid-cols-3': columns.md === 3,
    'md:grid-cols-4': columns.md === 4,
    'lg:grid-cols-1': columns.lg === 1,
    'lg:grid-cols-2': columns.lg === 2,
    'lg:grid-cols-3': columns.lg === 3,
    'lg:grid-cols-4': columns.lg === 4,
    'lg:grid-cols-5': columns.lg === 5,
    'lg:grid-cols-6': columns.lg === 6,
    'xl:grid-cols-1': columns.xl === 1,
    'xl:grid-cols-2': columns.xl === 2,
    'xl:grid-cols-3': columns.xl === 3,
    'xl:grid-cols-4': columns.xl === 4,
    'xl:grid-cols-5': columns.xl === 5,
    'xl:grid-cols-6': columns.xl === 6,
  };

  const gapClass = `gap-${gap}`;

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-center">
        <div className="space-y-2">
          <p className="text-red-500 font-medium">Error loading data</p>
          <p className="text-sm text-muted-foreground">
            {error.message || 'Something went wrong'}
          </p>
        </div>
      </div>
    );
  }

  if (loading && !data?.length) {
    return <GridSkeleton count={loadingCount} />;
  }

  if (!data?.length) {
    return (
      <div className="flex items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        className={cn(
          'grid',
          gapClass,
          gridCols,
          className
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence>
          {data.map((item, index) => (
            <motion.div
              key={getItemKey(item, index)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.4,
                delay: staggerChildren ? index * animationDelay : 0
              }}
            >
              {renderCard(item, index)}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Infinite scroll trigger */}
      {enableInfiniteScroll && hasMore && (
        <div ref={loadMoreRef} className="flex justify-center p-4">
          {infiniteLoading && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          )}
        </div>
      )}
    </div>
  );
};

export default CardGrid; 