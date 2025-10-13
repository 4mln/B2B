import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { useNotificationsHooks } from './notificationsHooks';
import { notificationsStyles } from './notificationsStyles';
import { Notification, NotificationPreferences } from './types';

/**
 * Notifications Screen Component
 * Main notifications interface for managing notifications and preferences
 * Aligns with backend /notifications endpoints
 */
interface NotificationsScreenProps {
  onBack?: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread' | 'settings'>('all');
  
  const {
    notifications,
    preferences,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    refreshNotifications,
    clearError,
  } = useNotificationsHooks();

  // Handle notification press
  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    // Navigate to relevant screen based on notification type
    // This would be implemented based on the notification's metadata
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      Alert.alert(t('common.done'), t('notifications.markedAllRead', 'All notifications marked as read'));
    } catch (error) {
      Alert.alert(t('errors.error', 'Error'), t('notifications.markAllFailed', 'Failed to mark all as read'));
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      Alert.alert(t('common.done'), t('notifications.deleted', 'Notification deleted'));
    } catch (error) {
      Alert.alert(t('errors.error', 'Error'), t('notifications.deleteFailed', 'Failed to delete notification'));
    }
  };

  // Handle preference change
  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: boolean) => {
    try {
      await updatePreferences({ [key]: value });
    } catch (error) {
      Alert.alert(t('errors.error', 'Error'), t('notifications.prefUpdateFailed', 'Failed to update preferences'));
    }
  };

  // Render notification item
  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        notificationsStyles.notificationItem,
        !item.isRead && notificationsStyles.notificationUnread
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={notificationsStyles.notificationHeader}>
        <Text style={notificationsStyles.notificationTitle}>
          {item.title}
        </Text>
        <Text style={notificationsStyles.notificationTime}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Text style={notificationsStyles.notificationMessage} numberOfLines={3}>
        {item.message}
      </Text>
      <View style={notificationsStyles.notificationFooter}>
        <Text style={notificationsStyles.notificationType}>
          {item.type}
        </Text>
        <TouchableOpacity
          style={notificationsStyles.deleteButton}
          onPress={() => handleDeleteNotification(item.id)}
        >
          <Text style={notificationsStyles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Render preference item
  const renderPreference = ({ item }: { item: { key: keyof NotificationPreferences; label: string; value: boolean } }) => (
    <View style={notificationsStyles.preferenceItem}>
      <View style={notificationsStyles.preferenceInfo}>
        <Text style={notificationsStyles.preferenceLabel}>{item.label}</Text>
        <Text style={notificationsStyles.preferenceDescription}>
          {getPreferenceDescription(item.key)}
        </Text>
      </View>
      <Switch
        value={item.value}
        onValueChange={(value) => handlePreferenceChange(item.key, value)}
        trackColor={{ false: '#E1E5E9', true: '#007AFF' }}
        thumbColor={item.value ? '#FFFFFF' : '#FFFFFF'}
      />
    </View>
  );

  // Get preference description
  const getPreferenceDescription = (key: keyof NotificationPreferences): string => {
    const descriptions: Record<keyof NotificationPreferences, string> = {
      emailNotifications: 'Receive notifications via email',
      pushNotifications: 'Receive push notifications on your device',
      smsNotifications: 'Receive notifications via SMS',
      marketingEmails: 'Receive marketing and promotional emails',
      orderUpdates: 'Get notified about order status changes',
      priceAlerts: 'Get notified when prices change',
      newMessages: 'Get notified about new messages',
      rfqUpdates: 'Get notified about RFQ updates',
      quoteUpdates: 'Get notified about quote updates',
      walletUpdates: 'Get notified about wallet transactions',
      securityAlerts: 'Get notified about security events',
    };
    return descriptions[key] || '';
  };

  // Filter notifications based on selected tab
  const getFilteredNotifications = () => {
    switch (selectedTab) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'all':
      default:
        return notifications;
    }
  };

  // Get preference items
  const getPreferenceItems = () => {
    if (!preferences) return [];
    
    return [
      { key: 'emailNotifications' as keyof NotificationPreferences, label: 'Email Notifications', value: preferences.emailNotifications },
      { key: 'pushNotifications' as keyof NotificationPreferences, label: 'Push Notifications', value: preferences.pushNotifications },
      { key: 'smsNotifications' as keyof NotificationPreferences, label: 'SMS Notifications', value: preferences.smsNotifications },
      { key: 'marketingEmails' as keyof NotificationPreferences, label: 'Marketing Emails', value: preferences.marketingEmails },
      { key: 'orderUpdates' as keyof NotificationPreferences, label: 'Order Updates', value: preferences.orderUpdates },
      { key: 'priceAlerts' as keyof NotificationPreferences, label: 'Price Alerts', value: preferences.priceAlerts },
      { key: 'newMessages' as keyof NotificationPreferences, label: 'New Messages', value: preferences.newMessages },
      { key: 'rfqUpdates' as keyof NotificationPreferences, label: 'RFQ Updates', value: preferences.rfqUpdates },
      { key: 'quoteUpdates' as keyof NotificationPreferences, label: 'Quote Updates', value: preferences.quoteUpdates },
      { key: 'walletUpdates' as keyof NotificationPreferences, label: 'Wallet Updates', value: preferences.walletUpdates },
      { key: 'securityAlerts' as keyof NotificationPreferences, label: 'Security Alerts', value: preferences.securityAlerts },
    ];
  };

  if (loading && !notifications.length) {
    return (
      <View style={notificationsStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={notificationsStyles.loadingText}>{t('notifications.loading', 'Loading notifications...')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={notificationsStyles.errorContainer}>
        <Text style={notificationsStyles.errorText}>{error || t('errors.unknownError')}</Text>
        <TouchableOpacity style={notificationsStyles.retryButton} onPress={refreshNotifications}>
          <Text style={notificationsStyles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={notificationsStyles.container}>
      {/* Header */}
      <View style={notificationsStyles.header}>
        <TouchableOpacity onPress={onBack} style={notificationsStyles.backButton}>
          <Text style={notificationsStyles.backButtonText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={notificationsStyles.headerTitle}>{t('profile.notifications')}</Text>
        <TouchableOpacity 
          style={notificationsStyles.markAllButton}
          onPress={handleMarkAllAsRead}
        >
          <Text style={notificationsStyles.markAllButtonText}>{t('notifications.markAll', 'Mark All')}</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={notificationsStyles.tabsContainer}>
        <TouchableOpacity
          style={[
            notificationsStyles.tab,
            selectedTab === 'all' && notificationsStyles.tabActive
          ]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[
            notificationsStyles.tabText,
            selectedTab === 'all' && notificationsStyles.tabTextActive
          ]}>
            {t('notifications.all', 'All')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            notificationsStyles.tab,
            selectedTab === 'unread' && notificationsStyles.tabActive
          ]}
          onPress={() => setSelectedTab('unread')}
        >
          <Text style={[
            notificationsStyles.tabText,
            selectedTab === 'unread' && notificationsStyles.tabTextActive
          ]}>
            {t('notifications.unread', 'Unread')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            notificationsStyles.tab,
            selectedTab === 'settings' && notificationsStyles.tabActive
          ]}
          onPress={() => setSelectedTab('settings')}
        >
          <Text style={[
            notificationsStyles.tabText,
            selectedTab === 'settings' && notificationsStyles.tabTextActive
          ]}>
            {t('profile.settings')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {selectedTab === 'settings' ? (
        <View style={notificationsStyles.settingsContainer}>
          <Text style={notificationsStyles.settingsTitle}>{t('notifications.preferences', 'Notification Preferences')}</Text>
          <FlatList
            data={getPreferenceItems()}
            renderItem={renderPreference}
            keyExtractor={(item) => item.key}
            style={notificationsStyles.preferencesList}
          />
        </View>
      ) : (
        <View style={notificationsStyles.notificationsContainer}>
          <View style={notificationsStyles.notificationsHeader}>
            <Text style={notificationsStyles.notificationsTitle}>
              {selectedTab === 'unread' ? t('notifications.unreadTitle', 'Unread Notifications') : t('notifications.allTitle', 'All Notifications')}
            </Text>
            <Text style={notificationsStyles.notificationsCount}>
              {t('notifications.count', '{{count}} notifications', { count: getFilteredNotifications().length })}
            </Text>
          </View>
          
          <FlatList
            data={getFilteredNotifications()}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id}
            style={notificationsStyles.notificationsList}
            refreshing={loading}
            onRefresh={refreshNotifications}
            ListEmptyComponent={
              <View style={notificationsStyles.emptyState}>
                <Text style={notificationsStyles.emptyStateText}>
                  {selectedTab === 'unread' ? t('notifications.noneUnread', 'No unread notifications') : t('notifications.none', 'No notifications yet')}
                </Text>
              </View>
            }
          />
        </View>
      )}
    </View>
  );
};

export default NotificationsScreen;
