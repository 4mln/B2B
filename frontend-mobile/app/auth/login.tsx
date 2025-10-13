import { useSendOTP } from '@/features/auth/hooks';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { validateIranianMobileNumber } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity
} from 'react-native';
import { Stack as Box, H1 as Heading, XStack as HStack, Input, Spinner, Text, YStack as VStack } from 'tamagui';
import * as yup from 'yup';

import { showInfoMessage, useMessageBoxStore } from '@/context/messageBoxStore';
import i18n from '@/i18n';
import { colors } from '@/theme/colors';
import { ensureOnlineOrMessage } from '@/utils/connection';

type LoginScreenProps = {
  initialPhone?: string;
  onNavigateToSignup?: (phone?: string) => void;
  onOtpRequested?: (phone: string) => void;
};

type LoginFormValues = { phone: string };

export default function LoginScreen(props: LoginScreenProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // If OTP bypass is enabled, we will skip OTP screen and navigate directly
  const isBypassEnabled = process.env.EXPO_PUBLIC_BYPASS_OTP === 'true' || process.env.EXPO_PUBLIC_BYPASS_OTP === '1';
  
  const [isLoading, setIsLoading] = useState(false);

  const schema = yup.object({
    phone: yup
      .string()
      .required(t('signup.errors.invalidPhone'))
      .test('iran-phone', t('signup.errors.invalidPhone'), (value) => !!validateIranianMobileNumber(value || '').isValid),
  });

  const { control, handleSubmit, formState: { errors }, getValues, trigger, watch } = useForm<LoginFormValues>({
    mode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: { phone: props.initialPhone || '' },
  });
  const watchedPhone = watch('phone');
  
  const sendOTPMutation = useSendOTP();

  const handleSendOTP = async () => {
    // Validate phone number using the Iranian mobile number validator
    const { phone } = getValues();
    const validation = validateIranianMobileNumber(phone);
    
    if (!validation.isValid) {
      // RHF handles error display via schema; ensure validation triggers
      await trigger('phone');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First: ensure connection
      const online = await ensureOnlineOrMessage();
      if (!online) return;

      // Call backend to send OTP (signin mode) - backend will check user existence
      const resp = await sendOTPMutation.mutateAsync({ phone: phone.trim(), is_signup: false } as any);
      if (resp?.success) {
        if (props?.onOtpRequested) {
          props.onOtpRequested(phone.trim());
        } else {
          router.push({ pathname: '/auth/verify-otp', params: { phone: phone.trim(), from: 'login' } });
        }
      } else {
        // Check if it's a "user not found" error
        if ((resp?.error || '').toLowerCase().includes('not found')) {
          showInfoMessage(
            i18n.t('auth.userNotFoundProceedSignup', 'User not found, proceed to signup.'),
            [
              {
                label: i18n.t('auth.signup', 'Signup'),
                onPress: () => {
                  if (props?.onNavigateToSignup) {
                    props.onNavigateToSignup(phone.trim());
                  } else {
                    router.replace({ pathname: '/auth/signup', params: { phone: phone.trim() } });
                  }
                },
              },
              {
                label: i18n.t('common.cancel', 'Cancel'),
                onPress: () => {},
              },
            ]
          );
        } else {
          const networkMsg = i18n.t('errors.networkErrorDetailed');
          const msg = resp?.error || networkMsg;
          useMessageBoxStore.getState().show({
            type: 'error',
            title: i18n.t('auth.error', 'Error'),
            message: msg,
            actions: [{ label: i18n.t('common.back') }]
          });
        }
      }
    } catch (error) {
      Alert.alert(t('login.alerts.sendFailedTitle'), t('login.alerts.sendFailed'));
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Box flex={1} backgroundColor="transparent">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <VStack
          flex={1}
          paddingHorizontal="$lg"
          justifyContent="center"
          maxWidth={380}
          alignSelf="center"
          width="100%"
          space="$lg"
        >
          {/* Header */}
          <VStack alignItems="center" space="$lg">
            <Box
              width={80}
              height={80}
              borderRadius="$full"
              backgroundColor="$primary500"
              alignItems="center"
              justifyContent="center"
            >
              <Ionicons name="person" size={40} color="white" />
            </Box>
            <VStack alignItems="center" space="$sm">
              <Heading size="lg" textAlign="center" color={isDark ? '$textDark100' : '$textLight900'}>
                {t('login.title')}
              </Heading>
              <Text
                textAlign="center"
                color={isDark ? '$textDark300' : '$textLight600'}
                fontSize="$md"
                fontWeight="$normal"
              >
                {t('login.subtitle')}
              </Text>
            </VStack>
          </VStack>

          {/* Form */}
          <VStack space="$lg">
            <VStack space="$sm">
              <Text
                fontSize="$sm"
                fontWeight="$medium"
                color={isDark ? '$textDark100' : '$textLight900'}
                textAlign="right"
              >
                {t('login.phone')}
              </Text>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder={t('login.phonePlaceholder')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="phone-pad"
                    autoFocus
                    height={44}
                    borderColor={errors.phone ? '$error500' : (isDark ? '$borderLight300' : '$borderLight300')}
                    backgroundColor={isDark ? '$backgroundDark0' : '$backgroundLight0'}
                    borderRadius="$lg"
                    fontSize="$sm"
                    color={isDark ? '$textDark100' : '$textLight900'}
                    textAlign="left"
                    placeholderTextColor={isDark ? '$textDark400' : '$textLight500'}
                  />
                )}
              />
              {!!errors.phone?.message && (
                <Text color="$error500" fontSize="$xs" textAlign="right">
                  {String(errors.phone.message)}
                </Text>
              )}
            </VStack>

            <TouchableOpacity
              style={{
                backgroundColor: (!watchedPhone?.trim() || isLoading) ? colors.gray[300] : colors.primary[500],
                borderRadius: 8,
                paddingVertical: 10,
                paddingHorizontal: 20,
                alignItems: 'center',
                marginTop: 12,
                opacity: (!watchedPhone?.trim() || isLoading) ? 0.6 : 1,
                minHeight: 44,
              }}
              onPress={handleSubmit(handleSendOTP)}
              disabled={isLoading}
            >
              <HStack alignItems="center" space="$sm">
                {isLoading ? (
                  <Spinner color={colors.background.light} size="small" />
                ) : (
                  <Ionicons name="phone-portrait-outline" color="#ffffff" size={18} />
                )}
                <Text
                  fontSize="$sm"
                  fontWeight="$semibold"
                  color={isDark ? '$textDark100' : '$textLight900'}
                >
                  {isLoading ? t('common.loading') : t('login.sendCode')}
                </Text>
              </HStack>
            </TouchableOpacity>
          </VStack>

          {/* Footer */}
          <VStack alignItems="center" space="$sm">
            <Text
              fontSize="$xs"
              color={isDark ? '$textDark300' : '$textLight600'}
              textAlign="center"
              fontWeight="$normal"
            >
              {t('login.terms')}{' '}
              <Text color="$primary500" fontWeight="$medium" textDecorationLine="underline">
                {t('login.termsLink')}
              </Text>{' '}
              {t('login.and')}{' '}
              <Text color="$primary500" fontWeight="$medium" textDecorationLine="underline">
                {t('login.privacyLink')}
              </Text>{' '}
              {t('login.agree')}
            </Text>
          </VStack>
        </VStack>
      </KeyboardAvoidingView>
    </Box>
  );
}
