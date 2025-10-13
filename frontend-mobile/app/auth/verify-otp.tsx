import { useVerifyOTP } from '@/features/auth/hooks';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { colors } from '@/theme/colors';
import { semanticSpacing } from '@/theme/spacing';
import { fontWeights, lineHeights, typography } from '@/theme/typography';

export default function VerifyOTPScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams<{ phone?: string | string[]; from?: string | string[] }>();
  const phoneParam = Array.isArray(params.phone) ? params.phone[0] : params.phone;
  const phone = phoneParam ? String(phoneParam) : '';
  const fromParam = Array.isArray(params.from) ? params.from[0] : params.from;
  const from = fromParam ? String(fromParam) : undefined;
  const navigation = useNavigation<any>();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<TextInput[]>([]);
  const verifyOTPMutation = useVerifyOTP();

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpCode?: string) => {
    const otpString = otpCode || otp.join('');
    
    if (otpString.length !== 6) {
      Alert.alert('Error', t('otp.errors.incomplete'));
      return;
    }

    if (!phone) {
      Alert.alert('Error', t('otp.errors.noPhone'));
      return;
    }

    setIsLoading(true);
    try {
      await verifyOTPMutation.mutateAsync({ phone, otp: otpString });
      // Navigation will be handled by the auth hook
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', t('auth.invalidOTP'));
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = () => {
    setTimeLeft(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    // Implement resend OTP logic
    console.log('Resending OTP...');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
      writingDirection: 'ltr',
    },
    content: {
      flex: 1,
      paddingHorizontal: semanticSpacing.lg,
      justifyContent: 'center',
      maxWidth: 400,
      alignSelf: 'center',
      width: '100%',
      writingDirection: 'ltr',
    },
    header: {
      alignItems: 'center',
      marginBottom: semanticSpacing['3xl'],
    },
    backRow: {
      position: 'absolute',
      top: semanticSpacing.lg,
      left: semanticSpacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
    },
    backText: {
      marginLeft: semanticSpacing.xs,
      color: colors.primary[600],
      fontSize: typography.body.fontSize,
      fontWeight: fontWeights.medium,
    },
    icon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary[100],
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: semanticSpacing.lg,
    },
    title: {
      fontSize: 24, // Fixed from typography.h2.fontSize
      fontWeight: 'bold', // Fixed from typography.h2.fontWeight
      color: isDark ? colors.text.primary : colors.text.primary,
      textAlign: 'center',
      marginBottom: semanticSpacing.sm,
    },
    subtitle: {
      fontSize: 18, // Fixed from typography.bodyLarge.fontSize
      color: isDark ? colors.text.secondary : colors.text.secondary,
      textAlign: 'center',
      lineHeight: 18 * lineHeights.normal, // Fixed from typography.bodyLarge.fontSize
    },
    phoneNumber: {
      fontSize: 16, // Fixed from typography.body.fontSize
      fontWeight: fontWeights.medium,
      color: colors.primary[600],
      marginTop: semanticSpacing.sm,
    },
    otpContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: semanticSpacing.xl,
      writingDirection: 'ltr',
    },
    otpInput: {
      width: 45,
      height: 55,
      borderWidth: 1,
      borderColor: isDark ? colors.border.light : colors.border.light,
      borderRadius: semanticSpacing.radius.lg,
      textAlign: 'center',
      writingDirection: 'ltr',
      fontSize: 20, // Fixed from typography.h3.fontSize
      fontWeight: fontWeights.bold,
      color: isDark ? colors.text.primary : colors.text.primary,
      backgroundColor: isDark ? colors.gray[800] : colors.background.light,
    },
    otpInputFocused: {
      borderColor: colors.primary[500],
      borderWidth: 2,
    },
    button: {
      backgroundColor: colors.primary[500],
      borderRadius: semanticSpacing.radius.lg,
      paddingVertical: semanticSpacing.md,
      alignItems: 'center',
      marginBottom: semanticSpacing.lg,
    },
    buttonDisabled: {
      backgroundColor: colors.gray[300],
    },
    buttonText: {
      fontSize: typography.button.fontSize,
      fontWeight: typography.button.fontWeight,
      color: colors.background.light,
    },
    resendContainer: {
      alignItems: 'center',
    },
    resendText: {
      fontSize: typography.body.fontSize,
      color: isDark ? colors.text.secondary : colors.text.secondary,
      marginBottom: semanticSpacing.sm,
    },
    resendButton: {
      paddingVertical: semanticSpacing.sm,
    },
    resendButtonText: {
      fontSize: typography.body.fontSize,
      fontWeight: fontWeights.medium,
      color: colors.primary[600],
    },
    timerText: {
      fontSize: typography.body.fontSize,
      color: colors.primary[600],
      fontWeight: fontWeights.medium,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backRow}
            onPress={() => {
              try {
                router.back();
                // Fallback in case there's no history
                setTimeout(() => {
                  try {
                    router.replace('/');
                  } catch {}
                }, 50);
              } catch {
                router.replace('/');
              }
            }}
          >
            <Ionicons name="chevron-back" size={20} color={colors.primary[600]} />
            <Text style={styles.backText}>{t('common.back')}</Text>
          </TouchableOpacity>
          <View style={styles.icon}>
            <Ionicons name="shield-checkmark" size={40} color={colors.primary[600]} />
          </View>
          <Text style={styles.title}>{t('auth.enterOTP')}</Text>
          <Text style={styles.subtitle}>{t('otp.title')}</Text>
          {!!phone && (<Text style={styles.phoneNumber}>+98 {phone}</Text>)}
        </View>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              style={[
                styles.otpInput,
                digit && styles.otpInputFocused,
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.button,
            (otp.join('').length !== 6 || isLoading) && styles.buttonDisabled,
          ]}
          onPress={() => handleVerifyOTP()}
          disabled={otp.join('').length !== 6 || isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? t('common.loading') : t('auth.verifyOTP')}
          </Text>
        </TouchableOpacity>

        {/* Resend OTP */}
        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity style={styles.resendButton} onPress={handleResendOTP}>
              <Text style={styles.resendButtonText}>{t('auth.resendOTP')}</Text>
            </TouchableOpacity>
          ) : (
            <>
              <Text style={styles.resendText}>{t('otp.didntReceive')}</Text>
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
