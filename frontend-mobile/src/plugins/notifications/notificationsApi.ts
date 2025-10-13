import apiClient from '@/services/api';
import { 
  Notification, 
  NotificationPreferences, 
  ApiResponse 
} from './types';

/**
 * Notifications API Service
 * Centralized API calls to backend /notifications endpoints
 * Aligns with backend plugin structure
 */
export const notificationsApi = {
  /**
   * Get user notifications
   * Backend endpoint: GET /notifications/
   */
  async getNotifications(filters?: {
    status?: string;
    notificationType?: string;
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
  }>> {
    try {
      const response = await apiClient.get('/notifications/', {
        params: filters,
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch notifications',
        success: false,
      };
    }
  },

  /**
   * Get a specific notification
   * Backend endpoint: GET /notifications/{notification_id}
   */
  async getNotification(notificationId: string): Promise<ApiResponse<Notification>> {
    try {
      const response = await apiClient.get(`/notifications/${notificationId}`);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch notification',
        success: false,
      };
    }
  },

  /**
   * Mark notifications as read
   * Backend endpoint: POST /notifications/mark-read
   */
  async markNotificationsRead(notificationIds: string[]): Promise<ApiResponse<{
    markedCount: number;
  }>> {
    try {
      const response = await apiClient.post('/notifications/mark-read', {
        notification_ids: notificationIds,
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to mark notifications as read',
        success: false,
      };
    }
  },

  /**
   * Mark a single notification as read
   * Backend endpoint: POST /notifications/mark-read/{notification_id}
   */
  async markNotificationRead(notificationId: string): Promise<ApiResponse<Notification>> {
    try {
      const response = await apiClient.post(`/notifications/mark-read/${notificationId}`);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to mark notification as read',
        success: false,
      };
    }
  },

  /**
   * Mark all notifications as read
   * Backend endpoint: POST /notifications/mark-all-read
   */
  async markAllNotificationsRead(): Promise<ApiResponse<{
    markedCount: number;
  }>> {
    try {
      const response = await apiClient.post('/notifications/mark-all-read');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to mark all notifications as read',
        success: false,
      };
    }
  },

  /**
   * Delete a notification
   * Backend endpoint: DELETE /notifications/{notification_id}
   */
  async deleteNotification(notificationId: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to delete notification',
        success: false,
      };
    }
  },

  /**
   * Get notification preferences
   * Backend endpoint: GET /notifications/preferences
   */
  async getNotificationPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    try {
      const response = await apiClient.get('/notifications/preferences');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch notification preferences',
        success: false,
      };
    }
  },

  /**
   * Update notification preferences
   * Backend endpoint: PUT /notifications/preferences
   */
  async updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<ApiResponse<NotificationPreferences>> {
    try {
      const response = await apiClient.put('/notifications/preferences', preferences);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to update notification preferences',
        success: false,
      };
    }
  },

  /**
   * Get notification subscriptions
   * Backend endpoint: GET /notifications/subscriptions
   */
  async getNotificationSubscriptions(): Promise<ApiResponse<Array<{
    id: string;
    type: string;
    isActive: boolean;
    createdAt: string;
  }>>> {
    try {
      const response = await apiClient.get('/notifications/subscriptions');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch notification subscriptions',
        success: false,
      };
    }
  },

  /**
   * Create notification subscription
   * Backend endpoint: POST /notifications/subscriptions
   */
  async createNotificationSubscription(data: {
    type: string;
    isActive: boolean;
  }): Promise<ApiResponse<{
    id: string;
    type: string;
    isActive: boolean;
    createdAt: string;
  }>> {
    try {
      const response = await apiClient.post('/notifications/subscriptions', data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to create notification subscription',
        success: false,
      };
    }
  },

  /**
   * Update notification subscription
   * Backend endpoint: PUT /notifications/subscriptions/{subscription_id}
   */
  async updateNotificationSubscription(subscriptionId: string, data: {
    isActive: boolean;
  }): Promise<ApiResponse<{
    id: string;
    type: string;
    isActive: boolean;
    createdAt: string;
  }>> {
    try {
      const response = await apiClient.put(`/notifications/subscriptions/${subscriptionId}`, data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to update notification subscription',
        success: false,
      };
    }
  },

  /**
   * Delete notification subscription
   * Backend endpoint: DELETE /notifications/subscriptions/{subscription_id}
   */
  async deleteNotificationSubscription(subscriptionId: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/notifications/subscriptions/${subscriptionId}`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to delete notification subscription',
        success: false,
      };
    }
  },

  /**
   * Get notification stats
   * Backend endpoint: GET /notifications/stats
   */
  async getNotificationStats(): Promise<ApiResponse<{
    totalNotifications: number;
    unreadNotifications: number;
    readNotifications: number;
  }>> {
    try {
      const response = await apiClient.get('/notifications/stats');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch notification stats',
        success: false,
      };
    }
  },

  /**
   * Get notification analytics
   * Backend endpoint: GET /notifications/analytics
   */
  async getNotificationAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<{
    totalSent: number;
    totalRead: number;
    readRate: number;
    topTypes: Array<{
      type: string;
      count: number;
      readRate: number;
    }>;
    trends: Array<{
      date: string;
      sent: number;
      read: number;
    }>;
  }>> {
    try {
      const response = await apiClient.get('/notifications/analytics', {
        params: { period },
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch notification analytics',
        success: false,
      };
    }
  },

  /**
   * Test notification
   * Backend endpoint: POST /notifications/test
   */
  async testNotification(type: string, channel: 'email' | 'push' | 'sms' = 'push'): Promise<ApiResponse<void>> {
    try {
      await apiClient.post('/notifications/test', { type, channel });
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to send test notification',
        success: false,
      };
    }
  },

  /**
   * Get notification templates
   * Backend endpoint: GET /notifications/templates
   */
  async getNotificationTemplates(): Promise<ApiResponse<Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    isActive: boolean;
    createdAt: string;
  }>>> {
    try {
      const response = await apiClient.get('/notifications/templates');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch notification templates',
        success: false,
      };
    }
  },

  /**
   * Get notification webhooks
   * Backend endpoint: GET /notifications/webhooks
   */
  async getNotificationWebhooks(): Promise<ApiResponse<Array<{
    id: string;
    url: string;
    events: string[];
    isActive: boolean;
    createdAt: string;
  }>>> {
    try {
      const response = await apiClient.get('/notifications/webhooks');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to fetch notification webhooks',
        success: false,
      };
    }
  },
};

export default notificationsApi;
