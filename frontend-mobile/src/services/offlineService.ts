import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import { trackFeatureUsage } from './analytics';

/**
 * Offline Service
 * Manages offline capabilities and data synchronization
 * Provides caching, sync queues, and conflict resolution
 */

export interface OfflineData {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  synced: boolean;
  version: number;
  conflicts?: any[];
}

export interface SyncQueue {
  id: string;
  type: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: number | null;
  pendingItems: number;
  failedItems: number;
}

export interface ConflictResolution {
  strategy: 'server' | 'client' | 'merge' | 'manual';
  resolution?: any;
}

class OfflineService {
  private isOnline: boolean = true;
  private isSyncing: boolean = false;
  private syncQueue: SyncQueue[] = [];
  private listeners: Map<string, Set<(status: SyncStatus) => void>> = new Map();
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Initialize offline service
   */
  async initialize(): Promise<void> {
    try {
      // Set up network monitoring
      this.setupNetworkMonitoring();
      
      // Load sync queue from storage
      await this.loadSyncQueue();
      
      // Start background sync
      this.startBackgroundSync();
      
      console.log('[OfflineService] Initialized successfully');
    } catch (error) {
      console.error('[OfflineService] Failed to initialize:', error);
    }
  }

  /**
   * Set up network monitoring
   */
  private setupNetworkMonitoring(): void {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      if (!wasOnline && this.isOnline) {
        // Came back online, start sync
        this.sync();
      }
      
      // Notify listeners
      this.notifyListeners();
    });
  }

  /**
   * Start background sync
   */
  private startBackgroundSync(): void {
    // Sync every 30 seconds when online
    setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.sync();
      }
    }, 30000);
  }

  /**
   * Check if device is online
   */
  isDeviceOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Get sync status
   */
  getSyncStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSync: this.getLastSyncTime(),
      pendingItems: this.syncQueue.length,
      failedItems: this.syncQueue.filter(item => item.retryCount >= item.maxRetries).length,
    };
  }

  /**
   * Subscribe to sync status changes
   */
  subscribe(callback: (status: SyncStatus) => void): () => void {
    const id = Math.random().toString(36);
    if (!this.listeners.has('status')) {
      this.listeners.set('status', new Set());
    }
    this.listeners.get('status')!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get('status');
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete('status');
        }
      }
    };
  }

  /**
   * Cache data for offline access
   */
  async cacheData(type: string, id: string, data: any): Promise<void> {
    try {
      const cacheKey = `offline_${type}_${id}`;
      const offlineData: OfflineData = {
        id,
        type,
        data,
        timestamp: Date.now(),
        synced: true,
        version: 1,
      };
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(offlineData));
      
      // Track caching
      trackFeatureUsage('offline_cache', 'store', {
        type,
        id,
        size: JSON.stringify(data).length,
      });
    } catch (error) {
      console.error('[OfflineService] Failed to cache data:', error);
    }
  }

  /**
   * Get cached data
   */
  async getCachedData(type: string, id: string): Promise<any | null> {
    try {
      const cacheKey = `offline_${type}_${id}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (cached) {
        const offlineData: OfflineData = JSON.parse(cached);
        return offlineData.data;
      }
      
      return null;
    } catch (error) {
      console.error('[OfflineService] Failed to get cached data:', error);
      return null;
    }
  }

  /**
   * Get all cached data of a type
   */
  async getAllCachedData(type: string): Promise<any[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const typeKeys = keys.filter(key => key.startsWith(`offline_${type}_`));
      
      const results = await Promise.all(
        typeKeys.map(async key => {
          const cached = await AsyncStorage.getItem(key);
          if (cached) {
            const offlineData: OfflineData = JSON.parse(cached);
            return offlineData.data;
          }
          return null;
        })
      );
      
      return results.filter(data => data !== null);
    } catch (error) {
      console.error('[OfflineService] Failed to get all cached data:', error);
      return [];
    }
  }

  /**
   * Add item to sync queue
   */
  async addToSyncQueue(
    type: string,
    action: 'create' | 'update' | 'delete',
    data: any,
    maxRetries: number = 3
  ): Promise<string> {
    try {
      const queueItem: SyncQueue = {
        id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        action,
        data,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries,
      };
      
      this.syncQueue.push(queueItem);
      await this.saveSyncQueue();
      
      // Try to sync immediately if online
      if (this.isOnline) {
        this.sync();
      }
      
      // Track sync queue addition
      trackFeatureUsage('offline_sync', 'queue_add', {
        type,
        action,
        queueSize: this.syncQueue.length,
      });
      
      return queueItem.id;
    } catch (error) {
      console.error('[OfflineService] Failed to add to sync queue:', error);
      throw error;
    }
  }

  /**
   * Remove item from sync queue
   */
  async removeFromSyncQueue(queueId: string): Promise<void> {
    try {
      this.syncQueue = this.syncQueue.filter(item => item.id !== queueId);
      await this.saveSyncQueue();
      
      // Clear retry timeout if exists
      const timeout = this.retryTimeouts.get(queueId);
      if (timeout) {
        clearTimeout(timeout);
        this.retryTimeouts.delete(queueId);
      }
    } catch (error) {
      console.error('[OfflineService] Failed to remove from sync queue:', error);
    }
  }

  /**
   * Sync all pending items
   */
  async sync(): Promise<void> {
    if (this.isSyncing || !this.isOnline || this.syncQueue.length === 0) {
      return;
    }
    
    try {
      this.isSyncing = true;
      this.notifyListeners();
      
      const itemsToSync = [...this.syncQueue];
      const results = await Promise.allSettled(
        itemsToSync.map(item => this.syncItem(item))
      );
      
      // Process results
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const item = itemsToSync[i];
        
        if (result.status === 'fulfilled') {
          // Success, remove from queue
          await this.removeFromSyncQueue(item.id);
        } else {
          // Failed, increment retry count
          item.retryCount++;
          if (item.retryCount >= item.maxRetries) {
            // Max retries reached, remove from queue
            await this.removeFromSyncQueue(item.id);
          } else {
            // Schedule retry
            this.scheduleRetry(item);
          }
        }
      }
      
      // Track sync completion
      trackFeatureUsage('offline_sync', 'complete', {
        totalItems: itemsToSync.length,
        successful: results.filter(r => r.status === 'fulfilled').length,
        failed: results.filter(r => r.status === 'rejected').length,
      });
      
    } catch (error) {
      console.error('[OfflineService] Failed to sync:', error);
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  /**
   * Sync individual item
   */
  private async syncItem(item: SyncQueue): Promise<void> {
    try {
      // In a real app, this would make actual API calls
      const response = await fetch(`/api/${item.type}`, {
        method: item.action === 'delete' ? 'DELETE' : 
                item.action === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: item.action !== 'delete' ? JSON.stringify(item.data) : undefined,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Update cache if successful
      if (item.action !== 'delete') {
        await this.cacheData(item.type, item.data.id, item.data);
      }
      
    } catch (error) {
      console.error(`[OfflineService] Failed to sync item ${item.id}:`, error);
      throw error;
    }
  }

  /**
   * Schedule retry for failed item
   */
  private scheduleRetry(item: SyncQueue): void {
    const retryDelay = Math.min(1000 * Math.pow(2, item.retryCount), 30000); // Exponential backoff, max 30s
    
    const timeout = setTimeout(() => {
      this.retryTimeouts.delete(item.id);
      if (this.isOnline) {
        this.sync();
      }
    }, retryDelay);
    
    this.retryTimeouts.set(item.id, timeout);
  }

  /**
   * Load sync queue from storage
   */
  private async loadSyncQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('offline_sync_queue');
      if (stored) {
        this.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('[OfflineService] Failed to load sync queue:', error);
    }
  }

  /**
   * Save sync queue to storage
   */
  private async saveSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem('offline_sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('[OfflineService] Failed to save sync queue:', error);
    }
  }

  /**
   * Get last sync time
   */
  private getLastSyncTime(): number | null {
    const lastSync = this.syncQueue
      .filter(item => item.synced)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    
    return lastSync?.timestamp || null;
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    const status = this.getSyncStatus();
    this.listeners.forEach((listeners, key) => {
      if (key === 'status') {
        listeners.forEach(callback => callback(status));
      }
    });
  }

  /**
   * Clear all offline data
   */
  async clearAllData(): Promise<void> {
    try {
      // Clear sync queue
      this.syncQueue = [];
      await this.saveSyncQueue();
      
      // Clear all cached data
      const keys = await AsyncStorage.getAllKeys();
      const offlineKeys = keys.filter(key => key.startsWith('offline_'));
      await AsyncStorage.multiRemove(offlineKeys);
      
      // Clear retry timeouts
      this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
      this.retryTimeouts.clear();
      
      console.log('[OfflineService] Cleared all offline data');
    } catch (error) {
      console.error('[OfflineService] Failed to clear all data:', error);
    }
  }

  /**
   * Get offline data statistics
   */
  async getOfflineStats(): Promise<{
    totalCached: number;
    totalQueued: number;
    lastSync: number | null;
    storageUsed: number;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const offlineKeys = keys.filter(key => key.startsWith('offline_'));
      
      let totalSize = 0;
      for (const key of offlineKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          totalSize += data.length;
        }
      }
      
      return {
        totalCached: offlineKeys.length,
        totalQueued: this.syncQueue.length,
        lastSync: this.getLastSyncTime(),
        storageUsed: totalSize,
      };
    } catch (error) {
      console.error('[OfflineService] Failed to get offline stats:', error);
      return {
        totalCached: 0,
        totalQueued: 0,
        lastSync: null,
        storageUsed: 0,
      };
    }
  }
}

// Create singleton instance
const offlineService = new OfflineService();

// Export convenience functions
export const initializeOfflineService = () => offlineService.initialize();
export const isDeviceOnline = () => offlineService.isDeviceOnline();
export const getSyncStatus = () => offlineService.getSyncStatus();
export const subscribeToSyncStatus = (callback: (status: SyncStatus) => void) => 
  offlineService.subscribe(callback);
export const cacheData = (type: string, id: string, data: any) => 
  offlineService.cacheData(type, id, data);
export const getCachedData = (type: string, id: string) => 
  offlineService.getCachedData(type, id);
export const getAllCachedData = (type: string) => 
  offlineService.getAllCachedData(type);
export const addToSyncQueue = (type: string, action: 'create' | 'update' | 'delete', data: any, maxRetries?: number) => 
  offlineService.addToSyncQueue(type, action, data, maxRetries);
export const removeFromSyncQueue = (queueId: string) => 
  offlineService.removeFromSyncQueue(queueId);
export const sync = () => offlineService.sync();
export const clearAllOfflineData = () => offlineService.clearAllData();
export const getOfflineStats = () => offlineService.getOfflineStats();

export default offlineService;
