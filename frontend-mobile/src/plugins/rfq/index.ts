import { PluginMetadata } from '../types';
import RFQScreen from './RFQScreen';

/**
 * RFQ Plugin Export
 * Exports plugin metadata for dynamic loading
 * This is the main entry point for the RFQ plugin
 */
export const plugin: PluginMetadata = {
  name: 'rfq',
  version: '1.0.0',
  route: '/rfq',
  component: RFQScreen,
  permissions: ['rfq:read', 'rfq:write'],
  dependencies: ['auth'],
  description: 'Request for Quotes system for creating and managing RFQs',
  icon: '📋',
  category: 'core',
};

// Export all RFQ-related components and utilities
export { default as RFQScreen } from './RFQScreen';
export { rfqApi } from './rfqApi';
export { useRFQHooks, useRFQ, useRFQQuotes, useRFQAnalytics } from './rfqHooks';
export { rfqStyles } from './rfqStyles';
export * from './types';

// Export the plugin as default
export default plugin;
