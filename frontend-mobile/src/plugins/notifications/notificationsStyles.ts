import { StyleSheet } from 'react-native';

/**
 * Notifications Styles
 * StyleSheet for notifications components
 * Maintains consistent styling across notifications functionality
 */
export const notificationsStyles = StyleSheet.create({
  // Container styles
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
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  
  backButton: {
    padding: 8,
  },
  
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    flex: 1,
    textAlign: 'center',
  },
  
  markAllButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  
  markAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Tabs styles
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  
  tabActive: {
    borderBottomColor: '#007AFF',
  },
  
  tabText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  
  // Notifications container styles
  notificationsContainer: {
    flex: 1,
    paddingVertical: 16,
  },
  
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  
  notificationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  
  notificationsCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  
  notificationsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  // Notification item styles
  notificationItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  notificationUnread: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    flex: 1,
    marginRight: 8,
  },
  
  notificationTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  
  notificationMessage: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 12,
  },
  
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  notificationType: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Settings container styles
  settingsContainer: {
    flex: 1,
    paddingVertical: 16,
  },
  
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  
  preferencesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  // Preference item styles
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  
  preferenceDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  
  // Loading and error styles
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
  
  errorText: {
    fontSize: 16,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Empty state styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  
  // Notification types styles
  notificationTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  
  notificationTypeInfo: {
    backgroundColor: '#E3F2FD',
  },
  
  notificationTypeSuccess: {
    backgroundColor: '#E8F5E8',
  },
  
  notificationTypeWarning: {
    backgroundColor: '#FFF3E0',
  },
  
  notificationTypeError: {
    backgroundColor: '#FFEBEE',
  },
  
  notificationTypeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  
  notificationTypeTextInfo: {
    color: '#1976D2',
  },
  
  notificationTypeTextSuccess: {
    color: '#388E3C',
  },
  
  notificationTypeTextWarning: {
    color: '#F57C00',
  },
  
  notificationTypeTextError: {
    color: '#D32F2F',
  },
  
  // Notification actions styles
  notificationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  
  notificationActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  
  notificationActionButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  
  notificationActionButtonSecondary: {
    backgroundColor: '#F0F0F0',
  },
  
  notificationActionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  notificationActionButtonTextPrimary: {
    color: '#FFFFFF',
  },
  
  notificationActionButtonTextSecondary: {
    color: '#1D1D1F',
  },
  
  // Notification priority styles
  notificationPriority: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  
  notificationPriorityHigh: {
    backgroundColor: '#FFEBEE',
  },
  
  notificationPriorityMedium: {
    backgroundColor: '#FFF3E0',
  },
  
  notificationPriorityLow: {
    backgroundColor: '#E8F5E8',
  },
  
  notificationPriorityText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  
  notificationPriorityTextHigh: {
    color: '#D32F2F',
  },
  
  notificationPriorityTextMedium: {
    color: '#F57C00',
  },
  
  notificationPriorityTextLow: {
    color: '#388E3C',
  },
  
  // Notification channels styles
  notificationChannel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  
  notificationChannelIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  
  notificationChannelInfo: {
    flex: 1,
  },
  
  notificationChannelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  
  notificationChannelDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  
  notificationChannelStatus: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  
  // Notification templates styles
  notificationTemplate: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  
  notificationTemplateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  notificationTemplateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  
  notificationTemplateType: {
    fontSize: 12,
    color: '#8E8E93',
    backgroundColor: '#E1E5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  
  notificationTemplateContent: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 8,
  },
  
  notificationTemplateActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  
  notificationTemplateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  
  notificationTemplateButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  
  notificationTemplateButtonSecondary: {
    backgroundColor: '#F0F0F0',
  },
  
  notificationTemplateButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  notificationTemplateButtonTextPrimary: {
    color: '#FFFFFF',
  },
  
  notificationTemplateButtonTextSecondary: {
    color: '#1D1D1F',
  },
  
  // Notification analytics styles
  notificationAnalytics: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    margin: 16,
  },
  
  notificationAnalyticsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  
  notificationAnalyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  notificationAnalyticsCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  
  notificationAnalyticsCardTitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  
  notificationAnalyticsCardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  
  // Notification filters styles
  notificationFilters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  
  notificationFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E5E9',
    marginRight: 8,
  },
  
  notificationFilterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  
  notificationFilterButtonText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  
  notificationFilterButtonTextActive: {
    color: '#FFFFFF',
  },
});

export default notificationsStyles;
