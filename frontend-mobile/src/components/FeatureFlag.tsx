import React, { ReactNode } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

/**
 * Feature Flag Component
 * Conditionally renders content based on feature flags
 */

export interface FeatureFlagProps {
  flag: string;
  children: ReactNode;
  fallback?: ReactNode;
  loading?: ReactNode;
  error?: ReactNode;
  trackUsage?: boolean;
  requireAll?: boolean;
  flags?: string[];
}

/**
 * Component that conditionally renders children based on feature flag
 */
export const FeatureFlag: React.FC<FeatureFlagProps> = ({
  flag,
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
        Feature not available
      </Text>
    </View>
  ),
  trackUsage = true,
  requireAll = false,
  flags = [],
}) => {
  const { enabled, loading: isLoading, error: flagError } = useFeatureFlag(flag, {
    trackUsage,
  });

  // Handle loading state
  if (isLoading) {
    return <>{loading}</>;
  }

  // Handle error state
  if (flagError) {
    return <>{error}</>;
  }

  // Handle multiple flags
  if (flags.length > 0) {
    // Evaluate all flags in a single pass to respect hooks rules
    const allResults = [flag, ...flags].map((f) => useFeatureFlag(f, { trackUsage }));
    const loadingAny = allResults.some(r => r.loading);
    const errorAny = allResults.some(r => r.error);
    const enabledArr = allResults.map(r => r.enabled);

    if (loadingAny) return <>{loading}</>;
    if (errorAny) return <>{error}</>;

    const allFlagsEnabled = enabledArr.every(Boolean);
    const anyFlagEnabled = enabledArr.some(Boolean);
    const condition = requireAll ? allFlagsEnabled : anyFlagEnabled;
    return condition ? <>{children}</> : <>{fallback}</>;
  }

  // Handle single flag
  return enabled ? <>{children}</> : <>{fallback}</>;
};

/**
 * Component that renders children only when feature flag is disabled
 */
export const FeatureFlagDisabled: React.FC<FeatureFlagProps> = ({
  flag,
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
        Feature not available
      </Text>
    </View>
  ),
  trackUsage = true,
}) => {
  const { enabled, loading: isLoading, error: flagError } = useFeatureFlag(flag, {
    trackUsage,
  });

  // Handle loading state
  if (isLoading) {
    return <>{loading}</>;
  }

  // Handle error state
  if (flagError) {
    return <>{error}</>;
  }

  // Render children when flag is disabled
  return !enabled ? <>{children}</> : <>{fallback}</>;
};

/**
 * Component that renders different content based on feature flag state
 */
export const FeatureFlagSwitch: React.FC<{
  flag: string;
  enabled: ReactNode;
  disabled: ReactNode;
  loading?: ReactNode;
  error?: ReactNode;
  trackUsage?: boolean;
}> = ({
  flag,
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
        Feature not available
      </Text>
    </View>
  ),
  trackUsage = true,
}) => {
  const { enabled: isEnabled, loading: isLoading, error: flagError } = useFeatureFlag(flag, {
    trackUsage,
  });

  // Handle loading state
  if (isLoading) {
    return <>{loading}</>;
  }

  // Handle error state
  if (flagError) {
    return <>{error}</>;
  }

  // Render based on flag state
  return isEnabled ? <>{enabled}</> : <>{disabled}</>;
};

/**
 * Component that renders children only when user has access to feature
 */
export const FeatureAccess: React.FC<{
  flag: string;
  children: ReactNode;
  fallback?: ReactNode;
  loading?: ReactNode;
  error?: ReactNode;
  trackUsage?: boolean;
}> = ({
  flag,
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
        Feature not available
      </Text>
    </View>
  ),
  trackUsage = true,
}) => {
  const { availableForUser, loading: isLoading, error: flagError } = useFeatureFlag(flag, {
    trackUsage,
  });

  // Handle loading state
  if (isLoading) {
    return <>{loading}</>;
  }

  // Handle error state
  if (flagError) {
    return <>{error}</>;
  }

  // Render based on user access
  return availableForUser ? <>{children}</> : <>{fallback}</>;
};

/**
 * Component that renders children only when feature flag is enabled and user has access
 */
export const FeatureFlagWithAccess: React.FC<FeatureFlagProps> = ({
  flag,
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
        Feature not available
      </Text>
    </View>
  ),
  trackUsage = true,
}) => {
  const { enabled, availableForUser, loading: isLoading, error: flagError } = useFeatureFlag(flag, {
    trackUsage,
  });

  // Handle loading state
  if (isLoading) {
    return <>{loading}</>;
  }

  // Handle error state
  if (flagError) {
    return <>{error}</>;
  }

  // Render only if both enabled and available for user
  return (enabled && availableForUser) ? <>{children}</> : <>{fallback}</>;
};

export default FeatureFlag;
