import { PluginMetadata } from '../types';
import ExploreScreen from './ExploreScreen';

/**
 * Explore Plugin Export
 * Exports plugin metadata for dynamic loading
 * This is the main entry point for the explore plugin
 */
export const plugin: PluginMetadata = {
  name: 'explore',
  version: '1.0.0',
  route: '/explore',
  component: ExploreScreen,
  permissions: ['explore:read'],
  dependencies: ['auth'],
  description: 'Product and seller discovery with advanced search and filtering',
  icon: '🔍',
  category: 'core',
};

// Export all explore-related components and utilities
export { default as ExploreScreen } from './ExploreScreen';
export { exploreApi } from './exploreApi';
export { useExploreHooks, useSearchSuggestions, useSearchAnalytics, useSavedSearches } from './exploreHooks';
export { exploreStyles } from './exploreStyles';
export * from './types';

// Export the plugin as default
export default plugin;
