'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealTimeEvents } from '@/hooks/useRealTimeEvents';
import { useAuth } from '@/hooks/useAuth';

// Data refresh strategies
export enum RefreshStrategy {
  IMMEDIATE = 'immediate',
  DEBOUNCED = 'debounced',
  SCHEDULED = 'scheduled',
  MANUAL = 'manual',
}

// Data types that can be synchronized
export enum DataType {
  USER_PROFILE = 'user_profile',
  NGO_PROFILE = 'ngo_profile',
  DONATIONS = 'donations',
  INVESTMENTS = 'investments',
  MILESTONES = 'milestones',
  GOVERNANCE_PROPOSALS = 'governance_proposals',
  TRANSACTION_HISTORY = 'transaction_history',
}

// Live data configuration
interface LiveDataConfig {
  dataType: DataType;
  queryKey: string[];
  refreshStrategy: RefreshStrategy;
  debounceMs?: number;
  scheduleMs?: number;
  triggerEvents?: string[];
  enabled?: boolean;
  staleTime?: number;
}

export function useLiveData() {
  const { user, walletAddress } = useAuth();
  const { events: realtimeEvents } = useRealTimeEvents();
  const queryClient = useQueryClient();
  
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [refreshCounts, setRefreshCounts] = useState<Record<string, number>>({});
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<Record<string, number>>({});
  
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const scheduleIntervals = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
  
  // Default configurations
  const defaultConfigs: LiveDataConfig[] = [
    {
      dataType: DataType.DONATIONS,
      queryKey: ['donations', walletAddress || ''],
      refreshStrategy: RefreshStrategy.IMMEDIATE,
      triggerEvents: ['DonationMade', 'FundsReleased'],
      enabled: !!user && !!walletAddress,
      staleTime: 30 * 1000,
    },
    {
      dataType: DataType.GOVERNANCE_PROPOSALS,
      queryKey: ['governance', 'proposals'],
      refreshStrategy: RefreshStrategy.DEBOUNCED,
      debounceMs: 3000,
      triggerEvents: ['ProposalCreated', 'VoteCast'],
      enabled: true,
      staleTime: 2 * 60 * 1000,
    },
  ];

  const [managedConfigs] = useState<Map<string, LiveDataConfig>>(
    () => new Map(defaultConfigs.map(config => [config.queryKey.join(':'), config]))
  );

  // Refresh data for specific data type
  const refreshData = useCallback(async (dataType: DataType | DataType[]) => {
    const dataTypes = Array.isArray(dataType) ? dataType : [dataType];
    
    for (const type of dataTypes) {
      const config = Array.from(managedConfigs.values()).find(c => c.dataType === type);
      if (!config?.enabled) continue;

      const queryKey = config.queryKey;
      const configKey = queryKey.join(':');
      
      setRefreshCounts(prev => ({
        ...prev,
        [configKey]: (prev[configKey] || 0) + 1
      }));

      setLastSyncTimestamp(prev => ({
        ...prev,
        [configKey]: Date.now()
      }));

      await queryClient.invalidateQueries({ queryKey });
    }
  }, [managedConfigs, queryClient]);

  // Handle event-triggered refresh
  const handleEventRefresh = useCallback((event: any) => {
    if (!isLiveMode) return;

    const configsToRefresh = Array.from(managedConfigs.values()).filter(config =>
      config.enabled && config.triggerEvents?.includes(event.eventName)
    );

    configsToRefresh.forEach(config => {
      const configKey = config.queryKey.join(':');
      
      switch (config.refreshStrategy) {
        case RefreshStrategy.IMMEDIATE:
          refreshData(config.dataType);
          break;
          
        case RefreshStrategy.DEBOUNCED:
          const existingTimer = debounceTimers.current.get(configKey);
          if (existingTimer) clearTimeout(existingTimer);
          
          const newTimer = setTimeout(() => {
            refreshData(config.dataType);
            debounceTimers.current.delete(configKey);
          }, config.debounceMs || 1000);
          
          debounceTimers.current.set(configKey, newTimer);
          break;
      }
    });
  }, [isLiveMode, managedConfigs, refreshData]);

  // Listen to real-time events
  useEffect(() => {
    if (!realtimeEvents.length) return;
    
    const latestEvent = realtimeEvents[0];
    if (latestEvent) {
      handleEventRefresh(latestEvent);
    }
  }, [realtimeEvents, handleEventRefresh]);

  const toggleLiveMode = useCallback(() => {
    setIsLiveMode(prev => !prev);
  }, []);

  const forceRefreshAll = useCallback(async () => {
    const enabledDataTypes = Array.from(managedConfigs.values())
      .filter(config => config.enabled)
      .map(config => config.dataType);
      
    await refreshData(enabledDataTypes);
  }, [managedConfigs, refreshData]);

  useEffect(() => {
    return () => {
      debounceTimers.current.forEach(timer => clearTimeout(timer));
      scheduleIntervals.current.forEach(interval => clearInterval(interval));
    };
  }, []);

  return {
    isLiveMode,
    refreshCounts,
    refreshData,
    toggleLiveMode,
    forceRefreshAll,
  };
} 