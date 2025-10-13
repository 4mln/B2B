import { PluginMetadata } from '../types';
import NotificationsScreen from './NotificationsScreen';

/**
 * Notifications Plugin Export
 * Exports plugin metadata for dynamic loading
 * This is the main entry point for the notifications plugin
 */
export const plugin: PluginMetadata = {
  name: 'notifications',
  version: '1.0.0',
  route: '/notifications',
  component: NotificationsScreen,
  permissions: ['notifications:read', 'notifications:write'],
  dependencies: ['auth'],
  description: 'Notification management system for alerts, preferences, and settings',
  icon: '🔔',
  category: 'core',
};

// Export all notifications-related components and utilities
export { default as NotificationsScreen } from './NotificationsScreen';
export { notificationsApi } from './notificationsApi';
export { useNotificationsHooks, useNotificationStats, useNotificationAnalytics, useNotificationSubscriptions } from './notificationsHooks';
export { notificationsStyles } from './notificationsStyles';
export * from './types';

// Export the plugin as default
export default plugin;
