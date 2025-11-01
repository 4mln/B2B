import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { HapticTab } from '../../src/components/haptic-tab';
import { useStoreCapabilities } from '../../src/features/stores/hooks';
import { useColorScheme } from '../../src/hooks/use-color-scheme';
import { colors } from '../../src/theme/colors';
import { fontWeights } from '../../src/theme/typography'; // added to fix fontWeight

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const isDark = colorScheme === 'dark';
  const { canManageStores, canSell, canPurchase } = useStoreCapabilities();
  
  // Ensure we have valid capability values to prevent layout issues
  const safeCanManageStores = Boolean(canManageStores);
  const safeCanSell = Boolean(canSell);
  const safeCanPurchase = Boolean(canPurchase);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: isDark ? colors.gray[400] : colors.gray[500],
        tabBarStyle: {
          backgroundColor: isDark ? colors.background.dark : colors.background.light,
          borderTopColor: isDark ? colors.border.light : colors.border.light,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 63 : 49,
          paddingBottom: Platform.OS === 'ios' ? 21 : 10,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.2 : 0.1,
          shadowRadius: 8,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: fontWeights.medium, // fixed
          marginTop: 4,
        },
        headerShown: false,
        tabBarButton: (props) => <HapticTab {...props} />, // fixed
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('navigation.home'),
          tabBarLabel: t('navigation.home'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t('navigation.search'),
          tabBarLabel: t('navigation.search'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'search' : 'search-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      {(safeCanSell || safeCanManageStores) && (
        <Tabs.Screen
          name="add"
          options={{
            title: t('navigation.add'),
            tabBarLabel: t('navigation.add'),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? 'add-circle' : 'add-circle-outline'} 
                size={28} 
                color={color} 
              />
            ),
          }}
        />
      )}
      <Tabs.Screen
        name="chat"
        options={{
          title: t('navigation.chat'),
          tabBarLabel: t('navigation.chat'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('navigation.profile'),
          tabBarLabel: t('navigation.profile'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      {safeCanManageStores && (
        <Tabs.Screen
          name="stores"
          options={{
            title: t('navigation.stores'),
            tabBarLabel: t('navigation.stores'),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? 'storefront' : 'storefront-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
      )}
      <Tabs.Screen
        name="wallet"
        options={{
          title: t('navigation.wallet'),
          tabBarLabel: t('navigation.wallet'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'wallet' : 'wallet-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
