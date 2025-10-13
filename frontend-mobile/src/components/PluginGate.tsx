import React, { ReactNode } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { usePluginEnabled } from '@/hooks/useConfig';

/**
 * Plugin Gate Component
 * Conditionally renders content based on plugin configuration
 */

export interface PluginGateProps {
  plugin: string;
  children: ReactNode;
  fallback?: ReactNode;
  loading?: ReactNode;
  error?: ReactNode;
  trackUsage?: boolean;
  requireAll?: boolean;
  plugins?: string[];
}

/**
 * Component that conditionally renders children based on plugin configuration
 */
export const PluginGate: React.FC<PluginGateProps> = ({
  plugin,
  children,
  fallback = null,
  loading = (
    <View style={{ padding: 16, alignItems: 'center' }}>
      <ActivityIndicator size="small" color="#007AFF" />
    </View>
  ),
  error = (
    <View style={{ padding: 16, alignItems: 'center' }}>
      <Text style={{ color: '#FF3B30', fontSize: 14 }}>
        Plugin not available
      </Text>
    </View>
  ),
  trackUsage = true,
  requireAll = false,
  plugins = [],
}) => {
  const { value: enabled, loading: isLoading, error: pluginError } = usePluginEnabled(plugin, {
    trackUsage,
  });

  // Handle loading state
  if (isLoading) {
    return <>{loading}</>;
  }

  // Handle error state
  if (pluginError) {
    return <>{error}</>;
  }

  // Handle multiple plugins
  if (plugins.length > 0) {
    const results = [plugin, ...plugins].map((p) => usePluginEnabled(p, { trackUsage }));
    const loadingAny = results.some(r => r.loading);
    const errorAny = results.some(r => r.error);
    const values = results.map(r => r.value);

    if (loadingAny) return <>{loading}</>;
    if (errorAny) return <>{error}</>;

    const allEnabled = values.every(Boolean);
    const anyEnabled = values.some(Boolean);
    const condition = requireAll ? allEnabled : anyEnabled;
    return condition ? <>{children}</> : <>{fallback}</>;
  }

  // Handle single plugin
  return enabled ? <>{children}</> : <>{fallback}</>;
};

/**
 * Component that renders children only when plugin is disabled
 */
export const PluginGateDisabled: React.FC<PluginGateProps> = ({
  plugin,
  children,
  fallback = null,
  loading = (
    <View style={{ padding: 16, alignItems: 'center' }}>
      <ActivityIndicator size="small" color="#007AFF" />
    </View>
  ),
  error = (
    <View style={{ padding: 16, alignItems: 'center' }}>
      <Text style={{ color: '#FF3B30', fontSize: 14 }}>
        Plugin not available
      </Text>
    </View>
  ),
  trackUsage = true,
}) => {
  const { value: enabled, loading: isLoading, error: pluginError } = usePluginEnabled(plugin, {
    trackUsage,
  });

  // Handle loading state
  if (isLoading) {
    return <>{loading}</>;
  }

  // Handle error state
  if (pluginError) {
    return <>{error}</>;
  }

  // Render children when plugin is disabled
  return !enabled ? <>{children}</> : <>{fallback}</>;
};

/**
 * Component that renders different content based on plugin state
 */
export const PluginGateSwitch: React.FC<{
  plugin: string;
  enabled: ReactNode;
  disabled: ReactNode;
  loading?: ReactNode;
  error?: ReactNode;
  trackUsage?: boolean;
}> = ({
  plugin,
  enabled,
  disabled,
  loading = (
    <View style={{ padding: 16, alignItems: 'center' }}>
      <ActivityIndicator size="small" color="#007AFF" />
    </View>
  ),
  error = (
    <View style={{ padding: 16, alignItems: 'center' }}>
      <Text style={{ color: '#FF3B30', fontSize: 14 }}>
        Plugin not available
      </Text>
    </View>
  ),
  trackUsage = true,
}) => {
  const { value: isEnabled, loading: isLoading, error: pluginError } = usePluginEnabled(plugin, {
    trackUsage,
  });

  // Handle loading state
  if (isLoading) {
    return <>{loading}</>;
  }

  // Handle error state
  if (pluginError) {
    return <>{error}</>;
  }

  // Render based on plugin state
  return isEnabled ? <>{enabled}</> : <>{disabled}</>;
};

/**
 * Component that renders children only when user has access to plugin
 */
export const PluginAccess: React.FC<{
  plugin: string;
  children: ReactNode;
  fallback?: ReactNode;
  loading?: ReactNode;
  error?: ReactNode;
  trackUsage?: boolean;
}> = ({
  plugin,
  children,
  fallback = null,
  loading = (
    <View style={{ padding: 16, alignItems: 'center' }}>
      <ActivityIndicator size="small" color="#007AFF" />
    </View>
  ),
  error = (
    <View style={{ padding: 16, alignItems: 'center' }}>
      <Text style={{ color: '#FF3B30', fontSize: 14 }}>
        Plugin not available
      </Text>
    </View>
  ),
  trackUsage = true,
}) => {
  const { value: enabled, loading: isLoading, error: pluginError } = usePluginEnabled(plugin, {
    trackUsage,
  });

  // Handle loading state
  if (isLoading) {
    return <>{loading}</>;
  }

  // Handle error state
  if (pluginError) {
    return <>{error}</>;
  }

  // Render based on plugin access
  return enabled ? <>{children}</> : <>{fallback}</>;
};

/**
 * Component that renders children only when plugin is enabled and user has access
 */
export const PluginGateWithAccess: React.FC<PluginGateProps> = ({
  plugin,
  children,
  fallback = null,
  loading = (
    <View style={{ padding: 16, alignItems: 'center' }}>
      <ActivityIndicator size="small" color="#007AFF" />
    </View>
  ),
  error = (
    <View style={{ padding: 16, alignItems: 'center' }}>
      <Text style={{ color: '#FF3B30', fontSize: 14 }}>
        Plugin not available
      </Text>
    </View>
  ),
  trackUsage = true,
}) => {
  const { value: enabled, loading: isLoading, error: pluginError } = usePluginEnabled(plugin, {
    trackUsage,
  });

  // Handle loading state
  if (isLoading) {
    return <>{loading}</>;
  }

  // Handle error state
  if (pluginError) {
    return <>{error}</>;
  }

  // Render only if plugin is enabled
  return enabled ? <>{children}</> : <>{fallback}</>;
};

export default PluginGate;
