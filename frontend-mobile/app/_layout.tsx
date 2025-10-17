import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { PortalProvider } from '@tamagui/portal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider } from 'tamagui';
import { ThemeProvider, useThemeContext } from '../src/components/ThemeProvider';
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
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuth();
  const initializeAuth = useAuthStore((s: any) => {
    console.log('🔧 Main Layout: Store selector called, initializeAuth:', typeof s.initializeAuth);
    return s.initializeAuth;
  });
  
  console.log('🔧 Main Layout: initializeAuth function:', typeof initializeAuth);

  // Initialize auth once when layout mounts. Avoid direct or duplicate calls which can
  // re-enter `initializeAuth` and leave `isLoading` stuck true.
  useEffect(() => {
    console.log('🔧 Main Layout: useEffect called, initializing auth...');
    (async () => {
      try {
        console.log('🔧 Main Layout: invoking initializeAuth (await)...');
        await initializeAuth();
        console.log('🔧 Main Layout: initializeAuth completed');
      } catch (error) {
        console.error('🔧 Main Layout: Error calling initializeAuth from useEffect:', error);
      }
    })();
  }, []); // Empty dependency array to run only once

  // Auth redirection is handled by app/index.tsx via <Redirect />
  // Debug overlay removed: earlier implementation caused nested updates in some environments.

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <TamaguiProvider config={require('../tamagui.config').default} defaultTheme="light">
              <ThemeProvider>
                <PortalProvider>
                  <WindowManagerProvider>
                    <ConnectionBanner />
                    <LoginWall />
                    <BackgroundLock />
                    <ThemeSwitcher />
                    <Stack>
                      <Stack.Screen name="index" options={{ headerShown: false }} />
                      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                      <Stack.Screen name="profile/sessions" options={{ headerShown: false }} />
                      <Stack.Screen name="product/[id]" options={{ headerShown: false, presentation: 'modal' }} />
                      <Stack.Screen name="product/create" options={{ headerShown: false, presentation: 'modal' }} />
                      <Stack.Screen name="chat/[id]" options={{ headerShown: false, presentation: 'modal' }} />
                      <Stack.Screen name="rfq/create" options={{ headerShown: false, presentation: 'modal' }} />
                      <Stack.Screen name="stores" options={{ headerShown: false }} />
                      <Stack.Screen name="window-test" options={{ headerShown: false }} />
                      <Stack.Screen name="modal" options={{ presentation: 'modal', title: undefined }} />
                    </Stack>
                    <AppWindows />
                  </WindowManagerProvider>
                </PortalProvider>
              </ThemeProvider>
            </TamaguiProvider>
          </NavigationThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
