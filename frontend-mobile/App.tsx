import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider } from 'tamagui';
import { initializePlugins } from '@/plugins';
import { PluginNavigation } from '@/navigation/PluginNavigation';
import { useAuthStore } from '@/features/auth/store';
import { initializeConfig } from '@/services/configService';
import { initializeFeatureFlags } from '@/services/featureFlags';
import { initializeOfflineService } from '@/services/offlineService';
import { initializeThemeService } from '@/services/themeService';
import { ThemeProvider } from '@/components/ThemeProvider';
import config from './tamagui.config';

/**
 * Main App Component
 * Initializes plugin system and provides navigation
 */
const queryClient = new QueryClient();

export default function App() {
  const [pluginsInitialized, setPluginsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuthStore();

  // Load Vazirmatn fonts early so font-family references resolve correctly
  const [fontsLoaded] = useFonts({
    'Vazirmatn-Regular': require('./src/assets/fonts/Vazirmatn-Regular.ttf'),
    'Vazirmatn-Medium': require('./src/assets/fonts/Vazirmatn-Medium.ttf'),
    'Vazirmatn-Bold': require('./src/assets/fonts/Vazirmatn-Bold.ttf'),
    'Vazirmatn-Light': require('./src/assets/fonts/Vazirmatn-Light.ttf'),
    'Vazirmatn-SemiBold': require('./src/assets/fonts/Vazirmatn-SemiBold.ttf'),
    'Vazirmatn-Thin': require('./src/assets/fonts/Vazirmatn-Thin.ttf'),
    'Vazirmatn-Black': require('./src/assets/fonts/Vazirmatn-Black.ttf'),
    'Vazirmatn-ExtraBold': require('./src/assets/fonts/Vazirmatn-ExtraBold.ttf'),
    'Vazirmatn-ExtraLight': require('./src/assets/fonts/Vazirmatn-ExtraLight.ttf'),
  });

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('[App] Initializing application...');
      
      // Initialize configuration services
      await Promise.all([
        initializeConfig(),
        initializeFeatureFlags(),
        initializeOfflineService(),
        initializeThemeService(),
      ]);
      
      // Initialize plugin system
      await initializePlugins();
      
      setPluginsInitialized(true);
      console.log('[App] Application initialized successfully');
    } catch (error) {
      console.error('[App] Failed to initialize application:', error);
      setInitializationError('Failed to initialize application');
    }
  };

  if (!fontsLoaded || !pluginsInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
          Initializing plugins...
        </Text>
      </View>
    );
  }

  if (initializationError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF' }}>
        <Text style={{ fontSize: 18, color: '#FF3B30', textAlign: 'center', marginBottom: 16 }}>
          Initialization Error
        </Text>
        <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 24 }}>
          {initializationError}
        </Text>
        <Text 
          style={{ fontSize: 16, color: '#007AFF', textAlign: 'center' }}
          onPress={initializeApp}
        >
          Retry
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <TamaguiProvider config={config} defaultTheme="light">
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <PluginNavigation
              userPermissions={user?.capabilities || []}
            />
          </ThemeProvider>
        </QueryClientProvider>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}
