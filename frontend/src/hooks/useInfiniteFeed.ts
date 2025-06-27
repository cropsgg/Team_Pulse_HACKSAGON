import { useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { DocumentNode } from 'graphql';

interface UseInfiniteFeedProps {
  query: DocumentNode;
  variables?: Record<string, any>;
  dataKey: string;
  limit?: number;
  enabled?: boolean;
}

interface UseInfiniteFeedResult<T> {
  data: T[];
  loading: boolean;
  error: any;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
}

export const useInfiniteFeed = <T = any>({
  query,
  variables = {},
  dataKey,
  limit = 20,
  enabled = true
}: UseInfiniteFeedProps): UseInfiniteFeedResult<T> => {
  const loadingRef = useRef(false);
  
  const { data, loading, error, fetchMore, refetch } = useQuery(query, {
    variables: {
      ...variables,
      offset: 0,
      limit
    },
    skip: !enabled,
    notifyOnNetworkStatusChange: true
  });

  const items: T[] = data?.[dataKey] || [];
  const hasMore = items.length === limit;

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore || loading) return;

    loadingRef.current = true;
    
    try {
      await fetchMore({
        variables: {
          ...variables,
          offset: items.length,
          limit
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult?.[dataKey]) return prev;
          
          return {
            ...prev,
            [dataKey]: [...prev[dataKey], ...fetchMoreResult[dataKey]]
          };
        }
      });
    } catch (err) {
      console.error('Error loading more items:', err);
    } finally {
      loadingRef.current = false;
    }
  }, [fetchMore, variables, items.length, limit, hasMore, loading, dataKey]);

  return {
    data: items,
    loading,
    error,
    hasMore,
    loadMore,
    refetch
  };
};

export const useIntersectionObserver = (
  callback: () => void,
  options: IntersectionObserverInit = {}
) => {
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          callback();
        }
      },
      {
        threshold: 0.1,
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [callback, options]);

  return elementRef;
};