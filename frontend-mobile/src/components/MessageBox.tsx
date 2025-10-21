import { useMessageBoxStore } from '@/context/messageBoxStore';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useModalAnimation } from '@/hooks/useModalAnimation';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Text, XStack, YStack } from 'tamagui';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

export const MessageBox: React.FC = () => {
  const { isVisible, type, title, message, actions, hide } = useMessageBoxStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const singleButtonRef = useRef<any>(null);

  // Local state to manage rendering during closing animation
  const [isRendered, setIsRendered] = useState(false);

  const { animateIn, animateOut, backdropOpacity, modalScale, modalTranslateY } =
    useModalAnimation(setIsRendered);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: modalTranslateY.value },
      { scale: modalScale.value },
    ],
  }));

  useEffect(() => {
    console.log('🔍 MessageBox: useEffect triggered - isVisible:', isVisible, 'isRendered:', isRendered);
    if (isVisible) {
      console.log('🔍 MessageBox: Calling animateIn');
      animateIn();
      // Auto-focus single button when message box opens
      if (actions.length === 1 && singleButtonRef.current) {
        // Small delay to ensure the button is rendered and animation started
        setTimeout(() => {
          singleButtonRef.current?.focus?.();
        }, 300); // Increased delay to account for animation
      }
    } else if (isRendered) {
      console.log('🔍 MessageBox: Calling animateOut');
      animateOut();
    }
  }, [isVisible, isRendered, actions.length, animateIn, animateOut]);

  // Enhanced focus trap for MessageBox
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    console.log('🔍 MessageBox: Key pressed:', e.key, 'Visible:', isVisible);

    // Handle Tab navigation - contain focus within MessageBox
    if (e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();

      // Get all focusable elements within the MessageBox only
      const messageBoxContainer = document.querySelector('[data-message-box-modal]');
      if (!messageBoxContainer) {
        console.log('🔍 MessageBox: Container not found');
        return;
      }

      const focusableElements = messageBoxContainer.querySelectorAll(
        'button, [tabindex]:not([tabindex="-1"])'
      );

      const focusableArray = Array.from(focusableElements).filter(el => {
        const element = el as HTMLElement;
        return element.offsetParent !== null && // Must be visible
               element.getAttribute('aria-hidden') !== 'true'; // Must not be aria-hidden
      });

      console.log('🔍 MessageBox: Found focusable buttons:', focusableArray.length);

      if (focusableArray.length === 0) {
        console.log('🔍 MessageBox: No focusable buttons found');
        return;
      }

      const currentIndex = focusableArray.indexOf(document.activeElement as Element);
      let nextIndex;

      if (e.shiftKey) {
        // Shift+Tab - go to previous button
        nextIndex = currentIndex <= 0 ? focusableArray.length - 1 : currentIndex - 1;
      } else {
        // Tab - go to next button
        nextIndex = currentIndex >= focusableArray.length - 1 ? 0 : currentIndex + 1;
      }

      console.log('🔍 MessageBox: Focusing button at index:', nextIndex);
      (focusableArray[nextIndex] as HTMLElement)?.focus();
      return;
    }

    // Handle Enter key - trigger focused button
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();

      if (actions.length === 1) {
        console.log('🔍 MessageBox: Enter pressed - triggering single action');
        actions[0].onPress?.();
        hide();
      } else {
        // For multiple buttons, trigger the focused button
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement.onclick) {
          activeElement.click();
          hide();
        }
      }
      return;
    }

    // Handle Escape key - close MessageBox
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      console.log('🔍 MessageBox: Escape pressed - hiding');
      hide();
      return;
    }
  }, [actions, hide, isVisible]);

  useEffect(() => {
    console.log('🔍 MessageBox: Setting up enhanced focus trap, visible:', isVisible);

    if (!isVisible) {
      console.log('🔍 MessageBox: Not visible, skipping setup');
      return;
    }

    // Use capture phase to intercept events before background elements
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', (e) => e.stopPropagation(), true);

    return () => {
      console.log('🔍 MessageBox: Cleaning up focus trap');
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', (e) => e.stopPropagation(), true);
    };
  }, [isVisible, handleKeyDown]);

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


  // Render MessageBox with Reanimated animations
  console.log('🔍 MessageBox: Rendering with z-index 99999');

  return (
    <>
      {isRendered && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999999,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 16,
              pointerEvents: backdropOpacity.value > 0.1 ? 'auto' : 'none',
            },
            backdropStyle,
          ]}
        >
          <YStack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            backgroundColor="rgba(0, 0, 0, 0.7)"
            onPress={hide}
            pointerEvents={backdropOpacity.value > 0.1 ? 'auto' : 'none'}
          />
          <Animated.View
            style={[
              {
                backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                borderRadius: 12,
                padding: 16,
                minWidth: 300,
                maxWidth: 480,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 12,
                pointerEvents: modalScale.value > 0.3 ? 'auto' : 'none',
              },
              modalStyle,
            ]}
            data-message-box-modal // 🆕 Identifier for focus trap
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
                const isSingleButton = actions.length === 1;
                return (
                  <Button
                    key={`${action.label}-${idx}`}
                    ref={isSingleButton ? singleButtonRef : undefined}
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
          </Animated.View>
        </Animated.View>
      )}
    </>
  );
};

export default MessageBox;