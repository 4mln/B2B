import { useColorScheme } from '@/hooks/use-color-scheme';
import { validateIranianMobileNumber, validateIranianNationalId } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, I18nManager, KeyboardAvoidingView, Platform, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Stack as Box, H1 as Heading, XStack as HStack, Input, Spinner, Text, YStack as VStack } from 'tamagui';
import * as yup from 'yup';

import { useMessageBoxStore } from '@/context/messageBoxStore';
import i18n from '@/i18n';
import { authService } from '@/services/auth';
import { colors } from '@/theme/colors';
import { ensureOnlineOrMessage } from '@/utils/connection';

type Guild = {
  id: string;
  name: string;
};

type SignupScreenProps = {
  initialPhone?: string;
  onNavigateToLogin?: () => void;
  onOtpRequested?: (phone: string) => void;
  embedded?: boolean;
};

type SignupFormValues = {
  firstName: string;
  lastName: string;
  nationalId: string;
  phone: string;
  guildId: string;
};

export default function SignupScreen(props: SignupScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;
  
  const containerBg = props.embedded ? 'transparent' : (isDark ? colors.background.dark : colors.background.light);
  const [selectedGuild, setSelectedGuild] = useState('');

  // Button styles matching login page - modern professional sizing
  const getButtonStyle = () => ({
    backgroundColor: isLoading || isLoadingGuilds ? colors.gray[300] : colors.primary[500],
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
    marginTop: 20,
    opacity: isLoading || isLoadingGuilds ? 0.6 : 1,
    minHeight: 36,
    maxWidth: 200,
    alignSelf: 'center' as const,
  });

  const getButtonTextStyle = () => ({
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.background.light,
  });
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGuilds, setIsLoadingGuilds] = useState(true);
  const [isGuildModalOpen, setIsGuildModalOpen] = useState(false);
  const [guildOpen, setGuildOpen] = useState(false);
  const [guildItems, setGuildItems] = useState<{ label: string; value: string }[]>([]);
  
  // RHF + Yup schema
  const nameRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FFa-zA-Z\s\-]+$/;
  const schema = yup.object({
    firstName: yup
      .string()
      .required(t('signup.errors.firstNameTooShort'))
      .min(2, t('signup.errors.firstNameTooShort'))
      .matches(nameRegex, t('signup.errors.firstNameInvalid'))
      .test('no-multi-spaces', t('signup.errors.noMultipleSpaces'), (v) => !(/\s{2,}/.test(v || '')))
      .test('no-multi-hyphens', t('signup.errors.noMultipleHyphens'), (v) => !(/--+/.test(v || ''))),
    lastName: yup
      .string()
      .required(t('signup.errors.firstNameTooShort'))
      .min(2, t('signup.errors.firstNameTooShort'))
      .matches(nameRegex, t('signup.errors.firstNameInvalid'))
      .test('no-multi-spaces', t('signup.errors.noMultipleSpaces'), (v) => !(/\s{2,}/.test(v || '')))
      .test('no-multi-hyphens', t('signup.errors.noMultipleHyphens'), (v) => !(/--+/.test(v || ''))),
    nationalId: yup
      .string()
      .required(t('signup.errors.invalidNationalId'))
      .length(10, t('signup.errors.invalidNationalId'))
      .test('is-valid-nid', t('signup.errors.invalidNationalId'), (v) => validateIranianNationalId(String(v || ''))),
    phone: yup
      .string()
      .required(t('signup.errors.invalidPhone'))
      .test('iran-phone', t('signup.errors.invalidPhone'), (value) => !!validateIranianMobileNumber(value || '').isValid),
    guildId: yup
      .string()
      .required(t('signup.errors.guildRequired')),
  });

  const { control, handleSubmit, formState: { errors }, getValues, setValue } = useForm<SignupFormValues>({
    mode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      nationalId: '',
      phone: props.initialPhone || '',
      guildId: '',
    },
  });

  // Fetch guilds from API
  useEffect(() => {
    const fetchGuilds = async () => {
      try {
        // In development, we'll use mock data
        // const response = await apiClient.get('/guilds');
        // setGuilds(response.data);

        // Mock data for development
        setTimeout(() => {
          const mockGuilds = [
            { id: '1', name: 'الکتریک' },
            { id: '2', name: 'ابزار' },
          ];
          setGuilds(mockGuilds);
          setGuildItems(mockGuilds.map(g => ({ label: g.name, value: g.id })));
          setIsLoadingGuilds(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching guilds:', error);
        setIsLoadingGuilds(false);
        Alert.alert('خطا', 'دریافت لیست صنف‌ها با مشکل مواجه شد.');
      }
    };

    fetchGuilds();
  }, []);


  const validateName = (value: string): string | undefined => {
    const val = String(value || '').trim();
    if (val.length < 2) return t('signup.errors.firstNameTooShort');
    // Allow Persian letters, Arabic letters, English letters, spaces, and hyphen
    const nameRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FFa-zA-Z\s\-]+$/;
    if (!nameRegex.test(val)) return t('signup.errors.firstNameInvalid');
    // Disallow multiple consecutive spaces or hyphens
    if (/\s{2,}/.test(val)) return t('signup.errors.noMultipleSpaces');
    if (/--+/.test(val)) return t('signup.errors.noMultipleHyphens');
    return undefined;
  };

  const handleSignup = async () => {
    const { firstName, lastName, nationalId, phone, guildId } = getValues();
    
    setIsLoading(true);
    
    try {
      const online = await ensureOnlineOrMessage();
      if (!online) return;
      // Pre-check phone and national ID existence
      const existsResp = await authService.phoneOrNationalIdExists(phone.trim(), nationalId.trim());
      if (existsResp.success && existsResp.data?.exists) {
        useMessageBoxStore.getState().show({
          type: 'warning',
          title: i18n.t('auth.warning', 'Warning'),
          message: i18n.t('auth.idOrPhoneExists', 'This ID or phone number exists.'),
          actions: [{ label: i18n.t('common.back') }],
        });
        return;
      }

      // Call backend signup
      const resp = await authService.signup({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        nationalId: nationalId.trim(),
        phone: phone.trim(),
        guildId: guildId || selectedGuild,
      });

      if (resp.success) {
        // Ensure OTP is requested after successful signup
        try {
          await authService.sendOTP({ phone: phone.trim(), is_signup: true });
        } catch {}
        if (props?.onOtpRequested) {
          props.onOtpRequested(phone.trim());
        } else {
          router.push({ pathname: '/auth/verify-otp', params: { phone: phone.trim(), from: 'signup' } });
        }
      } else {
        Alert.alert(t('signup.alerts.signupFailedTitle'), resp.error || t('signup.alerts.signupFailed'));
      }
    } catch (error) {
      Alert.alert(t('signup.alerts.signupFailedTitle'), t('signup.alerts.signupFailedRetry'));
    } finally {
      setIsLoading(false);
    }
  };

  // If opened from LoginWall with pre-filled phone, keep it
  // (LoginWall passes pendingPhone via state; we can accept it through props/hooks later if needed)

  return (
    <Box flex={1} backgroundColor={containerBg}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <VStack
            paddingHorizontal={24}
            paddingTop={5}
            paddingBottom={20}
            maxWidth={400}
            alignSelf="center"
            width="100%"
            space="$lg"
          >
            {/* Header Section */}
            <VStack alignItems="center" space={16}>
              <Animated.View entering={FadeInDown.duration(400)}>
                <Box 
                  width={72} 
                  height={72} 
                  borderRadius="$full" 
                  backgroundColor="$primary100" 
                  alignItems="center" 
                  justifyContent="center"
                >
                  <Ionicons name="person-add" color="#3b82f6" size={28} />
                </Box>
              </Animated.View>
              <VStack alignItems="center" space={8}>
                <Heading size="xl" textAlign="center" paddingTop={-5} color={isDark ? '$textDark100' : '$textLight900'}>
                  {t('signup.title')}
                </Heading>
                <Text 
                  textAlign="center" 
                  color={isDark ? '$textDark300' : '$textLight600'} 
                  fontSize="$md"
                  lineHeight="$lg"
                  maxWidth={320}
                >
                  {t('signup.subtitle')}
                </Text>
              </VStack>
            </VStack>

            {/* Form Section */}
            <VStack space="$lg" backgroundColor="transparent"  borderRadius="$lg" padding={20}>
              {/* Name Fields Row */}
              <HStack space={16} paddingTop={-20}>
                <VStack flex={1} space={8}>
                  <Controller
                    control={control}
                    name="firstName"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        placeholder={t('signup.firstName')}
                        value={value}
                        onChangeText={onChange}
                        disabled={isLoading}
                        textAlign="right"
                        height={35}
                        borderColor={errors.firstName ? '$error500' : (isDark ? '#2a2e39' : '#e2e8f0')}
                        backgroundColor={isDark ? '#1f2937' : '#ffffff'}
                        borderRadius="$xl"
                        fontSize="$xs"
                        color={isDark ? '#d1d4dc' : '#1e293b'}
                        focusStyle={{
                          borderColor: '$primary500',
                          backgroundColor: isDark ? '$backgroundDark0' : '$backgroundLight0',
                        }}
                      />
                    )}
                  />
                  {!!errors.firstName?.message && (
                    <Text color="$error500" fontSize={13} marginTop={4} textAlign="right">
                      {String(errors.firstName.message)}
                    </Text>
                  )}
                </VStack>
                <VStack flex={1} space={8}>
                  <Controller
                    control={control}
                    name="lastName"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        placeholder={t('signup.lastName')}
                        value={value}
                        onChangeText={onChange}
                        disabled={isLoading}
                        textAlign="right"
                        height={35}
                        borderColor={errors.lastName ? '$error500' : (isDark ? '#2a2e39' : '#e2e8f0')}
                        backgroundColor={isDark ? '#1f2937' : '#ffffff'}
                        borderRadius="$xl"
                        fontSize="$sm"
                        color={isDark ? '#d1d4dc' : '#1e293b'}
                        focusStyle={{
                          borderColor: '$primary500',
                          backgroundColor: isDark ? '$backgroundDark0' : '$backgroundLight0',
                        }}
                      />
                    )}
                  />
                  {!!errors.lastName?.message && (
                    <Text color="$error500" fontSize={13} marginTop={4} textAlign="right">
                      {String(errors.lastName.message)}
                    </Text>
                  )}
                </VStack>
              </HStack>

              {/* National ID Field */}
              <VStack space={8}>
                <Controller
                  control={control}
                  name="nationalId"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      placeholder={t('signup.nationalIdPlaceholder')}
                      keyboardType="number-pad"
                      value={value}
                      onChangeText={onChange}
                      disabled={isLoading}
                      maxLength={10}
                      textAlign="right"
                      height={35}
                      borderColor={errors.nationalId ? '$error500' : (isDark ? '#2a2e39' : '#e2e8f0')}
                      backgroundColor={isDark ? '#1f2937' : '#ffffff'}
                      borderRadius="$xl"
                      fontSize="$sm"
                      color={isDark ? '#d1d4dc' : '#1e293b'}
                      focusStyle={{
                        borderColor: '$primary500',
                        backgroundColor: isDark ? '$backgroundDark0' : '$backgroundLight0',
                      }}
                    />
                  )}
                />
                {!!errors.nationalId?.message && (
                  <Text color="$error500" fontSize={13} marginTop={4} textAlign="right">
                    {String(errors.nationalId.message)}
                  </Text>
                )}
              </VStack>

              {/* Phone Field */}
              <VStack space={8}>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      placeholder={t('signup.phonePlaceholder')}
                      keyboardType="phone-pad"
                      value={value}
                      onChangeText={onChange}
                      disabled={isLoading}
                      textAlign="right"
                      height={35}
                      borderColor={errors.phone ? '$error500' : (isDark ? '#2a2e39' : '#e2e8f0')}
                      backgroundColor={isDark ? '#1f2937' : '#ffffff'}
                      borderRadius="$xl"
                      fontSize="$sm"
                      color={isDark ? '#d1d4dc' : '#1e293b'}
                      focusStyle={{
                        borderColor: '$primary500',
                        backgroundColor: isDark ? '$backgroundDark0' : '$backgroundLight0',
                      }}
                    />
                  )}
                />
                {!!errors.phone?.message && (
                  <Text color="$error500" fontSize={13} marginTop={4} textAlign="right">
                    {String(errors.phone.message)}
                  </Text>
                )}
              </VStack>

              {/* Guild Selection Field */}
              <VStack space={8}>
                {isLoadingGuilds ? (
                  <HStack 
                    height={40}
                    paddingHorizontal={16} 
                    borderWidth={1} 
                    borderColor="$borderLight300" 
                    borderRadius="$xl" 
                    alignItems="center" 
                    justifyContent="center" 
                    backgroundColor={isDark ? '$backgroundDark0' : '$backgroundLight0'}
                  >
                    <Spinner size="small" color="$primary500" />
                    <Text marginLeft={12} color="$textLight600" fontSize="$md">
                      {t('signup.loadingGuilds')}
                    </Text>
                  </HStack>
                ) : (
                  <DropDownPicker
                    open={guildOpen}
                    value={selectedGuild}
                    items={guildItems}
                    setOpen={setGuildOpen}
                    setValue={(callback) => {
                      const value = callback(selectedGuild);
                      setSelectedGuild(value);
                      setValue('guildId', value, { shouldValidate: true });
                    }}
                    setItems={setGuildItems}
                    placeholder={t('signup.selectGuild')}
                    searchable={true}
                    searchPlaceholder={t('signup.searchGuilds')}
                    style={{
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      borderColor: errors.guildId ? '#ef4444' : (isDark ? '#2a2e39' : '#e2e8f0'),
                      borderRadius: 16,
                      minHeight: 35,
                      height: 35,
                    }}
                    dropDownContainerStyle={{
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      borderColor: isDark ? '#374151' : '#e5e7eb',
                      borderRadius: 8,
                      marginTop: 4,
                    }}
                    textStyle={{
                      color: isDark ? '#d1d4dc' : '#1e293b',
                      fontSize: 14,
                      textAlign: 'right',
                      fontFamily: 'Vazirmatn-Regular',
                    }}
                    searchTextInputStyle={{
                      color: isDark ? '#d1d4dc' : '#1e293b',
                      textAlign: 'right',
                      borderColor: isDark ? '#374151' : '#e5e7eb',
                    }}
                    searchContainerStyle={{
                      borderBottomColor: isDark ? '#374151' : '#e5e7eb',
                      paddingBottom: 8,
                    }}
                    listItemLabelStyle={{
                      color: isDark ? '#d1d4dc' : '#1e293b',
                      textAlign: 'right',
                    }}
                    disabled={isLoading}
                    zIndex={20000}
                    zIndexInverse={1000}
                  />
                )}
                {!!errors.guildId?.message && (
                  <Text color="$error500" fontSize={13} marginTop={4} textAlign="right">
                    {String(errors.guildId.message)}
                  </Text>
                )}
              </VStack>

            </VStack>

            {/* Submit Button */}
            <TouchableOpacity
              style={[getButtonStyle(), { marginTop: -20 }]}
              onPress={handleSubmit(handleSignup)}
              disabled={isLoading || isLoadingGuilds}
            >
              <HStack alignItems="center" space={8}>
                {isLoading ? (
                  <Spinner color={colors.background.light} size="small" />
                ) : (
                  <Ionicons name="checkmark-circle" color="#ffffff" size={18} />
                )}
                <Text style={getButtonTextStyle()}>
                  {isLoading ? t('common.loading') : t('signup.submit')}
                </Text>
              </HStack>
            </TouchableOpacity>

            {/* Footer */}
            <HStack 
              marginTop={-10} 
              justifyContent="center" 
              alignItems="center" 
              space={8}
              paddingHorizontal={16}
            >
              <Text color="$textLight600" fontSize="$md">
                {t('signup.haveAccount')}
              </Text>
              {props?.onNavigateToLogin ? (
                <Pressable onPress={props.onNavigateToLogin}>
                  {({ isPressed }) => (
                    <Text 
                      color="$primary500" 
                      fontSize="$md" 
                      fontWeight="$semibold" 
                      opacity={isPressed ? 0.8 : 1}
                      textDecorationLine="underline"
                    >
                      {t('signup.login')}
                    </Text>
                  )}
                </Pressable>
              ) : (
                <Link href="/auth/login" asChild>
                  <Pressable>
                    {({ isPressed }) => (
                      <Text 
                        color="$primary500" 
                        fontSize="$md" 
                        fontWeight="$semibold" 
                        opacity={isPressed ? 0.8 : 1}
                        textDecorationLine="underline"
                      >
                        {t('signup.login')}
                      </Text>
                    )}
                  </Pressable>
                </Link>
              )}
            </HStack>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </Box>
  );
}
