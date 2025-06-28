'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRealTimeEvents } from '@/hooks/useRealTimeEvents';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  priority: NotificationPriority;
  category: NotificationCategory;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  expiresAt?: number;
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  TRANSACTION = 'transaction',
  GOVERNANCE = 'governance',
  MILESTONE = 'milestone',
  DONATION = 'donation',
  INVESTMENT = 'investment',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationCategory {
  SYSTEM = 'system',
  FINANCIAL = 'financial',
  GOVERNANCE = 'governance',
  SOCIAL = 'social',
  SECURITY = 'security',
  PROJECT = 'project',
}

interface NotificationSettings {
  enableInApp: boolean;
  enablePush: boolean;
  enableEmail: boolean;
  categories: Record<NotificationCategory, boolean>;
  priorities: Record<NotificationPriority, boolean>;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
  };
  frequency: 'realtime' | 'batched' | 'daily';
}

export function useNotifications() {
  const { user, isAuthenticated } = useAuth();
  const { events: realtimeEvents } = useRealTimeEvents();
  
  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    enableInApp: true,
    enablePush: false,
    enableEmail: false,
    categories: {
      [NotificationCategory.SYSTEM]: true,
      [NotificationCategory.FINANCIAL]: true,
      [NotificationCategory.GOVERNANCE]: true,
      [NotificationCategory.SOCIAL]: true,
      [NotificationCategory.SECURITY]: true,
      [NotificationCategory.PROJECT]: true,
    },
    priorities: {
      [NotificationPriority.LOW]: true,
      [NotificationPriority.MEDIUM]: true,
      [NotificationPriority.HIGH]: true,
      [NotificationPriority.URGENT]: true,
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
    frequency: 'realtime',
  });

  // Load settings from user preferences
  useEffect(() => {
    if (user?.preferences?.notifications) {
      const userNotificationSettings = user.preferences.notifications;
      setSettings(prev => ({
        ...prev,
        enableInApp: true, // Always enabled for in-app
        enablePush: userNotificationSettings.push,
        enableEmail: userNotificationSettings.email,
      }));
    }
  }, [user]);

  // Create notification from real-time event
  const createNotificationFromEvent = useCallback((event: any): Notification => {
    const timestamp = Date.now();
    
    return {
      id: `event-${event.id}`,
      type: getNotificationTypeFromEvent(event),
      title: getNotificationTitleFromEvent(event),
      message: getNotificationMessageFromEvent(event),
      timestamp,
      read: false,
      priority: getNotificationPriorityFromEvent(event),
      category: getNotificationCategoryFromEvent(event),
      actionUrl: getActionUrlFromEvent(event),
      actionLabel: getActionLabelFromEvent(event),
      metadata: {
        eventId: event.id,
        contractName: event.contractName,
        eventName: event.eventName,
        ...event.args,
      },
    };
  }, []);

  // Helper functions for event-to-notification conversion
  const getNotificationTypeFromEvent = (event: any): NotificationType => {
    switch (event.eventName) {
      case 'DonationMade':
        return NotificationType.DONATION;
      case 'InvestmentMade':
        return NotificationType.INVESTMENT;
      case 'MilestoneCompleted':
        return NotificationType.MILESTONE;
      case 'ProposalCreated':
      case 'VoteCast':
        return NotificationType.GOVERNANCE;
      default:
        return NotificationType.INFO;
    }
  };

  const getNotificationTitleFromEvent = (event: any): string => {
    switch (event.eventName) {
      case 'DonationMade':
        return 'New Donation Received';
      case 'InvestmentMade':
        return 'Investment Received';
      case 'MilestoneCompleted':
        return 'Milestone Completed';
      case 'ProposalCreated':
        return 'New Governance Proposal';
      case 'VoteCast':
        return 'Vote Cast';
      case 'NGORegistered':
        return 'NGO Registration Confirmed';
      case 'StartupRegistered':
        return 'Startup Registration Confirmed';
      default:
        return 'Blockchain Event';
    }
  };

  const getNotificationMessageFromEvent = (event: any): string => {
    const args = event.args;
    
    switch (event.eventName) {
      case 'DonationMade':
        return `You received a donation of ${formatAmount(args.amount)} ETH`;
      case 'InvestmentMade':
        return `Your startup received an investment of ${formatAmount(args.amount)} ETH`;
      case 'MilestoneCompleted':
        return `Milestone #${args.milestoneId} has been marked as completed`;
      case 'ProposalCreated':
        return `New proposal #${args.proposalId} is now open for voting`;
      case 'VoteCast':
        return `Your vote has been recorded for proposal #${args.proposalId}`;
      default:
        return `New ${event.eventName} event detected`;
    }
  };

  const getNotificationPriorityFromEvent = (event: any): NotificationPriority => {
    switch (event.eventName) {
      case 'DonationMade':
      case 'InvestmentMade':
        return NotificationPriority.HIGH;
      case 'MilestoneCompleted':
        return NotificationPriority.MEDIUM;
      case 'ProposalCreated':
        return NotificationPriority.MEDIUM;
      case 'VoteCast':
        return NotificationPriority.LOW;
      default:
        return NotificationPriority.LOW;
    }
  };

  const getNotificationCategoryFromEvent = (event: any): NotificationCategory => {
    switch (event.eventName) {
      case 'DonationMade':
      case 'InvestmentMade':
        return NotificationCategory.FINANCIAL;
      case 'ProposalCreated':
      case 'VoteCast':
        return NotificationCategory.GOVERNANCE;
      case 'MilestoneCompleted':
        return NotificationCategory.PROJECT;
      default:
        return NotificationCategory.SYSTEM;
    }
  };

  const getActionUrlFromEvent = (event: any): string => {
    const args = event.args;
    
    switch (event.eventName) {
      case 'DonationMade':
        return '/dashboard?tab=donations';
      case 'InvestmentMade':
        return '/dashboard?tab=investments';
      case 'MilestoneCompleted':
        return '/dashboard?tab=milestones';
      case 'ProposalCreated':
      case 'VoteCast':
        return `/governance/proposal/${args.proposalId}`;
      default:
        return '/dashboard';
    }
  };

  const getActionLabelFromEvent = (event: any): string => {
    switch (event.eventName) {
      case 'DonationMade':
        return 'View Donations';
      case 'InvestmentMade':
        return 'View Investments';
      case 'MilestoneCompleted':
        return 'View Milestones';
      case 'ProposalCreated':
        return 'View Proposal';
      case 'VoteCast':
        return 'View Results';
      default:
        return 'View Details';
    }
  };

  // Format amount for display
  const formatAmount = (amount: bigint): string => {
    const ethAmount = Number(amount) / 1e18;
    return ethAmount.toFixed(4);
  };

  // Check if notifications should be shown based on settings and quiet hours
  const shouldShowNotification = useCallback((notification: Notification): boolean => {
    // Check if category is enabled
    if (!settings.categories[notification.category]) return false;
    
    // Check if priority is enabled
    if (!settings.priorities[notification.priority]) return false;
    
    // Check quiet hours
    if (settings.quietHours.enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (currentTime >= settings.quietHours.start || currentTime <= settings.quietHours.end) {
        // Only show urgent notifications during quiet hours
        return notification.priority === NotificationPriority.URGENT;
      }
    }
    
    return true;
  }, [settings]);

  // Add new notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep only last 50
    
    // Show toast notification if enabled and should be shown
    if (settings.enableInApp && shouldShowNotification(newNotification)) {
      const toastFunction = getToastFunction(newNotification.type);
      
      toastFunction(newNotification.title, {
        description: newNotification.message,
        duration: getPriorityDuration(newNotification.priority),
        action: newNotification.actionUrl ? {
          label: newNotification.actionLabel || 'View',
          onClick: () => {
            window.location.href = newNotification.actionUrl!;
          }
        } : undefined,
      });
    }

    // Request push notification permission and send if enabled
    if (settings.enablePush && shouldShowNotification(newNotification)) {
      requestPushNotification(newNotification);
    }
  }, [settings, shouldShowNotification]);

  // Get appropriate toast function based on notification type
  const getToastFunction = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
      case NotificationType.DONATION:
      case NotificationType.INVESTMENT:
        return toast.success;
      case NotificationType.WARNING:
        return toast.warning;
      case NotificationType.ERROR:
        return toast.error;
      default:
        return toast.info;
    }
  };

  // Get toast duration based on priority
  const getPriorityDuration = (priority: NotificationPriority): number => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return 10000; // 10 seconds
      case NotificationPriority.HIGH:
        return 7000;  // 7 seconds
      case NotificationPriority.MEDIUM:
        return 5000;  // 5 seconds
      case NotificationPriority.LOW:
        return 3000;  // 3 seconds
    }
  };

  // Request push notification permission
  const requestPushNotification = useCallback(async (notification: Notification) => {
    if (!('Notification' in window)) return;

    let permission = Notification.permission;
    
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === NotificationPriority.URGENT,
      });
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  // Remove notification
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Listen to real-time events and create notifications
  useEffect(() => {
    if (!isAuthenticated || !realtimeEvents.length) return;
    
    // Get the latest event that hasn't been processed
    const latestEvent = realtimeEvents[0];
    if (!latestEvent) return;
    
    // Check if we already have a notification for this event
    const existingNotification = notifications.find(notif => 
      notif.metadata?.eventId === latestEvent.id
    );
    
    if (!existingNotification) {
      const notification = createNotificationFromEvent(latestEvent);
      addNotification(notification);
    }
  }, [realtimeEvents, isAuthenticated, notifications, createNotificationFromEvent, addNotification]);

  // Clean up expired notifications
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      setNotifications(prev => 
        prev.filter(notif => 
          !notif.expiresAt || notif.expiresAt > now
        )
      );
    };

    const interval = setInterval(cleanup, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Computed values
  const unreadCount = useMemo(() => 
    notifications.filter(notif => !notif.read).length
  , [notifications]);

  const notificationsByCategory = useMemo(() => 
    notifications.reduce((acc, notif) => {
      const category = notif.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(notif);
      return acc;
    }, {} as Record<NotificationCategory, Notification[]>)
  , [notifications]);

  const urgentNotifications = useMemo(() =>
    notifications.filter(notif => 
      notif.priority === NotificationPriority.URGENT && !notif.read
    )
  , [notifications]);

  return {
    // State
    notifications,
    settings,
    
    // Actions
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    updateSettings,
    
    // Computed
    unreadCount,
    notificationsByCategory,
    urgentNotifications,
    
    // Utils
    shouldShowNotification,
  };
} 