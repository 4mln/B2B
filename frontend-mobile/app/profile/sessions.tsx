import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Modal,
    TextInput,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useMemo } from 'react';

import { authService, UserSession } from '@/services/auth';
import { colors } from '@/theme/colors';
import { semanticSpacing } from '@/theme/spacing';
import { fontWeights, typography } from '@/theme/typography';


interface SessionAnalytics {
  totalSessions: number;
  activeSessions: number;
  revokedSessions: number;
  suspiciousSessions: number;
}

interface DeviceInfo {
  type: 'mobile' | 'desktop' | 'tablet' | 'unknown';
  os: string;
  browser?: string;
  isCurrentSession: boolean;
  isSuspicious: boolean;
  location?: string;
}

export default function SessionsScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSession, setSelectedSession] = useState<UserSession | null>(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'revoked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [analytics, setAnalytics] = useState<SessionAnalytics>({
    totalSessions: 0,
    activeSessions: 0,
    revokedSessions: 0,
    suspiciousSessions: 0,
  });


  // Professional utility functions
  const parseUserAgent = (userAgent: string): DeviceInfo => {
    const isCurrentSession = userAgent.includes('B2B Marketplace Mobile App');
    const isSuspicious = !isCurrentSession && (
      userAgent.includes('bot') || 
      userAgent.includes('crawler') || 
      userAgent.includes('spider') ||
      userAgent.length < 10
    );

    let type: DeviceInfo['type'] = 'unknown';
    let os = 'Unknown OS';
    let browser = 'Unknown Browser';

    if (userAgent.includes('Mobile App')) {
      type = 'mobile';
      os = 'Mobile App';
    } else if (userAgent.includes('iPhone') || userAgent.includes('Android')) {
      type = 'mobile';
      os = userAgent.includes('iPhone') ? 'iOS' : 'Android';
    } else if (userAgent.includes('iPad') || userAgent.includes('Tablet')) {
      type = 'tablet';
      os = 'Tablet OS';
    } else if (userAgent.includes('Windows') || userAgent.includes('Mac') || userAgent.includes('Linux')) {
      type = 'desktop';
      if (userAgent.includes('Windows')) os = 'Windows';
      else if (userAgent.includes('Mac')) os = 'macOS';
      else if (userAgent.includes('Linux')) os = 'Linux';
    }

    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    return {
      type,
      os,
      browser,
      isCurrentSession,
      isSuspicious,
      location: 'Unknown Location', // Would be populated by IP geolocation
    };
  };

  const calculateAnalytics = (sessions: UserSession[]): SessionAnalytics => {
    const totalSessions = sessions.length;
    const activeSessions = sessions.filter(s => !s.is_revoked).length;
    const revokedSessions = sessions.filter(s => s.is_revoked).length;
    const suspiciousSessions = sessions.filter(s => {
      const deviceInfo = parseUserAgent(s.user_agent);
      return deviceInfo.isSuspicious;
    }).length;

    return {
      totalSessions,
      activeSessions,
      revokedSessions,
      suspiciousSessions,
    };
  };

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await authService.getSessions();
      if (response.success && response.data) {
        setSessions(response.data);
        setAnalytics(calculateAnalytics(response.data));
      } else {
        console.error('Failed to load sessions:', response.error);
        Alert.alert(t('errors.error', 'Error'), response.error || t('errors.serverError'));
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      Alert.alert(t('errors.error', 'Error'), t('sessions.loadFailed', 'Failed to load sessions'));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  // Filter and search sessions
  const filteredSessions = useMemo(() => {
    let filtered = sessions;

    // Apply filter
    if (filter === 'active') {
      filtered = filtered.filter(session => !session.is_revoked);
    } else if (filter === 'revoked') {
      filtered = filtered.filter(session => session.is_revoked);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(session => {
        const deviceInfo = parseUserAgent(session.user_agent);
        return (
          deviceInfo.os.toLowerCase().includes(query) ||
          deviceInfo.browser?.toLowerCase().includes(query) ||
          session.ip_address?.toLowerCase().includes(query) ||
          deviceInfo.type.toLowerCase().includes(query)
        );
      });
    }

    // Sort by creation date (newest first)
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [sessions, filter, searchQuery]);

  const showSessionDetailsModal = (session: UserSession) => {
    setSelectedSession(session);
    setShowSessionDetails(true);
  };

  const revokeSession = async (sessionId: number, showConfirmation = true) => {
    const session = sessions.find(s => s.id === sessionId);
    const deviceInfo = session ? parseUserAgent(session.user_agent) : null;
    
    if (showConfirmation) {
      Alert.alert(
        t('sessions.revokeTitle', 'Revoke Session'),
        t('sessions.revokeConfirm', `Are you sure you want to revoke this session?`)+`\n\n`+
        `${t('sessions.device', 'Device')}: ${deviceInfo?.os} ${deviceInfo?.browser || ''}`+`\n`+
        `${t('sessions.ip', 'IP')}: ${session?.ip_address || t('sessions.unknown', 'Unknown')}`,
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('sessions.revoke', 'Revoke'),
            style: 'destructive',
            onPress: () => revokeSession(sessionId, false),
          },
        ]
      );
      return;
    }

    try {
      const response = await authService.revokeSession(sessionId);
      if (response.success) {
        setSessions(prev => {
          const updated = prev.map(session => 
            session.id === sessionId 
              ? { ...session, is_revoked: true }
              : session
          );
          setAnalytics(calculateAnalytics(updated));
          return updated;
        });
        
        Alert.alert(t('common.done'), t('sessions.revoked', 'Session revoked successfully'));
      } else {
        Alert.alert(t('errors.error', 'Error'), response.error || t('sessions.revokeFailed', 'Failed to revoke session'));
      }
    } catch (error) {
      console.error('Failed to revoke session:', error);
      Alert.alert(t('errors.error', 'Error'), t('sessions.revokeFailed', 'Failed to revoke session'));
    }
  };

  const revokeSuspiciousSessions = async () => {
    const suspiciousSessions = sessions.filter(session => {
      const deviceInfo = parseUserAgent(session.user_agent);
      return deviceInfo.isSuspicious && !session.is_revoked;
    });

    if (suspiciousSessions.length === 0) {
      Alert.alert(t('sessions.noneTitle', 'No Suspicious Sessions'), t('sessions.noneDesc', 'No suspicious sessions found to revoke.'));
      return;
    }

    Alert.alert(
      t('sessions.revokeAllTitle', 'Revoke Suspicious Sessions'),
      t('sessions.revokeAllConfirm', 'Found {{count}} suspicious session(s). Do you want to revoke them all?', { count: suspiciousSessions.length }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('sessions.revokeAll', 'Revoke All'),
          style: 'destructive',
          onPress: async () => {
            try {
              const promises = suspiciousSessions.map(session => 
                authService.revokeSession(session.id)
              );
              
              const results = await Promise.allSettled(promises);
              const successCount = results.filter(r => r.status === 'fulfilled').length;
              
              setSessions(prev => {
                const updated = prev.map(session => {
                  if (suspiciousSessions.some(s => s.id === session.id)) {
                    return { ...session, is_revoked: true };
                  }
                  return session;
                });
                setAnalytics(calculateAnalytics(updated));
                return updated;
              });

              Alert.alert(
                t('sessions.revokedTitle', 'Sessions Revoked'), 
                t('sessions.revokedSummary', 'Successfully revoked {{success}} out of {{total}} suspicious sessions.', { success: successCount, total: suspiciousSessions.length })
              );
            } catch (error) {
              console.error('Failed to revoke suspicious sessions:', error);
              Alert.alert(t('errors.error', 'Error'), t('sessions.revokeFailed', 'Failed to revoke suspicious sessions'));
            }
          },
        },
      ]
    );
  };

  const logoutAllSessions = () => {
    const activeSessionsCount = analytics.activeSessions;
    
    Alert.alert(
      t('sessions.logoutAllTitle', 'Logout All Sessions'),
      t('sessions.logoutAllConfirm', 'This will log you out from all {{count}} active device(s). You will need to log in again on all devices.\n\nAre you sure?', { count: activeSessionsCount }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('sessions.logoutAll', 'Logout All'),
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await authService.logoutAllSessions();
              if (response.success) {
                Alert.alert(t('common.done'), t('sessions.logoutAllSuccess', 'Logged out from all sessions'));
                router.back();
              } else {
                Alert.alert(t('errors.error', 'Error'), response.error || t('sessions.logoutAllFailed', 'Failed to logout from all sessions'));
              }
            } catch (error) {
              console.error('Failed to logout all sessions:', error);
              Alert.alert(t('errors.error', 'Error'), t('sessions.logoutAllFailed', 'Failed to logout from all sessions'));
            }
          },
        },
      ]
    );
  };

  // Professional UI helper functions
  const getDeviceIcon = (deviceInfo: DeviceInfo) => {
    if (deviceInfo.isCurrentSession) return 'phone-portrait';
    switch (deviceInfo.type) {
      case 'mobile': return 'phone-portrait-outline';
      case 'tablet': return 'tablet-portrait-outline';
      case 'desktop': return 'desktop-outline';
      default: return 'device-outline';
    }
  };

  const getStatusColor = (session: UserSession, deviceInfo: DeviceInfo) => {
    if (session.is_revoked) return colors.error[500];
    if (deviceInfo.isSuspicious) return colors.warning[500];
    if (deviceInfo.isCurrentSession) return colors.success[500];
    return colors.primary[500];
  };

  const getStatusText = (session: UserSession, deviceInfo: DeviceInfo) => {
    if (session.is_revoked) return 'Revoked';
    if (deviceInfo.isSuspicious) return 'Suspicious';
    if (deviceInfo.isCurrentSession) return 'Current';
    return 'Active';
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderSession = ({ item }: { item: UserSession }) => {
    const deviceInfo = parseUserAgent(item.user_agent);
    const statusColor = getStatusColor(item, deviceInfo);
    const statusText = getStatusText(item, deviceInfo);
    
    return (
      <TouchableOpacity 
        style={styles.sessionItem}
        onPress={() => showSessionDetailsModal(item)}
        activeOpacity={0.7}
      >
        <View style={styles.sessionIcon}>
          <Ionicons
            name={getDeviceIcon(deviceInfo) as any}
            size={24}
            color={statusColor}
          />
        </View>
        <View style={styles.sessionInfo}>
          <View style={styles.sessionHeader}>
            <Text style={[styles.deviceName, { color: isDark ? colors.text.primary : colors.text.primary }]}>
              {deviceInfo.os} {deviceInfo.browser && `• ${deviceInfo.browser}`}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusText}
              </Text>
            </View>
          </View>
          
          <Text style={styles.sessionDetails}>
            {item.ip_address && `IP: ${item.ip_address}`}
          </Text>
          <Text style={styles.sessionDetails}>
            Created: {formatDate(item.created_at)}
          </Text>
          {item.last_seen_at && (
            <Text style={styles.sessionDetails}>
              Last seen: {formatDate(item.last_seen_at)}
            </Text>
          )}
          
          {deviceInfo.isSuspicious && (
            <View style={styles.warningBadge}>
              <Ionicons name="warning-outline" size={12} color={colors.warning[600]} />
              <Text style={[styles.warningText, { color: colors.warning[600] }]}>
                Suspicious activity detected
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.sessionActions}>
          {!item.is_revoked && (
            <TouchableOpacity
              style={styles.revokeButton}
              onPress={() => revokeSession(item.id)}
            >
              <Ionicons name="close-circle-outline" size={20} color={colors.error[500]} />
            </TouchableOpacity>
          )}
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={isDark ? colors.gray[400] : colors.gray[500]} 
          />
        </View>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: semanticSpacing.md,
      paddingVertical: semanticSpacing.lg,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? colors.border.light : colors.border.light,
    },
    backButton: {
      marginRight: semanticSpacing.md,
    },
    headerTitle: {
      fontSize: typography.h3.fontSize,
      fontWeight: typography.h3.fontWeight,
      color: isDark ? colors.text.primary : colors.text.primary,
      flex: 1,
    },
    logoutAllButton: {
      backgroundColor: colors.error[500],
      paddingHorizontal: semanticSpacing.md,
      paddingVertical: semanticSpacing.sm,
      borderRadius: semanticSpacing.radius.md,
    },
    logoutAllText: {
      color: colors.background.light,
      fontSize: typography.caption.fontSize,
      fontWeight: fontWeights.medium,
    },
    content: {
      flex: 1,
      paddingHorizontal: semanticSpacing.md,
    },
    analyticsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: semanticSpacing.lg,
    },
    analyticsCard: {
      flex: 1,
      backgroundColor: isDark ? colors.card.background : colors.card.background,
      borderRadius: semanticSpacing.radius.lg,
      padding: semanticSpacing.md,
      marginHorizontal: semanticSpacing.xs,
      borderWidth: 1,
      borderColor: isDark ? colors.card.border : colors.card.border,
      alignItems: 'center',
    },
    analyticsNumber: {
      fontSize: typography.h3.fontSize,
      fontWeight: typography.h3.fontWeight,
      color: isDark ? colors.text.primary : colors.text.primary,
    },
    analyticsLabel: {
      fontSize: typography.caption.fontSize,
      color: isDark ? colors.text.secondary : colors.text.secondary,
      marginTop: semanticSpacing.xs,
    },
    filterContainer: {
      flexDirection: 'row',
      marginBottom: semanticSpacing.md,
    },
    filterButton: {
      flex: 1,
      paddingVertical: semanticSpacing.sm,
      paddingHorizontal: semanticSpacing.md,
      borderRadius: semanticSpacing.radius.md,
      marginHorizontal: semanticSpacing.xs,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? colors.border.light : colors.border.light,
    },
    filterButtonActive: {
      backgroundColor: colors.primary[500],
      borderColor: colors.primary[500],
    },
    filterButtonText: {
      fontSize: typography.caption.fontSize,
      color: isDark ? colors.text.secondary : colors.text.secondary,
    },
    filterButtonTextActive: {
      color: colors.background.light,
      fontWeight: fontWeights.medium,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.card.background : colors.card.background,
      borderRadius: semanticSpacing.radius.lg,
      paddingHorizontal: semanticSpacing.md,
      marginBottom: semanticSpacing.md,
      borderWidth: 1,
      borderColor: isDark ? colors.card.border : colors.card.border,
    },
    searchInput: {
      flex: 1,
      paddingVertical: semanticSpacing.sm,
      fontSize: typography.body.fontSize,
      color: isDark ? colors.text.primary : colors.text.primary,
    },
    securityButton: {
      backgroundColor: colors.warning[500],
      paddingHorizontal: semanticSpacing.md,
      paddingVertical: semanticSpacing.sm,
      borderRadius: semanticSpacing.radius.md,
      marginBottom: semanticSpacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    securityButtonText: {
      color: colors.background.light,
      fontSize: typography.caption.fontSize,
      fontWeight: fontWeights.medium,
      marginLeft: semanticSpacing.xs,
    },
    sectionTitle: {
      fontSize: typography.h4.fontSize,
      fontWeight: typography.h4.fontWeight,
      color: isDark ? colors.text.primary : colors.text.primary,
      marginBottom: semanticSpacing.md,
    },
    sessionItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: semanticSpacing.md,
      paddingHorizontal: semanticSpacing.sm,
      backgroundColor: isDark ? colors.card.background : colors.card.background,
      borderRadius: semanticSpacing.radius.lg,
      marginBottom: semanticSpacing.sm,
      borderWidth: 1,
      borderColor: isDark ? colors.card.border : colors.card.border,
    },
    sessionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? colors.gray[800] : colors.gray[100],
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: semanticSpacing.md,
    },
    sessionInfo: {
      flex: 1,
    },
    sessionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: semanticSpacing.xs,
    },
    deviceName: {
      fontSize: typography.bodyLarge.fontSize,
      fontWeight: fontWeights.medium,
      flex: 1,
    },
    statusBadge: {
      paddingHorizontal: semanticSpacing.sm,
      paddingVertical: semanticSpacing.xs,
      borderRadius: semanticSpacing.radius.sm,
    },
    statusText: {
      fontSize: typography.caption.fontSize,
      fontWeight: fontWeights.medium,
    },
    sessionDetails: {
      fontSize: typography.caption.fontSize,
      color: isDark ? colors.text.secondary : colors.text.secondary,
      marginBottom: semanticSpacing.xs,
    },
    warningBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: semanticSpacing.xs,
    },
    warningText: {
      fontSize: typography.caption.fontSize,
      fontWeight: fontWeights.medium,
      marginLeft: semanticSpacing.xs,
    },
    sessionActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    revokeButton: {
      padding: semanticSpacing.sm,
      marginRight: semanticSpacing.sm,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: semanticSpacing.xl,
    },
    emptyStateText: {
      fontSize: typography.bodyLarge.fontSize,
      color: isDark ? colors.text.secondary : colors.text.secondary,
      textAlign: 'center',
      marginTop: semanticSpacing.md,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
      borderRadius: semanticSpacing.radius.lg,
      padding: semanticSpacing.lg,
      width: '90%',
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: semanticSpacing.lg,
    },
    modalTitle: {
      fontSize: typography.h4.fontSize,
      fontWeight: typography.h4.fontWeight,
      color: isDark ? colors.text.primary : colors.text.primary,
    },
    modalBody: {
      flex: 1,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: semanticSpacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? colors.border.light : colors.border.light,
    },
    detailLabel: {
      fontSize: typography.body.fontSize,
      color: isDark ? colors.text.secondary : colors.text.secondary,
    },
    detailValue: {
      fontSize: typography.body.fontSize,
      fontWeight: fontWeights.medium,
      color: isDark ? colors.text.primary : colors.text.primary,
    },
  });

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.primary : colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Active Sessions</Text>
        <TouchableOpacity style={styles.logoutAllButton} onPress={logoutAllSessions}>
          <Text style={styles.logoutAllText}>Logout All</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Analytics Cards */}
        <View style={styles.analyticsContainer}>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsNumber}>{analytics.totalSessions}</Text>
            <Text style={styles.analyticsLabel}>Total</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={[styles.analyticsNumber, { color: colors.success[500] }]}>{analytics.activeSessions}</Text>
            <Text style={styles.analyticsLabel}>Active</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={[styles.analyticsNumber, { color: colors.error[500] }]}>{analytics.revokedSessions}</Text>
            <Text style={styles.analyticsLabel}>Revoked</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={[styles.analyticsNumber, { color: colors.warning[500] }]}>{analytics.suspiciousSessions}</Text>
            <Text style={styles.analyticsLabel}>Suspicious</Text>
          </View>
        </View>

        {/* Security Alert */}
        {analytics.suspiciousSessions > 0 && (
          <TouchableOpacity style={styles.securityButton} onPress={revokeSuspiciousSessions}>
            <Ionicons name="shield-outline" size={16} color={colors.background.light} />
            <Text style={styles.securityButtonText}>
              Revoke {analytics.suspiciousSessions} Suspicious Session{analytics.suspiciousSessions > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        )}

        {/* Filters */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
              All ({analytics.totalSessions})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'active' && styles.filterButtonActive]}
            onPress={() => setFilter('active')}
          >
            <Text style={[styles.filterButtonText, filter === 'active' && styles.filterButtonTextActive]}>
              Active ({analytics.activeSessions})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'revoked' && styles.filterButtonActive]}
            onPress={() => setFilter('revoked')}
          >
            <Text style={[styles.filterButtonText, filter === 'revoked' && styles.filterButtonTextActive]}>
              Revoked ({analytics.revokedSessions})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={isDark ? colors.gray[400] : colors.gray[500]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by device, IP, or browser..."
            placeholderTextColor={isDark ? colors.gray[400] : colors.gray[500]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={isDark ? colors.gray[400] : colors.gray[500]} />
            </TouchableOpacity>
          )}
        </View>

        {/* Sessions List */}
        <Text style={styles.sectionTitle}>
          Sessions ({filteredSessions.length})
        </Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <Text style={styles.emptyStateText}>Loading sessions...</Text>
          </View>
        ) : filteredSessions.length > 0 ? (
          <FlatList
            data={filteredSessions}
            renderItem={renderSession}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary[500]]}
                tintColor={isDark ? colors.primary[400] : colors.primary[600]}
              />
            }
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="key-outline"
              size={64}
              color={isDark ? colors.gray[400] : colors.gray[500]}
            />
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'No sessions match your search' : 'No sessions found'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Session Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSessionDetails}
        onRequestClose={() => setShowSessionDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Session Details</Text>
              <TouchableOpacity onPress={() => setShowSessionDetails(false)}>
                <Ionicons name="close" size={24} color={isDark ? colors.gray[400] : colors.gray[600]} />
              </TouchableOpacity>
            </View>
            
            {selectedSession && (
              <ScrollView style={styles.modalBody}>
                {(() => {
                  const deviceInfo = parseUserAgent(selectedSession.user_agent);
                  return (
                    <>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Device Type</Text>
                        <Text style={styles.detailValue}>{deviceInfo.type}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Operating System</Text>
                        <Text style={styles.detailValue}>{deviceInfo.os}</Text>
                      </View>
                      {deviceInfo.browser && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Browser</Text>
                          <Text style={styles.detailValue}>{deviceInfo.browser}</Text>
                        </View>
                      )}
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>IP Address</Text>
                        <Text style={styles.detailValue}>{selectedSession.ip_address || 'Unknown'}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Session ID</Text>
                        <Text style={styles.detailValue}>{selectedSession.id}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Created</Text>
                        <Text style={styles.detailValue}>{formatDate(selectedSession.created_at)}</Text>
                      </View>
                      {selectedSession.last_seen_at && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Last Seen</Text>
                          <Text style={styles.detailValue}>{formatDate(selectedSession.last_seen_at)}</Text>
                        </View>
                      )}
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Status</Text>
                        <Text style={[styles.detailValue, { color: getStatusColor(selectedSession, deviceInfo) }]}>
                          {getStatusText(selectedSession, deviceInfo)}
                        </Text>
                      </View>
                      {deviceInfo.isSuspicious && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Security Alert</Text>
                          <Text style={[styles.detailValue, { color: colors.warning[500] }]}>
                            Suspicious activity detected
                          </Text>
                        </View>
                      )}
                    </>
                  );
                })()}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
