import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useThemeConfig, useFeatureConfig, useSetting } from '@/hooks/useConfig';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { refreshConfig, clearConfig } from '@/services/configService';
import { refreshFeatureFlags, clearFeatureFlags } from '@/services/featureFlags';

/**
 * Configuration Screen
 * Allows users to view and manage app configuration
 */

export const ConfigScreen: React.FC = () => {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get theme configuration
  const { theme, loading: themeLoading, error: themeError } = useThemeConfig();
  
  // Get feature flags
  const { enabled: analyticsEnabled } = useFeatureFlag('analytics');
  const { enabled: monitoringEnabled } = useFeatureFlag('monitoring');
  const { enabled: darkModeEnabled } = useFeatureFlag('dark_mode');
  
  // Get settings
  const { value: apiTimeout } = useSetting('api_timeout');
  const { value: retryAttempts } = useSetting('retry_attempts');

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        refreshConfig(),
        refreshFeatureFlags(),
      ]);
      Alert.alert(t('common.done'), t('config.refreshed', 'Configuration refreshed successfully'));
    } catch (error) {
      Alert.alert(t('errors.error', 'Error'), t('config.refreshFailed', 'Failed to refresh configuration'));
    } finally {
      setRefreshing(false);
    }
  };

  const handleClearCache = async () => {
    try {
      await Promise.all([
        clearConfig(),
        clearFeatureFlags(),
      ]);
      Alert.alert(t('common.done'), t('config.cleared', 'Configuration cache cleared successfully'));
    } catch (error) {
      Alert.alert(t('errors.error', 'Error'), t('config.clearFailed', 'Failed to clear configuration cache'));
    }
  };

  const handleToggleFeature = (featureName: string, enabled: boolean) => {
    // In a real app, this would update the backend
    Alert.alert(
      t('config.featureToggle', 'Feature Toggle'),
      `${featureName} ${enabled ? t('config.enabled', 'enabled') : t('config.disabled', 'disabled')}`,
      [{ text: t('common.done') }]
    );
  };

  const handleUpdateSetting = (key: string, value: any) => {
    // In a real app, this would update the backend
    Alert.alert(
      t('config.settingUpdated', 'Setting Updated'),
      t('config.settingSetTo', '{{key}} set to {{value}}', { key, value }),
      [{ text: t('common.done') }]
    );
  };

  if (themeLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>{t('config.loading', 'Loading configuration...')}</Text>
      </View>
    );
  }

  if (themeError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t('config.loadFailed', 'Failed to load configuration')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('config.title', 'Configuration')}</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={styles.refreshButtonText}>{t('common.retry')}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('config.searchPlaceholder', 'Search configuration...')}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Theme Configuration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('config.theme', 'Theme')}</Text>
        {theme && (
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>{t('config.primaryColor', 'Primary Color')}</Text>
            <Text style={styles.configValue}>{theme.primaryColor}</Text>
          </View>
        )}
        {theme && (
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>{t('config.secondaryColor', 'Secondary Color')}</Text>
            <Text style={styles.configValue}>{theme.secondaryColor}</Text>
          </View>
        )}
        {theme && (
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>{t('config.backgroundColor', 'Background Color')}</Text>
            <Text style={styles.configValue}>{theme.backgroundColor}</Text>
          </View>
        )}
        {theme && (
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>{t('config.textColor', 'Text Color')}</Text>
            <Text style={styles.configValue}>{theme.textColor}</Text>
          </View>
        )}
        <View style={styles.configItem}>
          <Text style={styles.configLabel}>{t('profile.theme', 'Theme')}</Text>
          <Switch
            value={darkModeEnabled}
            onValueChange={(value) => handleToggleFeature('dark_mode', value)}
          />
        </View>
      </View>

      {/* Feature Flags */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('config.featureFlags', 'Feature Flags')}</Text>
        <View style={styles.configItem}>
          <Text style={styles.configLabel}>{t('config.analytics', 'Analytics')}</Text>
          <Switch
            value={analyticsEnabled}
            onValueChange={(value) => handleToggleFeature('analytics', value)}
          />
        </View>
        <View style={styles.configItem}>
          <Text style={styles.configLabel}>{t('config.monitoring', 'Monitoring')}</Text>
          <Switch
            value={monitoringEnabled}
            onValueChange={(value) => handleToggleFeature('monitoring', value)}
          />
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('config.settings', 'Settings')}</Text>
        <View style={styles.configItem}>
          <Text style={styles.configLabel}>{t('config.apiTimeout', 'API Timeout')}</Text>
          <Text style={styles.configValue}>{apiTimeout || t('common.notSet','Not set')}</Text>
        </View>
        <View style={styles.configItem}>
          <Text style={styles.configLabel}>{t('config.retryAttempts', 'Retry Attempts')}</Text>
          <Text style={styles.configValue}>{retryAttempts || t('common.notSet','Not set')}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('config.actions', 'Actions')}</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Text style={styles.actionButtonText}>{t('config.refreshConfiguration', 'Refresh Configuration')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.clearButton]}
          onPress={handleClearCache}
        >
          <Text style={[styles.actionButtonText, styles.clearButtonText]}>
            {t('config.clearCache', 'Clear Cache')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  configLabel: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  configValue: {
    fontSize: 14,
    color: '#666',
    marginLeft: 16,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  clearButtonText: {
    color: '#FFFFFF',
  },
});

export default ConfigScreen;
