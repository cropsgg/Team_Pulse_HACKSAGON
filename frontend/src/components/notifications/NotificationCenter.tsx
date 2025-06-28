'use client';

import { useState, useMemo } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  BellOff, 
  CheckCircle, 
  X, 
  Filter,
  Settings,
  DollarSign,
  Vote,
  Target,
  AlertCircle,
  Info,
  CheckSquare,
  Calendar,
  ExternalLink,
  MoreVertical
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  NotificationType, 
  NotificationPriority, 
  NotificationCategory,
  type Notification 
} from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    notificationsByCategory,
    urgentNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filterPriority, setFilterPriority] = useState<NotificationPriority | 'all'>('all');

  // Filter notifications based on active tab and priority filter
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Filter by category/tab
    if (activeTab !== 'all') {
      if (activeTab === 'urgent') {
        filtered = urgentNotifications;
      } else {
        filtered = notificationsByCategory[activeTab as NotificationCategory] || [];
      }
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(notif => notif.priority === filterPriority);
    }

    return filtered;
  }, [notifications, activeTab, filterPriority, urgentNotifications, notificationsByCategory]);

  // Get notification icon based on type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.DONATION:
        return <DollarSign className="w-4 h-4" />;
      case NotificationType.INVESTMENT:
        return <DollarSign className="w-4 h-4" />;
      case NotificationType.GOVERNANCE:
        return <Vote className="w-4 h-4" />;
      case NotificationType.MILESTONE:
        return <Target className="w-4 h-4" />;
      case NotificationType.SUCCESS:
        return <CheckCircle className="w-4 h-4" />;
      case NotificationType.WARNING:
        return <AlertCircle className="w-4 h-4" />;
      case NotificationType.ERROR:
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  // Get notification color based on type and priority
  const getNotificationColor = (type: NotificationType, priority: NotificationPriority) => {
    if (priority === NotificationPriority.URGENT) {
      return 'border-red-200 bg-red-50';
    }
    
    switch (type) {
      case NotificationType.SUCCESS:
      case NotificationType.DONATION:
      case NotificationType.INVESTMENT:
        return 'border-green-200 bg-green-50';
      case NotificationType.WARNING:
        return 'border-yellow-200 bg-yellow-50';
      case NotificationType.ERROR:
        return 'border-red-200 bg-red-50';
      case NotificationType.GOVERNANCE:
        return 'border-blue-200 bg-blue-50';
      case NotificationType.MILESTONE:
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  // Get priority badge variant
  const getPriorityBadgeVariant = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return 'destructive';
      case NotificationPriority.HIGH:
        return 'default';
      case NotificationPriority.MEDIUM:
        return 'secondary';
      case NotificationPriority.LOW:
        return 'outline';
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
      setIsOpen(false);
    }
  };

  // Notification item component
  const NotificationItem = ({ notification }: { notification: Notification }) => (
    <Card 
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        getNotificationColor(notification.type, notification.priority),
        !notification.read && 'ring-2 ring-primary/20'
      )}
      onClick={() => handleNotificationClick(notification)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {getNotificationIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className={cn(
                  'text-sm font-medium',
                  !notification.read && 'font-semibold'
                )}>
                  {notification.title}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant={getPriorityBadgeVariant(notification.priority)}
                    className="text-xs"
                  >
                    {notification.priority}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                  </span>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!notification.read && (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as read
                    </DropdownMenuItem>
                  )}
                  {notification.actionUrl && (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      window.open(notification.actionUrl, '_blank');
                    }}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in new tab
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    className="text-red-600"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn("relative", className)}
        >
          {unreadCount > 0 ? (
            <Bell className="h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-[400px] sm:w-[540px]" side="right">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Notifications</SheetTitle>
              <SheetDescription>
                Stay updated with your latest activities
              </SheetDescription>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Priority Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterPriority('all')}>
                    All Priorities
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterPriority(NotificationPriority.URGENT)}>
                    Urgent
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterPriority(NotificationPriority.HIGH)}>
                    High
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterPriority(NotificationPriority.MEDIUM)}>
                    Medium
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterPriority(NotificationPriority.LOW)}>
                    Low
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={markAllAsRead}>
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Mark all as read
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={clearAllNotifications} className="text-red-600">
                    <X className="w-4 h-4 mr-2" />
                    Clear all
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                All
                {notifications.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {notifications.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="urgent">
                Urgent
                {urgentNotifications.length > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs">
                    {urgentNotifications.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value={NotificationCategory.FINANCIAL}>
                Money
                {notificationsByCategory[NotificationCategory.FINANCIAL]?.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {notificationsByCategory[NotificationCategory.FINANCIAL].length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value={NotificationCategory.GOVERNANCE}>
                Gov
                {notificationsByCategory[NotificationCategory.GOVERNANCE]?.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {notificationsByCategory[NotificationCategory.GOVERNANCE].length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <ScrollArea className="h-[600px]">
                {filteredNotifications.length > 0 ? (
                  <div className="space-y-3">
                    {filteredNotifications.map((notification) => (
                      <NotificationItem 
                        key={notification.id} 
                        notification={notification} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BellOff className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No notifications</h3>
                    <p className="text-muted-foreground text-sm">
                      You're all caught up! New notifications will appear here.
                    </p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
} 