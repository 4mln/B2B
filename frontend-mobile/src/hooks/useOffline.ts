import { useState, useEffect, useCallback } from 'react';
import { 
  isDeviceOnline, 
  getSyncStatus, 
  subscribeToSyncStatus,
  cacheData,
  getCachedData,
  getAllCachedData,
  addToSyncQueue,
  removeFromSyncQueue,
  sync,
  clearAllOfflineData,
  getOfflineStats,
  SyncStatus
} from '@/services/offlineService';

/**
 * Hook for using offline capabilities in React components
 * Provides reactive updates when offline status changes
 */

export interface UseOfflineOptions {
  autoSync?: boolean;
  retryAttempts?: number;
  trackUsage?: boolean;
}

export interface UseOfflineReturn {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: number | null;
  pendingItems: number;
  failedItems: number;
  sync: () => Promise<void>;
  clearData: () => Promise<void>;
  getStats: () => Promise<any>;
}

/**
 * Hook to get offline status
 */
export const useOffline = (options: UseOfflineOptions = {}): UseOfflineReturn => {
  const { autoSync = true, retryAttempts = 3, trackUsage = true } = options;
  
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: true,
    isSyncing: false,
    lastSync: null,
    pendingItems: 0,
    failedItems: 0,
  });

  const syncData = useCallback(async () => {
    try {
      await sync();
      
      if (trackUsage) {
        // Track sync usage
        const { trackFeatureUsage } = await import('../services/analytics');
        trackFeatureUsage('offline_sync', 'manual_sync', {
          pendingItems: status.pendingItems,
        });
      }
    } catch (error) {
      console.error('[useOffline] Failed to sync:', error);
    }
  }, [status.pendingItems, trackUsage]);

  const clearData = useCallback(async () => {
    try {
      await clearAllOfflineData();
      
      if (trackUsage) {
        // Track data clearing
        const { trackFeatureUsage } = await import('../services/analytics');
        trackFeatureUsage('offline_clear', 'manual_clear', {});
      }
    } catch (error) {
      console.error('[useOffline] Failed to clear data:', error);
    }
  }, [trackUsage]);

  const getStats = useCallback(async () => {
    try {
      return await getOfflineStats();
    } catch (error) {
      console.error('[useOffline] Failed to get stats:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    // Get initial status
    const initialStatus = getSyncStatus();
    setStatus(initialStatus);

    // Subscribe to status changes
    const unsubscribe = subscribeToSyncStatus((newStatus) => {
      setStatus(newStatus);
      
      // Auto-sync when coming back online
      if (autoSync && newStatus.isOnline && newStatus.pendingItems > 0) {
        syncData();
      }
    });

    return unsubscribe;
  }, [autoSync, syncData]);

  return {
    isOnline: status.isOnline,
    isSyncing: status.isSyncing,
    lastSync: status.lastSync,
    pendingItems: status.pendingItems,
    failedItems: status.failedItems,
    sync: syncData,
    clearData,
    getStats,
  };
};

/**
 * Hook to cache data for offline access
 */
export const useOfflineCache = (type: string, id: string) => {
  const [cachedData, setCachedData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCachedData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getCachedData(type, id);
      setCachedData(data);
    } catch (err) {
      console.error(`[useOfflineCache] Failed to load cached data for ${type}:${id}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [type, id]);

  const saveCachedData = useCallback(async (data: any) => {
    try {
      await cacheData(type, id, data);
      setCachedData(data);
    } catch (err) {
      console.error(`[useOfflineCache] Failed to save cached data for ${type}:${id}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [type, id]);

  useEffect(() => {
    loadCachedData();
  }, [loadCachedData]);

  return {
    data: cachedData,
    loading,
    error,
    save: saveCachedData,
    refresh: loadCachedData,
  };
};

/**
 * Hook to get all cached data of a type
 */
export const useOfflineCacheList = (type: string) => {
  const [cachedData, setCachedData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAllCachedData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getAllCachedData(type);
      setCachedData(data);
    } catch (err) {
      console.error(`[useOfflineCacheList] Failed to load cached data for ${type}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    loadAllCachedData();
  }, [loadAllCachedData]);

  return {
    data: cachedData,
    loading,
    error,
    refresh: loadAllCachedData,
  };
};

/**
 * Hook to manage sync queue
 */
export const useSyncQueue = () => {
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const addToQueue = useCallback(async (
    type: string,
    action: 'create' | 'update' | 'delete',
    data: any,
    maxRetries: number = 3
  ) => {
    try {
      const queueId = await addToSyncQueue(type, action, data, maxRetries);
      return queueId;
    } catch (err) {
      console.error('[useSyncQueue] Failed to add to queue:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, []);

  const removeFromQueue = useCallback(async (queueId: string) => {
    try {
      await removeFromSyncQueue(queueId);
    } catch (err) {
      console.error('[useSyncQueue] Failed to remove from queue:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  const loadQueueItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would get queue items from the service
      // For now, we'll use a placeholder
      setQueueItems([]);
    } catch (err) {
      console.error('[useSyncQueue] Failed to load queue items:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueueItems();
  }, [loadQueueItems]);

  return {
    items: queueItems,
    loading,
    error,
    add: addToQueue,
    remove: removeFromQueue,
    refresh: loadQueueItems,
  };
};

/**
 * Hook to get offline statistics
 */
export const useOfflineStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const offlineStats = await getOfflineStats();
      setStats(offlineStats);
    } catch (err) {
      console.error('[useOfflineStats] Failed to load stats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refresh: loadStats,
  };
};

export default useOffline;
