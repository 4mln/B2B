import { useMessageBoxStore } from '@/context/messageBoxStore';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, Button, Text, XStack, YStack } from 'tamagui';

export const MessageBox: React.FC = () => {
  const { isVisible, type, title, message, actions, hide } = useMessageBoxStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();

  // Get translated title based on type - memoized to prevent infinite loops
  const translatedTitle = useMemo(() => {
    if (title && title !== 'messageBox.info' && title !== 'messageBox.warning' && title !== 'messageBox.error') {
      return title; // Custom title provided
    }

    switch (type) {
      case 'info':
        return t('messageBox.info');
      case 'warning':
        return t('messageBox.warning');
      case 'error':
        return t('messageBox.error');
      default:
        return t('messageBox.info');
    }
  }, [title, type, t]);

  // Get icon and styling based on message type - memoized to prevent infinite loops
  const messageConfig = useMemo(() => {
    switch (type) {
      case 'info':
        return {
          icon: 'information-circle',
          iconColor: '#3b82f6',
          bgColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
        };
      case 'warning':
        return {
          icon: 'warning',
          iconColor: '#f59e0b',
          bgColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
        };
      case 'error':
        return {
          icon: 'close-circle',
          iconColor: '#ef4444',
          bgColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
        };
      default:
        return {
          icon: 'information-circle',
          iconColor: '#3b82f6',
          bgColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
        };
    }
  }, [type, isDark]);


  // Render MessageBox with animations and solid background
  console.log('🔍 MessageBox: Rendering with z-index 99999');

  return (
    <AnimatePresence>
      {isVisible && (
        <YStack
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={999999}
          backgroundColor="rgba(0, 0, 0, 0.7)"
          justifyContent="center"
          alignItems="center"
          padding="$4"
          onPress={hide}
          pointerEvents="auto"
          animation="quick"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        >
          <YStack
            backgroundColor={isDark ? '#1a1a1a' : '#ffffff'}
            borderRadius="$6"
            padding="$4"
            minWidth={300}
            maxWidth={480}
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 8 }}
            shadowOpacity={0.3}
            shadowRadius={16}
            elevation={12}
            onPress={(e: any) => e.stopPropagation()}
            pointerEvents="auto"
            animation="bouncy"
            enterStyle={{ opacity: 0, scale: 0.8, y: 20 }}
            exitStyle={{ opacity: 0, scale: 0.8, y: 20 }}
          >
          <YStack space="$3" alignItems="center">
            <YStack
              width={48}
              height={48}
              borderRadius={24}
              backgroundColor={messageConfig.bgColor}
              alignItems="center"
              justifyContent="center"
            >
              <Ionicons name={messageConfig.icon as any} size={24} color={messageConfig.iconColor} />
            </YStack>
            
            <Text fontSize="$5" fontWeight="600" color={isDark ? '#ffffff' : '#000000'} textAlign="center">
              {translatedTitle}
            </Text>
          </YStack>

          {message && (
            <Text fontSize="$4" color={isDark ? '#e5e5e5' : '#333333'} textAlign="center" lineHeight="$4" marginTop="$3">
              {message}
            </Text>
          )}

          <XStack space="$3" justifyContent="center" flexWrap="wrap" marginTop="$4">
            {(actions && actions.length > 0 ? actions : [{ label: t('common.back'), onPress: hide }]).map((action, idx) => {
              const variant = action.variant || 'primary';
              return (
                <Button
                  key={`${action.label}-${idx}`}
                  size="$6"
                  backgroundColor={
                    variant === 'danger'
                      ? '#ef4444'
                      : variant === 'secondary'
                      ? (isDark ? '#374151' : '#e5e7eb')
                      : '#3b82f6'
                  }
                  color={
                    variant === 'secondary' 
                      ? (isDark ? '#ffffff' : '#000000')
                      : '#ffffff'
                  }
                  borderWidth={variant === 'secondary' ? 1 : 0}
                  borderColor={variant === 'secondary' ? (isDark ? '#4b5563' : '#d1d5db') : 'transparent'}
                  onPress={() => {
                    try { action.onPress?.(); } finally { hide(); }
                  }}
                  minWidth={80}
                  maxWidth={120}
                  fontSize="$3"
                  pressStyle={{
                    backgroundColor: variant === 'danger' ? '#dc2626' : variant === 'secondary' ? (isDark ? '#4b5563' : '#d1d5db') : '#2563eb'
                  }}
                >
                  {action.label}
                </Button>
              );
            })}
          </XStack>
          </YStack>
        </YStack>
      )}
    </AnimatePresence>
  );
};

export default MessageBox;