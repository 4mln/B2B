import { PluginMetadata } from '../types';
import ProfileScreen from './ProfileScreen';

/**
 * Profile Plugin Export
 * Exports plugin metadata for dynamic loading
 * This is the main entry point for the profile plugin
 */
export const plugin: PluginMetadata = {
  name: 'profile',
  version: '1.0.0',
  route: '/profile',
  component: ProfileScreen,
  permissions: ['profile:read', 'profile:write'],
  dependencies: ['auth'],
  description: 'User profile management for viewing and editing personal information',
  icon: '👤',
  category: 'core',
};

// Export all profile-related components and utilities
export { default as ProfileScreen } from './ProfileScreen';
export { profileApi } from './profileApi';
export { useProfileHooks, useUserProfile, useProfileAnalytics, useKYCStatus } from './profileHooks';
export { profileStyles } from './profileStyles';
export * from './types';

// Export the plugin as default
export default plugin;
