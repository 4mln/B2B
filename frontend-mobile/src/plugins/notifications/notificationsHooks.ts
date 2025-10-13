import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from './notificationsApi';
import { Notification, NotificationPreferences } from './types';

/**
 * Notifications Hooks
 * React hooks to manage notifications state and API interactions
 * Provides centralized state management for notifications functionality
 */
export const useNotificationsHooks = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch notifications
  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: async () => {
      const response = await notificationsApi.getNotifications();
      if (response.success && response.data) {
        setNotifications(response.data.notifications);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch notifications');
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });

  // Fetch notification preferences
  const {
    data: preferencesData,
    isLoading: preferencesLoading,
    error: preferencesError,
  } = useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: async () => {
      const response = await notificationsApi.getNotificationPreferences();
      if (response.success && response.data) {
        setPreferences(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch notification preferences');
    },
    staleTime: 300000, // 5 minutes
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await notificationsApi.markNotificationRead(notificationId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to mark notification as read');
    },
    onSuccess: (updatedNotification) => {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === updatedNotification.id 
            ? updatedNotification 
            : notification
        )
      );
      queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  // Mark all notifications as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await notificationsApi.markAllNotificationsRead();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to mark all notifications as read');
    },
    onSuccess: () => {
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await notificationsApi.deleteNotification(notificationId);
      if (response.success) {
        return notificationId;
      }
      throw new Error(response.error || 'Failed to delete notification');
    },
    onSuccess: (notificationId) => {
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
      queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: Partial<NotificationPreferences>) => {
      const response = await notificationsApi.updateNotificationPreferences(newPreferences);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to update notification preferences');
    },
    onSuccess: (updatedPreferences) => {
      setPreferences(updatedPreferences);
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] });
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    return markAsReadMutation.mutateAsync(notificationId);
  }, [markAsReadMutation]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    return markAllAsReadMutation.mutateAsync();
  }, [markAllAsReadMutation]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    return deleteNotificationMutation.mutateAsync(notificationId);
  }, [deleteNotificationMutation]);

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    return updatePreferencesMutation.mutateAsync(newPreferences);
  }, [updatePreferencesMutation]);

  // Refresh notifications
  const refreshNotifications = useCallback(() => {
    refetchNotifications();
  }, [refetchNotifications]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Update loading state
  useEffect(() => {
    setLoading(
      notificationsLoading || 
      preferencesLoading || 
      markAsReadMutation.isPending || 
      markAllAsReadMutation.isPending || 
      deleteNotificationMutation.isPending || 
      updatePreferencesMutation.isPending
    );
  }, [
    notificationsLoading,
    preferencesLoading,
    markAsReadMutation.isPending,
    markAllAsReadMutation.isPending,
    deleteNotificationMutation.isPending,
    updatePreferencesMutation.isPending,
  ]);

  // Update error state
  useEffect(() => {
    if (notificationsError || preferencesError) {
      setError(notificationsError?.message || preferencesError?.message || 'An error occurred');
    }
  }, [notificationsError, preferencesError]);

  return {
    // State
    notifications,
    preferences,
    loading,
    error,
    
    // Actions
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    refreshNotifications,
    clearError,
    
    // Mutation states
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
  };
};

/**
 * Hook for notification stats
 */
export const useNotificationStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: statsData,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['notifications', 'stats'],
    queryFn: async () => {
      const response = await notificationsApi.getNotificationStats();
      if (response.success && response.data) {
        setStats(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch notification stats');
    },
  });

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (queryError) {
      setError(queryError.message);
    }
  }, [queryError]);

  return {
    stats,
    loading,
    error,
  };
};

/**
 * Hook for notification analytics
 */
export const useNotificationAnalytics = (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: analyticsData,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['notifications', 'analytics', period],
    queryFn: async () => {
      const response = await notificationsApi.getNotificationAnalytics(period);
      if (response.success && response.data) {
        setAnalytics(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch notification analytics');
    },
  });

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (queryError) {
      setError(queryError.message);
    }
  }, [queryError]);

  return {
    analytics,
    loading,
    error,
  };
};

/**
 * Hook for notification subscriptions
 */
export const useNotificationSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: subscriptionsData,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['notifications', 'subscriptions'],
    queryFn: async () => {
      const response = await notificationsApi.getNotificationSubscriptions();
      if (response.success && response.data) {
        setSubscriptions(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch notification subscriptions');
    },
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async (data: { type: string; isActive: boolean }) => {
      const response = await notificationsApi.createNotificationSubscription(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to create notification subscription');
    },
    onSuccess: (newSubscription) => {
      setSubscriptions(prev => [newSubscription, ...prev]);
      refetch();
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { isActive: boolean } }) => {
      const response = await notificationsApi.updateNotificationSubscription(id, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to update notification subscription');
    },
    onSuccess: (updatedSubscription) => {
      setSubscriptions(prev => 
        prev.map(subscription => 
          subscription.id === updatedSubscription.id 
            ? updatedSubscription 
            : subscription
        )
      );
      refetch();
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  const deleteSubscriptionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await notificationsApi.deleteNotificationSubscription(id);
      if (response.success) {
        return id;
      }
      throw new Error(response.error || 'Failed to delete notification subscription');
    },
    onSuccess: (id) => {
      setSubscriptions(prev => prev.filter(subscription => subscription.id !== id));
      refetch();
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (queryError) {
      setError(queryError.message);
    }
  }, [queryError]);

  const createSubscription = useCallback(async (type: string, isActive: boolean) => {
    return createSubscriptionMutation.mutateAsync({ type, isActive });
  }, [createSubscriptionMutation]);

  const updateSubscription = useCallback(async (id: string, isActive: boolean) => {
    return updateSubscriptionMutation.mutateAsync({ id, data: { isActive } });
  }, [updateSubscriptionMutation]);

  const deleteSubscription = useCallback(async (id: string) => {
    return deleteSubscriptionMutation.mutateAsync(id);
  }, [deleteSubscriptionMutation]);

  return {
    subscriptions,
    loading,
    error,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    isCreating: createSubscriptionMutation.isPending,
    isUpdating: updateSubscriptionMutation.isPending,
    isDeleting: deleteSubscriptionMutation.isPending,
  };
};

export default useNotificationsHooks;
