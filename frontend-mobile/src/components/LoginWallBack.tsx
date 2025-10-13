import { useMessageBoxStore } from '@/context/messageBoxStore';
import { useAuth, useVerifyOTP, useSendOTP } from '@/features/auth/hooks';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { XStack as HStack, YStack as VStack, Stack as Box, Text, Spinner, Button } from 'tamagui';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, ScrollView, StatusBar, TextInput, Pressable } from 'react-native';
import LoginScreen from '../../app/auth/login';
import SignupScreen from '../../app/auth/signup';

export const LoginWall: React.FC = () => {
  const { approved, isLoading, isAuthenticated } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const messageBox = useMessageBoxStore();
  const [mode, setMode] = React.useState<'login' | 'signup' | 'otp'>('login');
  const [prevMode, setPrevMode] = React.useState<'login' | 'signup'>('login');
  const [pendingPhone, setPendingPhone] = React.useState<string | undefined>(undefined);
  const fade = React.useRef(new Animated.Value(1)).current;
  const [loadingTimeoutExceeded, setLoadingTimeoutExceeded] = React.useState(false);

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

  if (isLoading && !loadingTimeoutExceeded) {
    if (__DEV__) console.log('LoginWall - Still loading auth state, showing loading screen');
    return (
      <Box position="absolute" top={0} right={0} bottom={0} left={0} pointerEvents="auto">
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
        <Box 
          flex={1} 
          justifyContent="center" 
          alignItems="center"
          pointerEvents="box-none"
        >
                    <Box
            borderRadius={16}
            padding={32}
            alignItems="center"
            space={16}
            pointerEvents="auto"
            style={{ backgroundColor: isDark ? '#0b0b0b' : '#ffffff' }}
          >
            <VStack space="md" alignItems="center">
              <Spinner size="$3" color="$primary500" />
              <Text fontSize="$lg" color={isDark ? '$textDark100' : '$textLight600'}>
                Loading...
              </Text>
              <Text fontSize="$sm" color={isDark ? '$textDark300' : '$textLight400'}>
                Initializing authentication...
              </Text>
            </VStack>
          </Box>
        </Box>
      </Box>
    );
  }

  const switchMode = (next: 'login' | 'signup' | 'otp') => {
    fade.stopAnimation();
    Animated.timing(fade, { toValue: 0, duration: 150, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => {
      setMode(next);
      Animated.timing(fade, { toValue: 1, duration: 150, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    });
  };

  // Only dismiss when explicitly approved after OTP and user is authenticated
  if (approved && isAuthenticated) {
    if (__DEV__) console.log('LoginWall - User approved and authenticated, hiding LoginWall');
    return null;
  }

  if (__DEV__) console.log('LoginWall - User not approved/authenticated, showing LoginWall modal', { approved, isAuthenticated });

  return (
    <Box position="absolute" top={0} right={0} bottom={0} left={0} pointerEvents="auto">
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
      <Box 
        flex={1} 
        justifyContent="center" 
        alignItems="center"
        paddingHorizontal={16}
        pointerEvents="box-none"
      >
                <Box
          borderRadius={16}
          overflow="hidden"
          maxHeight="90%"
          width="100%"
          maxWidth={560}
          pointerEvents="auto"
          style={{ backgroundColor: isDark ? '#0b0b0b' : '#ffffff' }}
        >
          <ScrollView 
            style={{ maxHeight: '100%' }} 
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }} 
            keyboardShouldPersistTaps="handled" 
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={{ opacity: fade }}>
              {mode === 'login' && (
                <LoginScreen
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
              )}
              {mode === 'signup' && (
                <SignupScreen
                  embedded
                  initialPhone={pendingPhone}
                  onNavigateToLogin={() => switchMode('login')}
                  onOtpRequested={async (phone) => {
                    setPrevMode('signup'); setPendingPhone(phone); switchMode('otp');
                  }}
                />
              )}
              {mode === 'otp' && (
                <InlineOtp
                  phone={pendingPhone}
                  origin={prevMode}
                  onBack={() => switchMode(prevMode)}
                  onSuccess={() => {
                    if (prevMode === 'signup') {
                      // Show congrats message, then go to login
                      messageBox.show({
                        message: t('auth.signupCongratsLogin', 'Congrats! you signed up successfully, login now.'),
                        actions: [
                          {
                            label: t('auth.login', 'Login'),
                            onPress: () => switchMode('login'),
                          },
                        ],
                      });
                    } else {
                      // After login verification, proceed into the app
                      try { router.replace('/(tabs)'); } catch {}
                    }
                  }}
                />
              )}
            </Animated.View>
          </ScrollView>
        </Box>
      </Box>
    </Box>
  );
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
      messageBox.show({ message: t('auth.invalidOTP', 'Invalid code, try again.') });
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
      messageBox.show({ message: t('otp.errors.noPhone', 'No phone number provided') });
      return;
    }
    setIsResending(true);
    try {
      await sendOTPMutation.mutateAsync({ phone: String(phone).trim(), is_signup: origin === 'signup' } as any);
      setTimeLeft(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      messageBox.show({ message: t('otp.resent', 'A new code was sent.') });
    } catch (e) {
      messageBox.show({ message: t('otp.resendFailed', 'Failed to resend code, try again.') });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Box paddingHorizontal={16} paddingVertical={20}>
      <Pressable
        onPress={onBack}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        position="absolute"
        top={16}
        left={16}
        flexDirection="row"
        alignItems="center"
        zIndex={10}
        elevation={1}
        accessibilityRole="button"
        accessibilityLabel={t('common.back','Back')}
      >
        <Text color="$primary500" fontWeight="$medium">{t('common.back','Back')}</Text>
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
        <VStack alignItems="center" space={8}>
          <Text 
            fontSize="$xl" 
            fontWeight="$bold" 
            color="$textLight900" 
            textAlign="center"
          >
            {t('otp.title','Enter Authentication Code')}
          </Text>
          <Text 
            fontSize="$sm" 
            color="$textLight600" 
            textAlign="center"
          >
            {t('otp.sentTo','Sent to:')}
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
              width: 50,
              height: 60,
              borderWidth: 2,
              borderColor: digit ? '#3b82f6' : '#e5e7eb',
              borderRadius: 16,
              textAlign: 'center',
              writingDirection: 'ltr',
              fontSize: 24,
              fontWeight: '700',
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
          />
        ))}
      </HStack>
      
      <Button
        onPress={() => handleVerify()}
        disabled={otp.join('').length !== 6 || isLoading}
        backgroundColor="$primary500"
        borderRadius="$xl"
        paddingVertical={16}
        opacity={otp.join('').length !== 6 || isLoading ? 0.6 : 1}
        aria-label={t('auth.verifyOTP','Verify')}
        pressStyle={{ backgroundColor: '$primary600' }}
      >
        <HStack alignItems="center" space={8}>
          {isLoading && <Spinner color="$white" size="$2" />}
          <Text color="$white" fontWeight="$bold" fontSize="$md">
            {isLoading ? t('common.loading','Loading...') : t('auth.verifyOTP','Verify')}
          </Text>
        </HStack>
      </Button>
      
      <VStack alignItems="center" marginTop={20} space={8}>
        {canResend ? (
          <Pressable onPress={handleResend} disabled={isResending}>
            <Text color="$primary500" fontWeight="$medium" fontSize="$sm">
              {isResending ? t('common.loading','Loading...') : t('otp.resend','Resend Code')}
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
