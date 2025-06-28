'use client';

import { useState, useEffect } from 'react';
import { useRealTimeEvents } from '@/hooks/useRealTimeEvents';
import { useLiveData } from '@/hooks/useLiveData';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity,
  Wifi, 
  WifiOff,
  Database,
  Bell,
  Zap,
  Users,
  TrendingUp,
  Pause,
  Play,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveStatusWidgetProps {
  className?: string;
  compact?: boolean;
}

export function LiveStatusWidget({ className, compact = false }: LiveStatusWidgetProps) {
  const { isAuthenticated } = useAuth();
  const { events, isListening, totalEvents, recentEvents } = useRealTimeEvents();
  const { isLiveMode, refreshCounts, toggleLiveMode, forceRefreshAll } = useLiveData();
  const { unreadCount, urgentNotifications } = useNotifications();
  
  const [lastActivity, setLastActivity] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(true);

  // Update last activity when new events come in
  useEffect(() => {
    if (recentEvents.length > 0) {
      setLastActivity(Date.now());
    }
  }, [recentEvents]);

  // Connection health check (simplified)
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(navigator.onLine);
    };

    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);
    
    const interval = setInterval(checkConnection, 5000);

    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
      clearInterval(interval);
    };
  }, []);

  // Get status indicators
  const getConnectionStatus = () => {
    if (!isConnected) {
      return {
        color: 'text-red-500',
        bgColor: 'bg-red-100',
        icon: <WifiOff className="w-3 h-3" />,
        label: 'Offline',
        variant: 'destructive' as const,
      };
    }
    
    if (!isListening) {
      return {
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100',
        icon: <Pause className="w-3 h-3" />,
        label: 'Paused',
        variant: 'secondary' as const,
      };
    }

    return {
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      icon: <Wifi className="w-3 h-3" />,
      label: 'Connected',
      variant: 'default' as const,
    };
  };

  const getLiveDataStatus = () => {
    if (!isLiveMode) {
      return {
        color: 'text-yellow-500',
        icon: <Database className="w-3 h-3" />,
        label: 'Manual',
      };
    }

    const totalRefreshes = Object.values(refreshCounts).reduce((sum, count) => sum + count, 0);
    
    return {
      color: 'text-green-500',
      icon: <Database className="w-3 h-3" />,
      label: `${totalRefreshes} syncs`,
    };
  };

  const getActivityStatus = () => {
    const timeSinceActivity = Date.now() - lastActivity;
    const minutesSinceActivity = Math.floor(timeSinceActivity / (1000 * 60));
    
    if (timeSinceActivity < 60000) { // Less than 1 minute
      return {
        color: 'text-green-500',
        icon: <Activity className="w-3 h-3" />,
        label: 'Active',
      };
    } else if (minutesSinceActivity < 5) { // Less than 5 minutes
      return {
        color: 'text-yellow-500',
        icon: <Activity className="w-3 h-3" />,
        label: `${minutesSinceActivity}m ago`,
      };
    } else {
      return {
        color: 'text-gray-500',
        icon: <Activity className="w-3 h-3" />,
        label: 'Idle',
      };
    }
  };

  const connectionStatus = getConnectionStatus();
  const liveDataStatus = getLiveDataStatus();
  const activityStatus = getActivityStatus();

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {/* Connection indicator */}
        <div className={cn('flex items-center gap-1', connectionStatus.color)}>
          {connectionStatus.icon}
        </div>
        
        {/* Activity pulse */}
        {lastActivity > 0 && Date.now() - lastActivity < 30000 && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        )}
        
        {/* Notification count */}
        {unreadCount > 0 && (
          <Badge variant="destructive" className="text-xs h-5 px-1">
            {unreadCount}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className={cn('', className)}>
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">System Status</h3>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={forceRefreshAll}
                className="h-6 w-6 p-0"
                disabled={!isAuthenticated}
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLiveMode}
                className="h-6 w-6 p-0"
                disabled={!isAuthenticated}
              >
                {isLiveMode ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </Button>
            </div>
          </div>

          {/* Status indicators */}
          <div className="space-y-2">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={connectionStatus.color}>
                  {connectionStatus.icon}
                </div>
                <span className="text-xs">Connection</span>
              </div>
              <Badge variant={connectionStatus.variant} className="text-xs">
                {connectionStatus.label}
              </Badge>
            </div>

            {/* Live Data Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={liveDataStatus.color}>
                  {liveDataStatus.icon}
                </div>
                <span className="text-xs">Data Sync</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {liveDataStatus.label}
              </span>
            </div>

            {/* Event Activity */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={activityStatus.color}>
                  {activityStatus.icon}
                </div>
                <span className="text-xs">Activity</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {activityStatus.label}
              </span>
            </div>

            {/* Notifications */}
            {isAuthenticated && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-3 h-3 text-blue-500" />
                  <span className="text-xs">Alerts</span>
                </div>
                <div className="flex items-center gap-1">
                  {urgentNotifications.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {urgentNotifications.length} urgent
                    </Badge>
                  )}
                  {unreadCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {unreadCount} unread
                    </span>
                  )}
                  {unreadCount === 0 && urgentNotifications.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      All clear
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Recent activity summary */}
          {recentEvents.length > 0 && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">Recent Events</span>
                <span className="text-xs text-muted-foreground">
                  {totalEvents} total
                </span>
              </div>
              <div className="space-y-1">
                {recentEvents.slice(0, 3).map((event, index) => (
                  <div key={event.id} className="flex items-center justify-between text-xs">
                    <span className="truncate flex-1">
                      {event.eventName}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      {new Date(event.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live indicators */}
          <div className="flex items-center justify-center gap-4 pt-2 border-t">
            {/* Live pulse */}
            {isListening && isConnected && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600">Live</span>
              </div>
            )}
            
            {/* Event count today */}
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-muted-foreground">
                {events.filter(e => 
                  new Date(e.timestamp).toDateString() === new Date().toDateString()
                ).length} today
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 