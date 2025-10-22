import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { PortalProvider } from '@tamagui/portal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, YStack, ThemeName } from 'tamagui';
import { ThemeProvider, useThemeContext } from '../src/components/ThemeProvider';
import { ThemeWrapper } from '../src/components/ThemeWrapper';
import { initializeThemeService } from '../src/services/themeService';
import { AppWindows, WindowManagerProvider } from '../src/components/window-system';
import '../src/i18n';
import '../src/polyfills/web';
// Polyfill requestAnimationFrame for SSR/web server rendering
if (typeof globalThis.requestAnimationFrame === 'undefined') {
  // @ts-ignore
  globalThis.requestAnimationFrame = (cb: any) => setTimeout(cb, 16);
}
if (typeof globalThis.cancelAnimationFrame === 'undefined') {
  // @ts-ignore
  globalThis.cancelAnimationFrame = (id: any) => clearTimeout(id);
}

import { ConnectionBanner } from '../src/components/ConnectionBanner';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { BackgroundLock, LoginWall, ThemeSwitcher } from '../src/components/LoginWall';
import { useAuth } from '../src/features/auth/hooks';
import { useAuthStore } from '../src/features/auth/store';
import { useColorScheme } from '../src/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

const queryClient = new QueryClient();

export default function RootLayout() {
  console.log('🔧 Main Layout: Component rendering...');
  // Ensure Vazirmatn is loaded for web and native before rendering
  useFonts({
    'Vazirmatn-Regular': require('../src/assets/fonts/Vazirmatn-Regular.ttf'),
    'Vazirmatn-Medium': require('../src/assets/fonts/Vazirmatn-Medium.ttf'),
    'Vazirmatn-Bold': require('../src/assets/fonts/Vazirmatn-Bold.ttf'),
    'Vazirmatn-Light': require('../src/assets/fonts/Vazirmatn-Light.ttf'),
    'Vazirmatn-SemiBold': require('../src/assets/fonts/Vazirmatn-SemiBold.ttf'),
  });
  const { isAuthenticated } = useAuth();
  const initializeAuth = useAuthStore((s: any) => {
    console.log('🔧 Main Layout: Store selector called, initializeAuth:', typeof s.initializeAuth);
    return s.initializeAuth;
  });
  
  // Initialize auth and theme on mount
  useEffect(() => {
    const init = async () => {
      try {
        console.log('🔧 Main Layout: initializing...');
        await Promise.all([
          initializeAuth(),
          initializeThemeService()
        ]);
        console.log('🔧 Main Layout: initialization completed');
      } catch (error) {
        console.error('🔧 Main Layout: Error during initialization:', error);
      }
    };
    init();
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <TamaguiProvider config={require('../tamagui.config').default}>
              <ThemeProvider>
                <InnerLayout />
              </ThemeProvider>
            </TamaguiProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

// Inner layout with access to theme context
function InnerLayout() {
  const { isDark } = useThemeContext();

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <PortalProvider>
        <WindowManagerProvider>
          <ThemeWrapper>
            <YStack flex={1} backgroundColor="$background">
              <ConnectionBanner />
              <LoginWall />
              <BackgroundLock />
              <ThemeSwitcher />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="profile/sessions" />
                <Stack.Screen name="product/[id]" options={{ presentation: 'modal' }} />
                <Stack.Screen name="product/create" options={{ presentation: 'modal' }} />
                <Stack.Screen name="chat/[id]" options={{ presentation: 'modal' }} />
                <Stack.Screen name="rfq/create" options={{ presentation: 'modal' }} />
                <Stack.Screen name="stores" />
                <Stack.Screen name="window-test" />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: undefined }} />
              </Stack>
              <AppWindows />
            </YStack>
          </ThemeWrapper>
        </WindowManagerProvider>
      </PortalProvider>
    </NavigationThemeProvider>
  );
}
