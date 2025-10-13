import { ReactNode } from 'react';

/**
 * Plugin metadata interface for dynamic loading
 * Each plugin must export this structure
 */
export interface PluginMetadata {
  name: string;
  version: string;
  route: string;
  component: React.ComponentType<any>;
  permissions?: string[];
  dependencies?: string[];
  description?: string;
  icon?: string;
  category?: 'core' | 'feature' | 'integration';
}

/**
 * Plugin configuration for the registry
 */
export interface PluginConfig {
  name: string;
  enabled: boolean;
  permissions: string[];
  settings?: Record<string, any>;
}

/**
 * Plugin registry interface
 */
export interface PluginRegistry {
  plugins: Map<string, PluginMetadata>;
  configs: Map<string, PluginConfig>;
  register: (plugin: PluginMetadata) => void;
  unregister: (name: string) => void;
  getPlugin: (name: string) => PluginMetadata | undefined;
  getAllPlugins: () => PluginMetadata[];
  isEnabled: (name: string) => boolean;
  setConfig: (name: string, config: PluginConfig) => void;
}

/**
 * Plugin context interface for sharing data between plugins
 */
export interface PluginContext {
  apiClient: any;
  authStore: any;
  navigation: any;
  theme: any;
  i18n: any;
}

/**
 * Plugin hook interface for state management
 */
export interface PluginHook<T = any> {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  mutate: (data: any) => void;
}

/**
 * Plugin API interface for backend communication
 */
export interface PluginApi {
  get: (endpoint: string, params?: Record<string, any>) => Promise<any>;
  post: (endpoint: string, data?: any) => Promise<any>;
  put: (endpoint: string, data?: any) => Promise<any>;
  delete: (endpoint: string) => Promise<any>;
  patch: (endpoint: string, data?: any) => Promise<any>;
}

/**
 * Plugin styles interface
 */
export interface PluginStyles {
  container: any;
  header: any;
  content: any;
  footer: any;
  [key: string]: any;
}
