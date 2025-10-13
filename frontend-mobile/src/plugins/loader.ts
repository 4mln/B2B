import { lazy, Suspense, ComponentType } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { pluginRegistry, PluginMetadata } from './registry';
import { PluginContext } from './types';

/**
 * Plugin Loader Component
 * Handles lazy loading of plugin components with Suspense
 */
interface PluginLoaderProps {
  pluginName: string;
  fallback?: ComponentType;
  context?: PluginContext;
}

/**
 * Default fallback component for loading states
 */
const DefaultFallback = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={{ marginTop: 10, color: '#666' }}>Loading plugin...</Text>
  </View>
);

/**
 * Error boundary component for plugin errors
 */
const PluginErrorFallback = ({ error }: { error: Error }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
    <Text style={{ color: '#FF3B30', textAlign: 'center', marginBottom: 10 }}>
      Plugin Error
    </Text>
    <Text style={{ color: '#666', textAlign: 'center', fontSize: 12 }}>
      {error.message}
    </Text>
  </View>
);

/**
 * Plugin Loader Component
 * Dynamically loads and renders plugin components
 */
export const PluginLoader: React.FC<PluginLoaderProps> = ({ 
  pluginName, 
  fallback: Fallback = DefaultFallback,
  context 
}) => {
  const plugin = pluginRegistry.getPlugin(pluginName);
  
  if (!plugin) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: '#FF3B30', textAlign: 'center' }}>
          Plugin "{pluginName}" not found
        </Text>
      </View>
    );
  }

  if (!pluginRegistry.isEnabled(pluginName)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: '#FF9500', textAlign: 'center' }}>
          Plugin "{pluginName}" is disabled
        </Text>
      </View>
    );
  }

  // Create lazy component
  const LazyComponent = lazy(() => {
    return new Promise<{ default: ComponentType<any> }>((resolve, reject) => {
      try {
        // In a real implementation, this would dynamically import the plugin
        // For now, we'll resolve with the component directly
        resolve({ default: plugin.component });
      } catch (error) {
        reject(error);
      }
    });
  });

  return (
    <Suspense fallback={<Fallback />}>
      <LazyComponent context={context} />
    </Suspense>
  );
};

/**
 * Load plugin dynamically from a path
 * This function would be used to load plugins from external sources
 */
export const loadPluginFromPath = async (path: string): Promise<PluginMetadata | null> => {
  try {
    // In a real implementation, this would dynamically import the plugin
    // const module = await import(path);
    // return module.plugin;
    
    // For now, return null as this is a placeholder
    console.log(`[PluginLoader] Loading plugin from path: ${path}`);
    return null;
  } catch (error) {
    console.error(`[PluginLoader] Failed to load plugin from ${path}:`, error);
    return null;
  }
};

/**
 * Load all plugins from a directory
 */
export const loadPluginsFromDirectory = async (directory: string): Promise<PluginMetadata[]> => {
  try {
    // In a real implementation, this would scan a directory for plugin files
    // and load them dynamically
    
    console.log(`[PluginLoader] Loading plugins from directory: ${directory}`);
    return [];
  } catch (error) {
    console.error(`[PluginLoader] Failed to load plugins from ${directory}:`, error);
    return [];
  }
};

/**
 * Initialize plugin system
 * This function should be called when the app starts
 */
export const initializePluginSystem = async (): Promise<void> => {
  try {
    console.log('[PluginLoader] Initializing plugin system...');
    
    // Load core plugins
    await loadCorePlugins();
    
    // Load feature plugins
    await loadFeaturePlugins();
    
    // Load integration plugins
    await loadIntegrationPlugins();
    
    console.log(`[PluginLoader] Plugin system initialized with ${pluginRegistry.getAllPlugins().length} plugins`);
  } catch (error) {
    console.error('[PluginLoader] Failed to initialize plugin system:', error);
  }
};

/**
 * Load core plugins (auth, navigation, etc.)
 */
const loadCorePlugins = async (): Promise<void> => {
  // Core plugins are loaded statically
  console.log('[PluginLoader] Loading core plugins...');
};

/**
 * Load feature plugins (chat, products, etc.)
 */
const loadFeaturePlugins = async (): Promise<void> => {
  // Feature plugins are loaded from the plugins directory
  console.log('[PluginLoader] Loading feature plugins...');
};

/**
 * Load integration plugins (third-party services)
 */
const loadIntegrationPlugins = async (): Promise<void> => {
  // Integration plugins are loaded from external sources
  console.log('[PluginLoader] Loading integration plugins...');
};

export default PluginLoader;
