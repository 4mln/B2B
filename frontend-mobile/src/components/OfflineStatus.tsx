import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useOffline } from '@/hooks/useOffline';

/**
 * Offline Status Component
 * Shows sync status and offline capabilities to users
 */

export interface OfflineStatusProps {
  showDetails?: boolean;
  onSyncPress?: () => void;
  onClearPress?: () => void;
}

export const OfflineStatus: React.FC<OfflineStatusProps> = ({
  showDetails = false,
  onSyncPress,
  onClearPress,
}) => {
  const { t } = useTranslation();
  const { isOnline, isSyncing, lastSync, pendingItems, failedItems, sync, clearData } = useOffline();
  
  const [pulseAnim] = React.useState(new Animated.Value(1));

  // Pulse animation for syncing
  React.useEffect(() => {
    if (isSyncing) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isSyncing, pulseAnim]);

  const handleSyncPress = async () => {
    try {
      await sync();
      onSyncPress?.();
    } catch (error) {
      console.error('[OfflineStatus] Failed to sync:', error);
    }
  };

  const handleClearPress = async () => {
    try {
      await clearData();
      onClearPress?.();
    } catch (error) {
      console.error('[OfflineStatus] Failed to clear data:', error);
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return '#FF3B30'; // Red for offline
    if (isSyncing) return '#007AFF'; // Blue for syncing
    if (failedItems > 0) return '#FF9500'; // Orange for failed items
    if (pendingItems > 0) return '#34C759'; // Green for pending items
    return '#8E8E93'; // Gray for idle
  };

  const getStatusText = () => {
    if (!isOnline) return t('offline.offline', 'Offline');
    if (isSyncing) return t('offline.syncing', 'Syncing...');
    if (failedItems > 0) return t('offline.failedCount', '{{count}} failed', { count: failedItems });
    if (pendingItems > 0) return t('offline.pendingCount', '{{count}} pending', { count: pendingItems });
    return t('offline.synced', 'Synced');
  };

  const getLastSyncText = () => {
    if (!lastSync) return t('offline.neverSynced', 'Never synced');
    
    const now = Date.now();
    const diff = now - lastSync;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return t('offline.daysAgo', '{{count}}d ago', { count: days });
    if (hours > 0) return t('offline.hoursAgo', '{{count}}h ago', { count: hours });
    if (minutes > 0) return t('offline.minutesAgo', '{{count}}m ago', { count: minutes });
    return t('offline.justNow', 'Just now');
  };

  return (
    <View style={styles.container}>
      {/* Status Indicator */}
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
        <Animated.View
          style={[
            styles.statusDot,
            { opacity: isSyncing ? pulseAnim : 1 }
          ]}
        />
      </View>
      
      {/* Status Text */}
      <View style={styles.statusText}>
        <Text style={styles.statusLabel}>{getStatusText()}</Text>
        {showDetails && (
          <Text style={styles.statusDetails}>
            {isOnline ? `${t('offline.lastSync', 'Last sync')}: ${getLastSyncText()}` : t('errors.networkOffline')}
          </Text>
        )}
      </View>
      
      {/* Action Buttons */}
      {showDetails && (
        <View style={styles.actions}>
          {isOnline && pendingItems > 0 && (
            <TouchableOpacity
              style={[styles.actionButton, styles.syncButton]}
              onPress={handleSyncPress}
              disabled={isSyncing}
            >
              <Text style={styles.actionButtonText}>
                {isSyncing ? t('offline.syncing', 'Syncing...') : t('offline.sync', 'Sync')}
              </Text>
            </TouchableOpacity>
          )}
          
          {failedItems > 0 && (
            <TouchableOpacity
              style={[styles.actionButton, styles.clearButton]}
              onPress={handleClearPress}
            >
              <Text style={styles.actionButtonText}>{t('offline.clear', 'Clear')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

/**
 * Compact Offline Status
 * Shows minimal offline status
 */
export const CompactOfflineStatus: React.FC = () => {
  const { isOnline, isSyncing, pendingItems, failedItems } = useOffline();
  
  const getStatusIcon = () => {
    if (!isOnline) return '🔴';
    if (isSyncing) return '🔄';
    if (failedItems > 0) return '⚠️';
    if (pendingItems > 0) return '🟡';
    return '🟢';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isSyncing) return 'Syncing';
    if (failedItems > 0) return `${failedItems} failed`;
    if (pendingItems > 0) return `${pendingItems} pending`;
    return 'Online';
  };

  return (
    <View style={styles.compactContainer}>
      <Text style={styles.compactIcon}>{getStatusIcon()}</Text>
      <Text style={styles.compactText}>{getStatusText()}</Text>
    </View>
  );
};

/**
 * Offline Banner
 * Shows full-width offline banner
 */
export const OfflineBanner: React.FC = () => {
  const { isOnline, isSyncing, pendingItems, failedItems, sync } = useOffline();
  
  if (isOnline) return null;
  
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerText}>
        You're offline. Some features may be limited.
      </Text>
      {pendingItems > 0 && (
        <TouchableOpacity
          style={styles.bannerButton}
          onPress={sync}
        >
          <Text style={styles.bannerButtonText}>Sync</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    margin: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  statusText: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  statusDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  syncButton: {
    backgroundColor: '#007AFF',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  compactIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  compactText: {
    fontSize: 12,
    color: '#666',
  },
  banner: {
    backgroundColor: '#FF3B30',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  bannerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  bannerButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default OfflineStatus;
