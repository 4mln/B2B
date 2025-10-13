import { AnimationType, Window } from '@/types/window';
import { Portal } from '@tamagui/portal';
import React from 'react';
import { AnimatePresence, YStack } from 'tamagui';

interface AnimatedWindowProps extends Window {
  visible: boolean;
  onClose: () => void;
}


const getAnimationProps = (animationType: AnimationType, customAnimation?: Window['options']['customAnimation']) => {
  if (customAnimation) {
    return {
      animation: customAnimation.animation || 'bouncy',
      enterStyle: customAnimation.enterStyle,
      exitStyle: customAnimation.exitStyle,
    };
  }

  const baseAnimation = {
    animation: 'bouncy' as const,
    duration: 300,
  };

  switch (animationType) {
    case 'fade':
      return {
        ...baseAnimation,
        enterStyle: { opacity: 0 },
        exitStyle: { opacity: 0 },
      };
    
    case 'slide-up':
      return {
        ...baseAnimation,
        enterStyle: { opacity: 0, y: 50, scale: 0.95 },
        exitStyle: { opacity: 0, y: 50, scale: 0.95 },
      };
    
    case 'slide-down':
      return {
        ...baseAnimation,
        enterStyle: { opacity: 0, y: -50, scale: 0.95 },
        exitStyle: { opacity: 0, y: -50, scale: 0.95 },
      };
    
    case 'slide-left':
      return {
        ...baseAnimation,
        enterStyle: { opacity: 0, x: 50, scale: 0.95 },
        exitStyle: { opacity: 0, x: 50, scale: 0.95 },
      };
    
    case 'slide-right':
      return {
        ...baseAnimation,
        enterStyle: { opacity: 0, x: -50, scale: 0.95 },
        exitStyle: { opacity: 0, x: -50, scale: 0.95 },
      };
    
    case 'scale':
      return {
        ...baseAnimation,
        enterStyle: { opacity: 0, scale: 0.8 },
        exitStyle: { opacity: 0, scale: 0.8 },
      };
    
    default:
      return {
        ...baseAnimation,
        enterStyle: { opacity: 0, scale: 0.9, y: 20 },
        exitStyle: { opacity: 0, scale: 0.95, y: 20 },
      };
  }
};

export const AnimatedWindow: React.FC<AnimatedWindowProps> = ({
  id,
  component,
  options,
  visible,
  onClose,
}) => {
  const {
    animationType = 'fade',
    backdropColor = 'rgba(0, 0, 0, 0.5)',
    backdropOpacity = 0.5,
    zIndex = 1000,
    closeOnBackdropClick = true,
    customAnimation,
  } = options;

  const animationProps = getAnimationProps(animationType, customAnimation);

  const handleBackdropPress = () => {
    if (closeOnBackdropClick) {
      onClose();
    }
  };

  return (
    <Portal>
      <AnimatePresence>
        {visible && (
          <YStack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={zIndex}
            backgroundColor={backdropColor}
            opacity={backdropOpacity}
            animation="quick"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
            onPress={handleBackdropPress}
            pressStyle={{ opacity: backdropOpacity * 0.8 }}
          >
            <YStack
              flex={1}
              justifyContent="center"
              alignItems="center"
              padding="$4"
              onPress={(e) => e.stopPropagation()}
            >
              <YStack
                backgroundColor="$background"
                borderRadius="$6"
                padding="$4"
                shadowColor="$shadowColor"
                shadowOffset={{ width: 0, height: 4 }}
                shadowOpacity={0.1}
                shadowRadius={12}
                elevation={8}
                maxWidth="90%"
                maxHeight="90%"
                {...animationProps}
              >
                {component}
              </YStack>
            </YStack>
          </YStack>
        )}
      </AnimatePresence>
    </Portal>
  );
};
