import { Platform } from 'react-native';
import * as Analytics from 'expo-analytics';
import * as Sentry from '@sentry/react-native';

/**
 * Analytics Service
 * Centralized analytics and monitoring for the application
 * Integrates with Firebase Analytics and Sentry for comprehensive tracking
 */

// Initialize analytics
let analytics: Analytics.Analytics | null = null;

export const initializeAnalytics = () => {
  try {
    // Initialize Firebase Analytics
    analytics = new Analytics.Analytics('YOUR_FIREBASE_ANALYTICS_ID');
    
    // Initialize Sentry for error monitoring
    Sentry.init({
      dsn: 'YOUR_SENTRY_DSN',
      environment: __DEV__ ? 'development' : 'production',
      tracesSampleRate: 0.1,
      beforeSend(event) {
        // Filter out sensitive data
        if (event.user) {
          delete event.user.email;
          delete event.user.ip_address;
        }
        return event;
      },
    });
    
    console.log('[Analytics] Initialized successfully');
  } catch (error) {
    console.error('[Analytics] Failed to initialize:', error);
  }
};

/**
 * Track user events
 */
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  try {
    if (analytics) {
      analytics.event(eventName, parameters);
    }
    
    // Also send to Sentry for debugging
    Sentry.addBreadcrumb({
      message: eventName,
      category: 'user-action',
      data: parameters,
      level: 'info',
    });
  } catch (error) {
    console.error('[Analytics] Failed to track event:', error);
  }
};

/**
 * Track screen views
 */
export const trackScreenView = (screenName: string, parameters?: Record<string, any>) => {
  try {
    if (analytics) {
      analytics.screen(screenName, parameters);
    }
    
    Sentry.addBreadcrumb({
      message: `Screen: ${screenName}`,
      category: 'navigation',
      data: parameters,
      level: 'info',
    });
  } catch (error) {
    console.error('[Analytics] Failed to track screen view:', error);
  }
};

/**
 * Track user properties
 */
export const setUserProperties = (properties: Record<string, any>) => {
  try {
    if (analytics) {
      analytics.setUserProperties(properties);
    }
    
    Sentry.setUser(properties);
  } catch (error) {
    console.error('[Analytics] Failed to set user properties:', error);
  }
};

/**
 * Track plugin usage
 */
export const trackPluginUsage = (pluginName: string, action: string, parameters?: Record<string, any>) => {
  trackEvent('plugin_usage', {
    plugin_name: pluginName,
    action,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
    ...parameters,
  });
};

/**
 * Track API calls
 */
export const trackApiCall = (endpoint: string, method: string, statusCode: number, duration: number) => {
  trackEvent('api_call', {
    endpoint,
    method,
    status_code: statusCode,
    duration,
    platform: Platform.OS,
  });
};

/**
 * Track errors
 */
export const trackError = (error: Error, context?: Record<string, any>) => {
  try {
    Sentry.captureException(error, {
      tags: {
        platform: Platform.OS,
        ...context,
      },
    });
    
    trackEvent('error_occurred', {
      error_message: error.message,
      error_stack: error.stack,
      platform: Platform.OS,
      ...context,
    });
  } catch (analyticsError) {
    console.error('[Analytics] Failed to track error:', analyticsError);
  }
};

/**
 * Track performance metrics
 */
export const trackPerformance = (metricName: string, value: number, unit: string = 'ms') => {
  trackEvent('performance_metric', {
    metric_name: metricName,
    value,
    unit,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track user engagement
 */
export const trackEngagement = (action: string, duration?: number) => {
  trackEvent('user_engagement', {
    action,
    duration,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track feature usage
 */
export const trackFeatureUsage = (featureName: string, action: string, parameters?: Record<string, any>) => {
  trackEvent('feature_usage', {
    feature_name: featureName,
    action,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
    ...parameters,
  });
};

/**
 * Track conversion events
 */
export const trackConversion = (conversionType: string, value?: number, currency?: string) => {
  trackEvent('conversion', {
    conversion_type: conversionType,
    value,
    currency,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track app lifecycle events
 */
export const trackAppLifecycle = (event: 'app_start' | 'app_background' | 'app_foreground' | 'app_end') => {
  trackEvent('app_lifecycle', {
    event,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track navigation events
 */
export const trackNavigation = (from: string, to: string, method: string = 'navigate') => {
  trackEvent('navigation', {
    from,
    to,
    method,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track search events
 */
export const trackSearch = (query: string, results: number, filters?: Record<string, any>) => {
  trackEvent('search', {
    query,
    results_count: results,
    filters: JSON.stringify(filters),
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track transaction events
 */
export const trackTransaction = (transactionType: string, amount: number, currency: string, status: string) => {
  trackEvent('transaction', {
    transaction_type: transactionType,
    amount,
    currency,
    status,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track chat events
 */
export const trackChatEvent = (eventType: string, conversationId: string, messageCount?: number) => {
  trackEvent('chat_event', {
    event_type: eventType,
    conversation_id: conversationId,
    message_count: messageCount,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track RFQ events
 */
export const trackRFQEvent = (eventType: string, rfqId: string, category?: string) => {
  trackEvent('rfq_event', {
    event_type: eventType,
    rfq_id: rfqId,
    category,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track notification events
 */
export const trackNotificationEvent = (eventType: string, notificationType: string, isRead: boolean) => {
  trackEvent('notification_event', {
    event_type: eventType,
    notification_type: notificationType,
    is_read: isRead,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Get analytics instance
 */
export const getAnalytics = () => analytics;

/**
 * Set user ID for tracking
 */
export const setUserId = (userId: string) => {
  try {
    if (analytics) {
      analytics.setUserId(userId);
    }
    
    Sentry.setUser({ id: userId });
  } catch (error) {
    console.error('[Analytics] Failed to set user ID:', error);
  }
};

/**
 * Clear user data
 */
export const clearUserData = () => {
  try {
    if (analytics) {
      analytics.reset();
    }
    
    Sentry.setUser(null);
  } catch (error) {
    console.error('[Analytics] Failed to clear user data:', error);
  }
};

export default {
  initializeAnalytics,
  trackEvent,
  trackScreenView,
  setUserProperties,
  trackPluginUsage,
  trackApiCall,
  trackError,
  trackPerformance,
  trackEngagement,
  trackFeatureUsage,
  trackConversion,
  trackAppLifecycle,
  trackNavigation,
  trackSearch,
  trackTransaction,
  trackChatEvent,
  trackRFQEvent,
  trackNotificationEvent,
  getAnalytics,
  setUserId,
  clearUserData,
};
