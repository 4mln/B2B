import { useState, useEffect, useCallback } from 'react';
import { 
  isFeatureEnabled, 
  subscribeToFeatureFlag, 
  getFeatureFlag,
  getFeatureMetadata,
  isFeatureAvailableForUser,
  getFeatureDescription,
  FeatureFlag
} from '@/services/featureFlags';

/**
 * Hook for using feature flags in React components
 * Provides reactive updates when feature flags change
 */

export interface UseFeatureFlagOptions {
  defaultValue?: boolean;
  trackUsage?: boolean;
}

export interface UseFeatureFlagReturn {
  enabled: boolean;
  loading: boolean;
  error: string | null;
  flag: FeatureFlag | null;
  metadata: Record<string, any> | null;
  description: string | null;
  availableForUser: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook to check if a feature flag is enabled
 */
export const useFeatureFlag = (
  flagName: string,
  options: UseFeatureFlagOptions = {}
): UseFeatureFlagReturn => {
  const { defaultValue = false, trackUsage = true } = options;
  
  const [enabled, setEnabled] = useState<boolean>(defaultValue);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [flag, setFlag] = useState<FeatureFlag | null>(null);
  const [metadata, setMetadata] = useState<Record<string, any> | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [availableForUser, setAvailableForUser] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const isEnabled = isFeatureEnabled(flagName);
      const flagData = getFeatureFlag(flagName);
      const flagMetadata = getFeatureMetadata(flagName);
      const flagDescription = getFeatureDescription(flagName);
      const isAvailable = isFeatureAvailableForUser(flagName);

      setEnabled(isEnabled);
      setFlag(flagData);
      setMetadata(flagMetadata);
      setDescription(flagDescription);
      setAvailableForUser(isAvailable);

      if (trackUsage && isEnabled) {
        // Track feature usage
        const { trackFeatureUsage } = await import('../services/analytics');
        trackFeatureUsage(flagName, 'hook_usage', {
          enabled: isEnabled,
          metadata: flagMetadata,
        });
      }
    } catch (err) {
      console.error(`[useFeatureFlag] Error checking flag ${flagName}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [flagName, trackUsage]);

  useEffect(() => {
    // Initial check
    refresh();

    // Subscribe to changes
    const unsubscribe = subscribeToFeatureFlag(flagName, (isEnabled) => {
      setEnabled(isEnabled);
      
      if (trackUsage && isEnabled) {
        // Track feature usage
        import('@/services/analytics').then(({ trackFeatureUsage }) => {
          trackFeatureUsage(flagName, 'flag_change', {
            enabled: isEnabled,
          });
        });
      }
    });

    return unsubscribe;
  }, [flagName, refresh, trackUsage]);

  return {
    enabled,
    loading,
    error,
    flag,
    metadata,
    description,
    availableForUser,
    refresh,
  };
};

/**
 * Hook to check multiple feature flags at once
 */
export const useFeatureFlags = (
  flagNames: string[],
  options: UseFeatureFlagOptions = {}
): Record<string, UseFeatureFlagReturn> => {
  const results: Record<string, UseFeatureFlagReturn> = {};

  flagNames.forEach(flagName => {
    results[flagName] = useFeatureFlag(flagName, options);
  });

  return results;
};

/**
 * Hook to check if any of the provided flags are enabled
 */
export const useAnyFeatureFlag = (
  flagNames: string[],
  options: UseFeatureFlagOptions = {}
): {
  enabled: boolean;
  loading: boolean;
  error: string | null;
  enabledFlags: string[];
  refresh: () => Promise<void>;
} => {
  const flags = useFeatureFlags(flagNames, options);
  
  const enabled = Object.values(flags).some(flag => flag.enabled);
  const loading = Object.values(flags).some(flag => flag.loading);
  const error = Object.values(flags).find(flag => flag.error)?.error || null;
  const enabledFlags = flagNames.filter(name => flags[name].enabled);

  const refresh = useCallback(async () => {
    await Promise.all(Object.values(flags).map(flag => flag.refresh()));
  }, [flags]);

  return {
    enabled,
    loading,
    error,
    enabledFlags,
    refresh,
  };
};

/**
 * Hook to check if all of the provided flags are enabled
 */
export const useAllFeatureFlags = (
  flagNames: string[],
  options: UseFeatureFlagOptions = {}
): {
  enabled: boolean;
  loading: boolean;
  error: string | null;
  disabledFlags: string[];
  refresh: () => Promise<void>;
} => {
  const flags = useFeatureFlags(flagNames, options);
  
  const enabled = Object.values(flags).every(flag => flag.enabled);
  const loading = Object.values(flags).some(flag => flag.loading);
  const error = Object.values(flags).find(flag => flag.error)?.error || null;
  const disabledFlags = flagNames.filter(name => !flags[name].enabled);

  const refresh = useCallback(async () => {
    await Promise.all(Object.values(flags).map(flag => flag.refresh()));
  }, [flags]);

  return {
    enabled,
    loading,
    error,
    disabledFlags,
    refresh,
  };
};

/**
 * Hook to get feature flag metadata
 */
export const useFeatureFlagMetadata = (flagName: string) => {
  const { metadata, loading, error, refresh } = useFeatureFlag(flagName, { trackUsage: false });
  
  return {
    metadata,
    loading,
    error,
    refresh,
  };
};

/**
 * Hook to check if feature is available for current user
 */
export const useFeatureAvailability = (flagName: string) => {
  const { availableForUser, loading, error, refresh } = useFeatureFlag(flagName, { trackUsage: false });
  
  return {
    available: availableForUser,
    loading,
    error,
    refresh,
  };
};

/**
 * Hook to get feature flag description
 */
export const useFeatureDescription = (flagName: string) => {
  const { description, loading, error, refresh } = useFeatureFlag(flagName, { trackUsage: false });
  
  return {
    description,
    loading,
    error,
    refresh,
  };
};

export default useFeatureFlag;
