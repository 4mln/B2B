/**
 * Notifications Plugin Types
 * TypeScript interfaces for notifications functionality
 * Aligns with backend notifications plugin schemas
 */

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system' | 'marketing' | 'transaction' | 'security';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  channel: 'email' | 'push' | 'sms' | 'in_app';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  readAt?: string;
  expiresAt?: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  orderUpdates: boolean;
  priceAlerts: boolean;
  newMessages: boolean;
  rfqUpdates: boolean;
  quoteUpdates: boolean;
  walletUpdates: boolean;
  securityAlerts: boolean;
}

export interface NotificationSubscription {
  id: string;
  userId: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplate {
  id: string;
  type: string;
  title: string;
  message: string;
  isActive: boolean;
  language: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationBatch {
  id: string;
  name: string;
  templateId: string;
  recipients: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  scheduledAt?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationWebhook {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationAnalytics {
  totalSent: number;
  totalRead: number;
  readRate: number;
  deliveryRate: number;
  clickRate: number;
  topTypes: Array<{
    type: string;
    count: number;
    readRate: number;
  }>;
  trends: Array<{
    date: string;
    sent: number;
    read: number;
    delivered: number;
  }>;
  channels: Array<{
    channel: string;
    count: number;
    readRate: number;
  }>;
}

export interface NotificationStats {
  totalNotifications: number;
  unreadNotifications: number;
  readNotifications: number;
  todayNotifications: number;
  weekNotifications: number;
  monthNotifications: number;
}

export interface NotificationFilter {
  type?: string;
  priority?: string;
  channel?: string;
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface NotificationSearch {
  query: string;
  filters: NotificationFilter;
  results: Notification[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface NotificationAction {
  id: string;
  notificationId: string;
  type: 'view' | 'click' | 'dismiss' | 'archive' | 'delete';
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface NotificationDelivery {
  id: string;
  notificationId: string;
  channel: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  provider: string;
  providerId?: string;
  error?: string;
  deliveredAt?: string;
  createdAt: string;
}

export interface NotificationSchedule {
  id: string;
  notificationId: string;
  scheduledAt: string;
  status: 'pending' | 'sent' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRule {
  id: string;
  name: string;
  conditions: Record<string, any>;
  actions: Array<{
    type: string;
    config: Record<string, any>;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationCampaign {
  id: string;
  name: string;
  description: string;
  templateId: string;
  targetAudience: {
    type: 'all' | 'segment' | 'custom';
    criteria: Record<string, any>;
  };
  schedule: {
    type: 'immediate' | 'scheduled' | 'recurring';
    date?: string;
    frequency?: string;
  };
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled';
  metrics: {
    sent: number;
    delivered: number;
    read: number;
    clicked: number;
    unsubscribed: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSegment {
  id: string;
  name: string;
  description: string;
  criteria: Record<string, any>;
  userCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationProvider {
  id: string;
  name: string;
  type: 'email' | 'push' | 'sms' | 'webhook';
  config: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationEvent {
  id: string;
  type: string;
  data: Record<string, any>;
  timestamp: string;
  processed: boolean;
  processedAt?: string;
}

export interface NotificationQueue {
  id: string;
  notificationId: string;
  priority: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  nextAttemptAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

// Notifications state types
export interface NotificationsState {
  notifications: Notification[];
  preferences: NotificationPreferences | null;
  subscriptions: NotificationSubscription[];
  templates: NotificationTemplate[];
  stats: NotificationStats | null;
  analytics: NotificationAnalytics | null;
  loading: boolean;
  error: string | null;
  unreadCount: number;
  filters: NotificationFilter;
  searchQuery: string;
}

export interface NotificationsActions {
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  setPreferences: (preferences: NotificationPreferences) => void;
  updatePreferences: (updates: Partial<NotificationPreferences>) => void;
  setSubscriptions: (subscriptions: NotificationSubscription[]) => void;
  addSubscription: (subscription: NotificationSubscription) => void;
  updateSubscription: (id: string, updates: Partial<NotificationSubscription>) => void;
  removeSubscription: (id: string) => void;
  setTemplates: (templates: NotificationTemplate[]) => void;
  setStats: (stats: NotificationStats | null) => void;
  setAnalytics: (analytics: NotificationAnalytics | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: NotificationFilter) => void;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
  resetState: () => void;
}

export default {};
