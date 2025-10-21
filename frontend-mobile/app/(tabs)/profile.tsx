import { useAuth, useProfile } from '@/features/auth/hooks';
import { useStoreCapabilities } from '@/features/stores/hooks';
import { useWalletBalance } from '@/features/wallet/hooks';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeContext } from '@/components/ThemeProvider';
import i18n from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View as Box, Image, Pressable, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XStack as HStack, Text, YStack as VStack } from 'tamagui';

import { colors } from '@/theme/colors';
import { useThemeModeStore } from '@/theme/modeStore';
import { semanticSpacing } from '@/theme/spacing';
import { fontWeights, typography } from '@/theme/typography';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, logout } = useAuth();
  const { data: profile } = useProfile();
  const { data: walletBalance } = useWalletBalance();
  const { canManageStores, canSell, canPurchase, user: storeUser } = useStoreCapabilities();
  const { setTheme } = useThemeContext();
  
  // Subscribe to theme changes
  const themeMode = useThemeModeStore();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [currentLng, setCurrentLng] = useState(() => (i18n.language || 'en').startsWith('fa') ? 'fa' : 'en');
  const [, setLangTick] = useState(0);
  const [, forceUpdate] = useState(0);

  // Force re-render when theme changes
  useEffect(() => {
    console.log('Theme changed to:', themeMode.mode);
    forceUpdate(prev => prev + 1);
  }, [themeMode.mode]);

  const handleThemeToggle = async (value: boolean) => {
    const newMode = value ? 'dark' : 'light';
    console.log('Theme toggle:', { value, newMode });
    await setTheme(newMode);
    forceUpdate(prev => prev + 1);
  };

  const changeLanguage = async (lng: 'en' | 'fa') => {
    if (lng === currentLng) return;
    try {
      await i18n.changeLanguage(lng);
      setCurrentLng(lng);
      setLangTick((x) => x + 1);
    } catch (error) {
      console.error('Language change error:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      t('profileScreen.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('auth.logout'), onPress: logout, style: 'destructive' },
      ]
    );
  };

  const handleEditProfile = () => {
    console.log('Edit profile');
  };

  const handleWallet = () => {
    router.push('/wallet');
  };

  const handleSessions = () => {
    router.push('/profile/sessions');
  };

  const handleConnections = () => {
    router.push('/admin/connections');
  };

  const handleSettings = () => {
    console.log('Open settings');
  };

  const handleHelp = () => {
    console.log('Open help');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
    },
    header: {
      paddingHorizontal: semanticSpacing.md,
      paddingVertical: semanticSpacing.lg,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? colors.border.light : colors.border.light,
    },
    profileSection: {
      alignItems: 'center',
      marginBottom: semanticSpacing.lg,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary[100],
      marginBottom: semanticSpacing.md,
    },
    userName: {
      fontSize: typography.h3.fontSize,
      fontWeight: typography.h3.fontWeight,
      color: isDark ? '#f8fafc' : colors.text.primary,
      marginBottom: semanticSpacing.xs,
    },
    userRole: {
      fontSize: typography.body.fontSize,
      color: isDark ? '#cbd5e1' : colors.text.secondary,
    },
    capabilitiesContainer: {
      marginTop: semanticSpacing.md,
      alignItems: 'center',
    },
    capabilitiesTitle: {
      fontSize: typography.bodySmall.fontSize,
      color: isDark ? '#cbd5e1' : colors.text.secondary,
      marginBottom: semanticSpacing.sm,
    },
    capabilitiesList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 4,
    },
    capabilityTag: {
      backgroundColor: colors.primary[100],
      paddingHorizontal: semanticSpacing.sm,
      paddingVertical: 2,
      borderRadius: semanticSpacing.radius.sm,
      marginHorizontal: 2,
    },
    capabilityText: {
      fontSize: typography.caption.fontSize,
      color: colors.primary[700],
      textTransform: 'capitalize',
    },
    content: {
      flex: 1,
      paddingHorizontal: semanticSpacing.md,
    },
    section: {
      marginBottom: semanticSpacing.xl,
    },
    sectionTitle: {
      fontSize: typography.h4.fontSize,
      fontWeight: typography.h4.fontWeight,
      color: isDark ? '#f8fafc' : colors.text.primary,
      marginBottom: semanticSpacing.md,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: semanticSpacing.md,
      paddingHorizontal: semanticSpacing.sm,
      backgroundColor: isDark ? colors.card.background : colors.card.background,
      borderRadius: semanticSpacing.radius.lg,
      marginBottom: semanticSpacing.sm,
      borderWidth: 1,
      borderColor: isDark ? colors.card.border : colors.card.border,
    },
    menuIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary[100],
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: semanticSpacing.md,
    },
    menuContent: {
      flex: 1,
    },
    menuTitle: {
      fontSize: typography.bodyLarge.fontSize,
      fontWeight: fontWeights.medium,
      color: isDark ? '#f8fafc' : colors.text.primary,
      marginBottom: semanticSpacing.xs,
    },
    menuSubtitle: {
      fontSize: typography.bodySmall.fontSize,
      color: isDark ? '#cbd5e1' : colors.text.secondary,
    },
    menuArrow: {
      marginLeft: semanticSpacing.sm,
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: semanticSpacing.md,
      paddingHorizontal: semanticSpacing.sm,
      backgroundColor: isDark ? colors.card.background : colors.card.background,
      borderRadius: semanticSpacing.radius.lg,
      marginBottom: semanticSpacing.sm,
      borderWidth: 1,
      borderColor: isDark ? colors.card.border : colors.card.border,
    },
    switchContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    switchIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary[100],
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: semanticSpacing.md,
    },
    switchText: {
      fontSize: typography.bodyLarge.fontSize,
      fontWeight: fontWeights.medium,
      color: isDark ? '#f8fafc' : colors.text.primary,
    },
    langRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: semanticSpacing.md,
      paddingHorizontal: semanticSpacing.sm,
      backgroundColor: isDark ? colors.card.background : colors.card.background,
      borderRadius: semanticSpacing.radius.lg,
      marginBottom: semanticSpacing.sm,
      borderWidth: 1,
      borderColor: isDark ? colors.card.border : colors.card.border,
    },
    langButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    langBtn: {
      paddingHorizontal: semanticSpacing.md,
      paddingVertical: semanticSpacing.sm,
      borderRadius: semanticSpacing.radius.md,
      borderWidth: 1,
      borderColor: colors.primary[500],
      backgroundColor: 'transparent',
      marginLeft: semanticSpacing.sm,
    },
    langBtnActive: {
      backgroundColor: colors.primary[500],
    },
    langBtnText: {
      color: colors.primary[600],
      fontWeight: '600',
    },
    langBtnTextActive: {
      color: colors.background.light,
    },
    logoutButton: {
      backgroundColor: colors.error[500],
      borderRadius: semanticSpacing.radius.lg,
      paddingVertical: semanticSpacing.md,
      alignItems: 'center',
      marginTop: semanticSpacing.xl,
      marginBottom: semanticSpacing.xl,
    },
    logoutText: {
      fontSize: typography.button.fontSize,
      fontWeight: typography.button.fontWeight,
      color: colors.background.light,
    },
    versionText: {
      fontSize: typography.caption.fontSize,
      color: isDark ? '#94a3b8' : colors.text.tertiary,
      textAlign: 'center',
      marginBottom: semanticSpacing.lg,
    },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* Header */}
      <Box padding={16} borderBottomWidth={1} borderBottomColor="$borderLight200">
        <VStack alignItems="center" space="md">
          <Image 
            source={{ uri: user?.avatar || 'https://via.placeholder.com/80' }} 
            style={{ width: 80, height: 80, borderRadius: 40 }}
          />
          <Text fontSize="$2xl" fontWeight="$bold" color="$textLight900">
            {user?.name || profile?.name || storeUser?.name || 'User Name'}
          </Text>
          <Text fontSize="$md" color="$textLight600">
            {user?.email || user?.phone || storeUser?.email || 'Buyer/Seller'}
          </Text>
          {storeUser?.capabilities && storeUser.capabilities.length > 0 && (
            <VStack alignItems="center" space="sm">
              <Text fontSize="$sm" color="$textLight600">Capabilities:</Text>
              <HStack space="xs" flexWrap="wrap" justifyContent="center">
                {storeUser.capabilities.map((capability, index) => (
                  <Box
                    key={index}
                    backgroundColor="$primary100"
                    paddingHorizontal={8}
                    paddingVertical={4}
                    borderRadius="$sm"
                  >
                    <Text fontSize="$xs" color="$primary700" textTransform="capitalize">
                      {capability.replace('can_', '').replace('_', ' ')}
                    </Text>
                  </Box>
                ))}
              </HStack>
            </VStack>
          )}
        </VStack>
      </Box>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* Account Section */}
        <VStack space="lg" marginBottom={24}>
          <Text fontSize="$lg" fontWeight="$semibold" color="$textLight900">
            {t('profileScreen.account')}
          </Text>
          
          <Pressable onPress={handleEditProfile}>
            <HStack alignItems="center" padding={12} backgroundColor="$backgroundLight50" borderRadius="$lg" borderWidth={1} borderColor="$borderLight200">
              <Box width={10} height={10} borderRadius="$full" backgroundColor="$primary100" justifyContent="center" alignItems="center" marginRight={12}>
                <Ionicons name="person-outline" size={20} color="#3b82f6" />
              </Box>
              <VStack flex={1}>
                <Text fontSize="$md" fontWeight="$medium" color="$textLight900">
                  {t('profile.editProfile')}
                </Text>
                <Text fontSize="$sm" color="$textLight600">
                  {t('profileScreen.updateInfo')}
                </Text>
              </VStack>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </HStack>
          </Pressable>

          <Pressable onPress={handleWallet}>
            <HStack alignItems="center" padding={12} backgroundColor="$backgroundLight50" borderRadius="$lg" borderWidth={1} borderColor="$borderLight200">
              <Box width={10} height={10} borderRadius="$full" backgroundColor="$primary100" justifyContent="center" alignItems="center" marginRight={12}>
                <Ionicons name="wallet-outline" size={20} color="#3b82f6" />
              </Box>
              <VStack flex={1}>
                <Text fontSize="$md" fontWeight="$medium" color="$textLight900">
                  {t('profile.wallet')}
                </Text>
                <Text fontSize="$sm" color="$textLight600">
                  {walletBalance ? `${t('wallet.balance')}: ${walletBalance.balance.toLocaleString()} ${walletBalance.currency}` : t('profileScreen.walletDesc')}
                </Text>
              </VStack>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </HStack>
          </Pressable>

          {canManageStores && (
            <Pressable onPress={() => router.push('/stores')}>
              <HStack alignItems="center" padding={12} backgroundColor="$backgroundLight50" borderRadius="$lg" borderWidth={1} borderColor="$borderLight200">
                <Box width={10} height={10} borderRadius="$full" backgroundColor="$primary100" justifyContent="center" alignItems="center" marginRight={12}>
                  <Ionicons name="storefront-outline" size={20} color="#3b82f6" />
                </Box>
                <VStack flex={1}>
                  <Text fontSize="$md" fontWeight="$medium" color="$textLight900">
                    Manage Stores
                  </Text>
                  <Text fontSize="$sm" color="$textLight600">
                    Create and manage your stores
                  </Text>
                </VStack>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </HStack>
            </Pressable>
          )}

          <Pressable onPress={handleSessions}>
            <HStack alignItems="center" padding={12} backgroundColor="$backgroundLight50" borderRadius="$lg" borderWidth={1} borderColor="$borderLight200">
              <Box width={10} height={10} borderRadius="$full" backgroundColor="$primary100" justifyContent="center" alignItems="center" marginRight={12}>
                <Ionicons name="key-outline" size={20} color="#3b82f6" />
              </Box>
              <VStack flex={1}>
                <Text fontSize="$md" fontWeight="$medium" color="$textLight900">
                  {t('profileScreen.activeSessions')}
                </Text>
                <Text fontSize="$sm" color="$textLight600">
                  {t('profileScreen.activeSessionsDesc')}
                </Text>
              </VStack>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </HStack>
          </Pressable>
        </VStack>

        {/* Settings Section */}
        <VStack space="lg" marginBottom={24}>
          <Text fontSize="$lg" fontWeight="$semibold" color="$textLight900">
            {t('profileScreen.settings')}
          </Text>
          
          <HStack alignItems="center" justifyContent="space-between" padding={12} backgroundColor="$backgroundLight50" borderRadius="$lg" borderWidth={1} borderColor="$borderLight200">
            <HStack alignItems="center" flex={1}>
              <Box width={10} height={10} borderRadius="$full" backgroundColor="$primary100" justifyContent="center" alignItems="center" marginRight={12}>
                <Ionicons name="notifications-outline" size={20} color="#3b82f6" />
              </Box>
              <Text fontSize="$md" fontWeight="$medium" color="$textLight900">
                {t('profile.notifications')}
              </Text>
            </HStack>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#d1d5db', true: '#bfdbfe' }}
              thumbColor={notificationsEnabled ? '#3b82f6' : '#9ca3af'}
            />
          </HStack>

          <HStack alignItems="center" justifyContent="space-between" padding={12} backgroundColor="$backgroundLight50" borderRadius="$lg" borderWidth={1} borderColor="$borderLight200">
            <HStack alignItems="center" flex={1}>
              <Box width={10} height={10} borderRadius="$full" backgroundColor="$primary100" justifyContent="center" alignItems="center" marginRight={12}>
                <Ionicons name="moon-outline" size={20} color="#3b82f6" />
              </Box>
              <Text fontSize="$md" fontWeight="$medium" color="$textLight900">
                {t('profile.theme')} ({isDark ? 'dark' : 'light'})
              </Text>
            </HStack>
            <Switch
              value={isDark}
              onValueChange={handleThemeToggle}
              trackColor={{ false: '#d1d5db', true: '#bfdbfe' }}
              thumbColor={mode === 'dark' ? '#3b82f6' : '#9ca3af'}
            />
          </HStack>


          {/* Language selector */}
          <HStack alignItems="center" justifyContent="space-between" padding={12} backgroundColor="$backgroundLight50" borderRadius="$lg" borderWidth={1} borderColor="$borderLight200">
            <HStack alignItems="center" flex={1}>
              <Box width={10} height={10} borderRadius="$full" backgroundColor="$primary100" justifyContent="center" alignItems="center" marginRight={12}>
                <Ionicons name="language-outline" size={20} color="#3b82f6" />
              </Box>
              <Text fontSize="$md" fontWeight="$medium" color="$textLight900">
                {t('profile.language') || 'Language'}
              </Text>
            </HStack>
            <HStack space="sm">
              <Pressable
                backgroundColor={currentLng === 'en' ? '$primary500' : 'transparent'}
                borderWidth={1}
                borderColor="$primary500"
                paddingHorizontal={12}
                paddingVertical={8}
                borderRadius="$md"
                onPress={() => changeLanguage('en')}
              >
                <Text color={currentLng === 'en' ? '$white' : '$primary600'} fontWeight="$semibold">
                  English
                </Text>
              </Pressable>
              <Pressable
                backgroundColor={currentLng === 'fa' ? '$primary500' : 'transparent'}
                borderWidth={1}
                borderColor="$primary500"
                paddingHorizontal={12}
                paddingVertical={8}
                borderRadius="$md"
                onPress={() => changeLanguage('fa')}
              >
                <Text color={currentLng === 'fa' ? '$white' : '$primary600'} fontWeight="$semibold">
                  فارسی
                </Text>
              </Pressable>
            </HStack>
          </HStack>
        </VStack>

        {/* Support Section */}
        <VStack space="lg" marginBottom={24}>
          <Text fontSize="$lg" fontWeight="$semibold" color="$textLight900">
            {t('profileScreen.support')}
          </Text>
          
          <Pressable onPress={handleHelp}>
            <HStack alignItems="center" padding={12} backgroundColor="$backgroundLight50" borderRadius="$lg" borderWidth={1} borderColor="$borderLight200">
              <Box width={10} height={10} borderRadius="$full" backgroundColor="$primary100" justifyContent="center" alignItems="center" marginRight={12}>
                <Ionicons name="help-circle-outline" size={20} color="#3b82f6" />
              </Box>
              <VStack flex={1}>
                <Text fontSize="$md" fontWeight="$medium" color="$textLight900">
                  {t('profile.help')}
                </Text>
                <Text fontSize="$sm" color="$textLight600">
                  {t('profileScreen.getHelp')}
                </Text>
              </VStack>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </HStack>
          </Pressable>

          <Pressable>
            <HStack alignItems="center" padding={12} backgroundColor="$backgroundLight50" borderRadius="$lg" borderWidth={1} borderColor="$borderLight200">
              <Box width={10} height={10} borderRadius="$full" backgroundColor="$primary100" justifyContent="center" alignItems="center" marginRight={12}>
                <Ionicons name="information-circle-outline" size={20} color="#3b82f6" />
              </Box>
              <VStack flex={1}>
                <Text fontSize="$md" fontWeight="$medium" color="$textLight900">
                  {t('profile.about')}
                </Text>
                <Text fontSize="$sm" color="$textLight600">
                  {t('profileScreen.aboutDesc')}
                </Text>
              </VStack>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </HStack>
          </Pressable>
        </VStack>

        {/* Logout Button */}
        <Pressable backgroundColor="$error500" borderRadius="$lg" paddingVertical={12} alignItems="center" marginBottom={24} onPress={handleLogout}>
          <Text fontSize="$md" fontWeight="$semibold" color="$white">
            {t('auth.logout')}
          </Text>
        </Pressable>

        {/* Version */}
        <Text fontSize="$xs" color="$textLight500" textAlign="center" marginBottom={16}>
          {t('profile.version', { version: '2.1.0' })}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
