import { MessageBox } from '@/components/MessageBox';
import { useThemeContext } from '@/components/ThemeProvider';
import { useTheme as useTamaguiTheme } from 'tamagui';
import { showErrorMessage, showInfoMessage, showWarningMessage, useMessageBoxStore } from '@/context/messageBoxStore';
import { useAuth, useSendOTP, useVerifyOTP } from '@/features/auth/hooks';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StatusBar, TextInput } from 'react-native';
import { AnimatePresence, Stack as Box, Button, XStack as HStack, Spinner, Text, YStack as VStack } from 'tamagui';
import { create } from 'zustand';
import LoginScreen from '../../app/auth/login';
import SignupScreen from '../../app/auth/signup';

// Theme switcher component
export const ThemeSwitcher: React.FC = () => {
  const { isDark, setTheme } = useThemeContext();
  const [isPanelVisible, setIsPanelVisible] = React.useState(false);

  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    try {
      console.log('🔍 ThemeSwitcher: Switching to theme:', newTheme);
      await setTheme(newTheme);
      togglePanel();
    } catch (error) {
      console.error('🔍 ThemeSwitcher: Failed to set theme:', error);
    }
  };

  const togglePanel = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  return (
    <Box 
      position="absolute" 
      top={60} 
      right={20} 
      zIndex={10000}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Trigger Button */}
      <Pressable onPress={togglePanel} style={{ padding: 8 }}>
        <Box
          width={40}
          height={40}
          borderRadius="$full"
          backgroundColor={isDark ? '$backgroundDark50' : '$backgroundLight100'}
          borderWidth={1}
          borderColor={isDark ? '$borderLight300' : '$borderLight200'}
          alignItems="center"
          justifyContent="center"
          shadowColor="#000"
          shadowOpacity={0.1}
          shadowRadius={4}
        >
          <Ionicons
            name={isDark ? 'sunny' : 'moon'}
            size={20}
            color={isDark ? '#fbbf24' : '#374151'}
          />
        </Box>
      </Pressable>

      {/* Sliding Panel */}
      <AnimatePresence>
        {isPanelVisible && (
          <Box
            position="absolute"
            top={50}
            right={0}
            zIndex={10000}
            animation="bouncy"
            enterStyle={{
              opacity: 0,
              scale: 0.8,
              y: 50
            }}
            exitStyle={{
              opacity: 0,
              scale: 0.8,
              y: -100
            }}
          >
            <Box
              width={180}
              backgroundColor={isDark ? '$backgroundDark0' : '$backgroundLight0'}
              borderRadius="$md"
              borderWidth={1}
              borderColor={isDark ? '$borderLight300' : '$borderLight200'}
              padding="$md"
              shadowColor="#000"
              shadowOpacity={0.15}
              shadowRadius={8}
            >
              <VStack space="$sm">
                <Text fontSize="$sm" fontWeight="$medium" textAlign="center" color="$textLight600">
                  Switch Theme
                </Text>

                <HStack space="$sm" justifyContent="center">
                  <Pressable
                    onPress={() => handleThemeChange('light')}
                    style={{ flex: 1, alignItems: 'center', padding: 8 }}
                  >
                    <Box
                      width={36}
                      height={36}
                      borderRadius="$full"
                      backgroundColor={!isDark ? '$primary500' : '$backgroundLight100'}
                      borderWidth={2}
                      borderColor={!isDark ? '$primary500' : '$borderLight300'}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Ionicons name="sunny" size={18} color={!isDark ? 'white' : '$textLight600'} />
                    </Box>
                    <Text fontSize="$xs" marginTop="$xs" color="$textLight600">
                      Light
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleThemeChange('dark')}
                    style={{ flex: 1, alignItems: 'center', padding: 8 }}
                  >
                    <Box
                      width={36}
                      height={36}
                      borderRadius="$full"
                      backgroundColor={isDark ? '$primary500' : '$backgroundLight100'}
                      borderWidth={2}
                      borderColor={isDark ? '$primary500' : '$borderLight300'}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Ionicons name="moon" size={18} color={isDark ? 'white' : '$textLight600'} />
                    </Box>
                    <Text fontSize="$xs" marginTop="$xs" color="$textLight600">
                      Dark
                    </Text>
                  </Pressable>
                </HStack>
              </VStack>
            </Box>
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
};

// Store for managing login wall state
interface LoginWallState {
  isVisible: boolean;
  setVisible: (visible: boolean) => void;
}

export const useLoginWallStore = create<LoginWallState>((set) => ({
  isVisible: false,
  setVisible: (visible: boolean) => set({ isVisible: visible }),
}));

export const LoginWall: React.FC = () => {
  const { approved, isLoading, isAuthenticated } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const messageBox = useMessageBoxStore();
  const { isVisible, setVisible } = useLoginWallStore();
  const [mode, setMode] = React.useState<'login' | 'signup' | 'otp'>('login');
  const [prevMode, setPrevMode] = React.useState<'login' | 'signup'>('login');
  const [pendingPhone, setPendingPhone] = React.useState<string | undefined>(undefined);
  const [loadingTimeoutExceeded, setLoadingTimeoutExceeded] = React.useState(false);
  const loginScreenRef = React.useRef<any>(null);

  // Debug logging
  if (__DEV__) console.log('LoginWall - Auth State:', { approved, isLoading });

  // Show loading screen while authentication is initializing
  // If initialization hangs for >8s, allow showing the Login UI (fallback) so user isn't blocked.
  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isLoading) {
      setLoadingTimeoutExceeded(false);
      timer = setTimeout(() => {
        if (__DEV__) console.log('LoginWall - auth initialization timeout exceeded, enabling fallback UI');
        setLoadingTimeoutExceeded(true);
      }, 8000);
    } else {
      setLoadingTimeoutExceeded(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);

  // Update global visibility state when login wall should be shown/hidden
  React.useEffect(() => {
    const shouldBeVisible = !approved || !isAuthenticated;
    setVisible(shouldBeVisible);
  }, [approved, isAuthenticated, setVisible]);

  // Auto-focus phone input when login wall becomes visible
  React.useEffect(() => {
    console.log('🔍 LoginWall: Visibility changed to:', isVisible);

    if (isVisible) {
      console.log('🔍 LoginWall: Login wall visible, attempting auto-focus');

      // Try multiple methods to focus the input
      setTimeout(() => {
        // Method 1: Try through ref
        if (loginScreenRef.current) {
          loginScreenRef.current?.focusPhoneInput?.();
        }

        // Method 2: Try to find and focus input directly
        const inputs = document.querySelectorAll('input[type="text"], input[type="tel"], input[autofocus]');
        console.log('🔍 LoginWall: Found potential inputs:', inputs.length);

        if (inputs.length > 0) {
          for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i] as HTMLInputElement;
            if (input && input.offsetParent !== null) { // Check if visible
              input.focus();
              console.log('🔍 LoginWall: Focused input directly:', i);
              break;
            }
          }
        }
      }, 150);
    }
  }, [isVisible]);

  // Enhanced focus trap for keyboard navigation
  React.useEffect(() => {
    if (!isVisible) return;

    console.log('🔍 LoginWall: Setting up enhanced focus trap');

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Tab navigation - contain focus within modal
      if (e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();

        // Get all focusable elements within the modal only
        const modalContainer = document.querySelector('[data-login-wall-modal]');
        if (!modalContainer) {
          console.log('🔍 LoginWall: Modal container not found');
          return;
        }

        const focusableElements = modalContainer.querySelectorAll(
          'input, button, textarea, select, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'
        );

        const focusableArray = Array.from(focusableElements).filter(el => {
          const element = el as HTMLElement;
          return element.offsetParent !== null && // Must be visible
                 element.getAttribute('aria-hidden') !== 'true'; // Must not be aria-hidden
        });

        console.log('🔍 LoginWall: Found focusable elements:', focusableArray.length);

        if (focusableArray.length === 0) {
          console.log('🔍 LoginWall: No focusable elements found');
          return;
        }

        const currentIndex = focusableArray.indexOf(document.activeElement as Element);
        let nextIndex;

        if (e.shiftKey) {
          // Shift+Tab - go to previous element
          nextIndex = currentIndex <= 0 ? focusableArray.length - 1 : currentIndex - 1;
        } else {
          // Tab - go to next element
          nextIndex = currentIndex >= focusableArray.length - 1 ? 0 : currentIndex + 1;
        }

        console.log('🔍 LoginWall: Focusing element at index:', nextIndex);
        (focusableArray[nextIndex] as HTMLElement)?.focus();
        return;
      }

      // Handle Enter key - submit form or trigger focused button
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();

        const activeElement = document.activeElement as HTMLElement;

        // If focused on input field, submit the login form (WEB ONLY)
        if (activeElement && activeElement.tagName === 'INPUT' && typeof window !== 'undefined') {
          console.log('🔍 LoginWall: Enter pressed on input field - submitting form (WEB)');

          // Web-specific approach: use a more reliable method to find and trigger login
          try {
            // Method 1: Find button by text content (most reliable for web)
            const allButtons = Array.from(document.querySelectorAll('button'));
            console.log('🔍 LoginWall: Total buttons found:', allButtons.length);

            // Look for login/submit button by content
            const loginButton = allButtons.find(btn => {
              const text = btn.textContent?.toLowerCase() || '';
              return text.includes('login') || text.includes('send') || text.includes('verify');
            });

            if (loginButton) {
              console.log('🔍 LoginWall: Found login button by text:', loginButton.textContent);
              loginButton.click();
              return;
            }

            // Method 2: Find by class name or data attributes
            const buttonByClass = document.querySelector('.login-button, [data-testid="login"], [data-cy="login"]') as HTMLElement;
            if (buttonByClass) {
              console.log('🔍 LoginWall: Found login button by class/attribute');
              buttonByClass.click();
              return;
            }

            // Method 3: Find the last button in the modal (likely to be the submit button)
            const modalButtons = document.querySelectorAll('[data-login-wall-modal] button');
            if (modalButtons.length > 0) {
              const lastButton = modalButtons[modalButtons.length - 1] as HTMLElement;
              console.log('🔍 LoginWall: Using last button in modal');
              lastButton.click();
              return;
            }

            console.log('🔍 LoginWall: No login button found with any method');
          } catch (error) {
            console.error('🔍 LoginWall: Error triggering login button:', error);
          }
        }

        // If focused on button, trigger it
        if (activeElement && (activeElement.tagName === 'BUTTON' || activeElement.onclick)) {
          console.log('🔍 LoginWall: Enter pressed on focused button');
          activeElement.click();
          return;
        }
      }

      // Handle Escape key - close modal
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔍 LoginWall: Escape pressed - modal should close');
        // The modal will handle closing through its own logic
        return;
      }
    };

    // Use capture phase and prevent background elements from receiving events
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', (e) => e.stopPropagation(), true);

    return () => {
      console.log('🔍 LoginWall: Cleaning up focus trap');
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', (e) => e.stopPropagation(), true);
    };
  }, [isVisible]);

  // If still in the initial loading phase (and fallback hasn't kicked in yet) show a standalone loading card
  if (isLoading && !loadingTimeoutExceeded) {
    if (__DEV__) console.log('LoginWall - Still loading auth state, showing loading screen');
    return (
      <Box
        position="absolute"
        top={0}
        right={0}
        bottom={0}
        left={0}
        zIndex={9999}
        // Semi-transparent backdrop that covers entire screen
        style={{
          pointerEvents: 'auto',
          backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)',
        }}
      >
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
        <Box flex={1} justifyContent="center" alignItems="center" pointerEvents="box-none">
          <Box
            borderRadius={16}
            padding={32}
            alignItems="center"
            space={16}
            style={{
              pointerEvents: 'auto',
              // Dynamic width with 10% padding and smooth animation
              backgroundColor: isDark ? 'rgba(11,11,11,0.98)' : 'rgba(255,255,255,0.98)',
              width: 'auto',
              maxWidth: '90%',
              minWidth: '280px',
              alignSelf: 'center',
            }}
            animation="quick"
          >
            <VStack space="$md" alignItems="center">
              <Spinner size="small" color="$primary500" />
              <Text fontSize="$md" fontWeight="$medium" color={isDark ? '$textDark100' : '$textLight600'}>
                Loading...
              </Text>
              <Text fontSize="$sm" fontWeight="$normal" color={isDark ? '$textDark300' : '$textLight400'}>
                Initializing authentication...
              </Text>
            </VStack>
          </Box>
        </Box>
        <MessageBox />
      </Box>
    );
  }

  const switchMode = (next: 'login' | 'signup' | 'otp') => {
    // Switch mode immediately - AnimatePresence handles the animation
    setMode(next);
  };

  // Only dismiss when explicitly approved after OTP and user is authenticated
  if (approved && isAuthenticated) {
    if (__DEV__) console.log('LoginWall - User approved and authenticated, hiding LoginWall');
    return null;
  }

  if (__DEV__) console.log('LoginWall - User not approved/authenticated, showing LoginWall modal', { approved, isAuthenticated });

  // Main modal overlay with backdrop to lock background
  return (
    <Box
      position="absolute"
      top={0}
      right={0}
      bottom={0}
      left={0}
      zIndex={9999}
      // Semi-transparent backdrop that covers entire screen
      style={{
        pointerEvents: 'auto',
        backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)',
      }}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
      <Box flex={1} justifyContent="center" alignItems="center" paddingHorizontal={16} pointerEvents="box-none" width="100%">
        <Box
          borderRadius={16}
          overflow="hidden"
          maxHeight="90%"
          data-login-wall-modal // 🆕 Identifier for focus trap
          // Dynamic width based on content with 10% padding and smooth animation
          style={{
            pointerEvents: 'auto',
            backgroundColor: isDark ? 'rgba(11,11,11,0.98)' : 'rgba(255,255,255,0.98)',
            width: 'auto',
            maxWidth: '90%',
            minWidth: '320px',
            alignSelf: 'center',
          }}
          animation="quick"
        >
          <ScrollView
            style={{ maxHeight: '100%', width: '100%' }}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingVertical: 24,
              minHeight: '100%',
              alignItems: 'center'
            }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            <AnimatePresence>
              {mode === 'login' && (
                <Box
                  key="login"
                  animation="bouncy"
                  enterStyle={{
                    opacity: 0,
                    scale: 0.8,
                    y: 50
                  }}
                  exitStyle={{
                    opacity: 0,
                    scale: 0.8,
                    y: 100
                  }}
                >
                  <LoginScreen
                    ref={loginScreenRef}
                    initialPhone={pendingPhone}
                    onNavigateToSignup={(phone) => {
                      if (phone) setPendingPhone(phone);
                      switchMode('signup');
                    }}
                    onOtpRequested={async (phone) => {
                      setPrevMode('login');
                      setPendingPhone(phone);
                      switchMode('otp');
                    }}
                  />
                </Box>
              )}
              {mode === 'signup' && (
                <Box
                  key="signup"
                  animation="bouncy"
                  enterStyle={{
                    opacity: 0,
                    scale: 0.8,
                    y: 50
                  }}
                  exitStyle={{
                    opacity: 0,
                    scale: 0.8,
                    y: 100
                  }}
                >
                  <SignupScreen
                    embedded
                    initialPhone={pendingPhone}
                    onNavigateToLogin={() => switchMode('login')}
                    onOtpRequested={async (phone) => {
                      setPrevMode('signup');
                      setPendingPhone(phone);
                      switchMode('otp');
                    }}
                  />
                </Box>
              )}
              {mode === 'otp' && (
                <Box
                  key="otp"
                  animation="bouncy"
                  enterStyle={{
                    opacity: 0,
                    scale: 0.8,
                    y: 50
                  }}
                  exitStyle={{
                    opacity: 0,
                    scale: 0.8,
                    y: 100
                  }}
                >
                  <InlineOtp
                    phone={pendingPhone}
                    origin={prevMode}
                    onBack={() => switchMode(prevMode)}
                    onSuccess={() => {
                      if (prevMode === 'signup') {
                        // Show congrats message, then go to login
                        showInfoMessage(
                          t('auth.signupCongratsLogin', 'Congrats! you signed up successfully, login now.'),
                          [
                            {
                              label: t('auth.login', 'Login'),
                              onPress: () => switchMode('login'),
                            },
                          ],
                          t('auth.success', 'Success')
                        );
                      } else {
                        // After login verification, proceed into the app
                        try {
                          router.replace('/(tabs)');
                        } catch {}
                      }
                    }}
                  />
                </Box>
              )}
            </AnimatePresence>
          </ScrollView>
        </Box>
      </Box>
      <MessageBox />
    </Box>
  );
};

// Background lock component to disable interactions when login wall is visible
// Note: Theme switcher area (top-right corner) is excluded from locking
export const BackgroundLock: React.FC = () => {
  const { isVisible } = useLoginWallStore();

  if (!isVisible) {
    return null;
  }

  return (
    <Box
      position="absolute"
      top={0}
      right={0}
      bottom={0}
      left={0}
      zIndex={9998}
      // Invisible overlay that captures all touch events to lock background
      style={{
        pointerEvents: 'auto',
        backgroundColor: 'transparent',
      }}
    />
  );
};

// Hook to check if navigation is allowed (login wall not blocking)
export const useCanNavigate = () => {
  const { isVisible } = useLoginWallStore();
  return !isVisible;
};

// Hook to prevent navigation when login wall is visible
export const useNavigationGuard = () => {
  const canNavigate = useCanNavigate();

  const guardedNavigate = React.useCallback((navigationFn: () => void) => {
    if (canNavigate) {
      navigationFn();
    }
  }, [canNavigate]);

  return { canNavigate, guardedNavigate };
};

type InlineOtpProps = {
  phone?: string;
  origin?: 'signup' | 'login';
  onBack: () => void;
  onSuccess: () => void;
};

const InlineOtp: React.FC<InlineOtpProps> = ({ phone, origin = 'login', onBack, onSuccess }) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [otp, setOtp] = React.useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(60);
  const [canResend, setCanResend] = React.useState(false);
  const inputRefs = React.useRef<TextInput[]>([]);
  const verifyOTPMutation = useVerifyOTP();
  const messageBox = useMessageBoxStore();
  const sendOTPMutation = useSendOTP();
  const [isResending, setIsResending] = React.useState(false);

  React.useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Focus first input on mount
  React.useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    // keep only one numeric digit
    const digitOnly = value.replace(/\D/g, '').slice(0, 1);
    const next = [...otp];
    next[index] = digitOnly;
    setOtp(next);
    if (digitOnly && index < 5) inputRefs.current[index + 1]?.focus();
    if (next.every(d => d !== '') && next.join('').length === 6) {
      handleVerify(next.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleVerify = async (code?: string) => {
    const codeStr = code || otp.join('');
    if (codeStr.length !== 6 || !phone) return;
    setIsLoading(true);
    try {
      await verifyOTPMutation.mutateAsync({ phone: String(phone).trim(), otp: codeStr.trim() });
      onSuccess();
    } catch {
      showErrorMessage(t('auth.invalidOTP', 'Invalid code, try again.'), undefined, t('auth.error', 'Error'));
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResend = async () => {
    if (!phone) {
      showWarningMessage(t('otp.errors.noPhone', 'No phone number provided'), undefined, t('auth.warning', 'Warning'));
      return;
    }
    setIsResending(true);
    try {
      await sendOTPMutation.mutateAsync({ phone: String(phone).trim(), is_signup: origin === 'signup' } as any);
      setTimeLeft(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      messageBox.show({
        type: 'info',
        title: t('auth.success', 'Success'),
        message: t('otp.resent', 'A new code was sent.')
      });
    } catch (e) {
      messageBox.show({
        type: 'error',
        title: t('auth.error', 'Error'),
        message: t('otp.resendFailed', 'Failed to resend code, try again.')
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Box paddingHorizontal={16} paddingVertical={20} style={{ backgroundColor: 'transparent' }}>
      <Pressable
        onPress={onBack}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          flexDirection: 'row',
          alignItems: 'center',
          zIndex: 10,
          elevation: 1,
        }}
        accessibilityRole="button"
        accessibilityLabel={t('common.back', 'Back')}
      >
        <Text color="$primary500" fontWeight="$medium">{t('common.back', 'Back')}</Text>
      </Pressable>

      <VStack alignItems="center" marginBottom={24} space={16}>
        <Box
          width={80}
          height={80}
          borderRadius={9999}
          backgroundColor="$primary100"
          justifyContent="center"
          alignItems="center"
        >
          <Ionicons name="shield-checkmark" size={40} color="#3b82f6" />
        </Box>
        <VStack alignItems="center" space="$sm">
          <Text fontSize="$lg" fontWeight="$bold" color="$textLight900" textAlign="center">
            {t('otp.title', 'Enter Authentication Code')}
          </Text>
          <Text fontSize="$sm" fontWeight="$normal" color="$textLight600" textAlign="center">
            {t('otp.sentTo', 'Sent to:')}
          </Text>
          {!!phone && (
            <Text fontSize="$sm" color="$primary500" fontWeight="$semibold">
              +98 {phone}
            </Text>
          )}
        </VStack>
      </VStack>

      <HStack justifyContent="space-between" marginBottom={20} space={12}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => { if (ref) inputRefs.current[index] = ref; }}
            style={{
              width: 44,
              height: 48,
              borderWidth: 1.5,
              borderColor: digit ? '#3b82f6' : '#d1d5db',
              borderRadius: 8,
              textAlign: 'center',
              writingDirection: 'ltr',
              fontSize: 18,
              fontWeight: '600',
              color: isDark ? '#f9fafb' : '#111827',
              backgroundColor: isDark ? '#374151' : '#ffffff',
            }}
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={1}
            selectTextOnFocus
            caretHidden={false}
            importantForAutofill="yes"
            textContentType="oneTimeCode"
            accessible
            accessibilityLabel={`${t('otp.digit', 'OTP digit')} ${index + 1}`}
          />
        ))}
      </HStack>

      <Button
        onPress={() => handleVerify()}
        disabled={otp.join('').length !== 6 || isLoading}
        backgroundColor="$primary500"
        borderRadius="$md"
        paddingVertical={10}
        paddingHorizontal={20}
        opacity={otp.join('').length !== 6 || isLoading ? 0.6 : 1}
        aria-label={t('auth.verifyOTP', 'Verify')}
        pressStyle={{ backgroundColor: '$primary600' }}
        minHeight={44}
      >
        <HStack alignItems="center" space="$sm">
          {isLoading && <Spinner color="$white" size="small" />}
          <Text color="$white" fontWeight="$semibold" fontSize="$sm">
            {isLoading ? t('common.loading', 'Loading...') : t('auth.verifyOTP', 'Verify')}
          </Text>
        </HStack>
      </Button>

      <VStack alignItems="center" marginTop={20} space={8}>
        {canResend ? (
          <Pressable onPress={handleResend} disabled={isResending}>
            <Text color="$primary500" fontWeight="$medium" fontSize="$sm">
              {isResending ? t('common.loading', 'Loading...') : t('otp.resend', 'Resend Code')}
            </Text>
          </Pressable>
        ) : (
          <VStack alignItems="center" space={4}>
            <Text color="$textLight600" fontSize="$sm">
              {t('auth.otpNotReceived', "Didn't receive the code?")}
            </Text>
            <Text color="$primary500" fontWeight="$semibold" fontSize="$md">
              {formatTime(timeLeft)}
            </Text>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};
