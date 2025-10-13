import { useWindow } from '@/hooks/useWindow';
import { Button, Text, XStack, YStack } from '@tamagui/core';
import React from 'react';

export const ExampleWindow: React.FC = () => {
  const { closeWindow } = useWindow();

  return (
    <YStack space="$4" padding="$4" minWidth={300}>
      <Text fontSize="$6" fontWeight="bold" color="$color">
        Hello Window! 🎉
      </Text>
      
      <Text fontSize="$4" color="$color" opacity={0.8}>
        This is an example window component that demonstrates the animated window system.
      </Text>
      
      <YStack space="$2">
        <Text fontSize="$3" color="$color" opacity={0.7}>
          Features:
        </Text>
        <Text fontSize="$3" color="$color" opacity={0.6}>
          • Smooth animations with Tamagui
        </Text>
        <Text fontSize="$3" color="$color" opacity={0.6}>
          • Backdrop click to close
        </Text>
        <Text fontSize="$3" color="$color" opacity={0.6}>
          • Portal rendering
        </Text>
        <Text fontSize="$3" color="$color" opacity={0.6}>
          • Theme-aware styling
        </Text>
      </YStack>
      
      <XStack space="$3" justifyContent="flex-end" marginTop="$4">
        <Button
          size="$3"
          variant="outlined"
          onPress={() => closeWindow()}
        >
          Close
        </Button>
      </XStack>
    </YStack>
  );
};

// Example usage component
export const WindowSystemDemo: React.FC = () => {
  const { openWindow } = useWindow();

  const openFadeWindow = () => {
    openWindow('fade-demo', <ExampleWindow />, { 
      animationType: 'fade',
      backdropColor: 'rgba(0, 0, 0, 0.3)',
    });
  };

  const openSlideWindow = () => {
    openWindow('slide-demo', <ExampleWindow />, { 
      animationType: 'slide-up',
      backdropColor: 'rgba(0, 0, 0, 0.4)',
    });
  };

  const openScaleWindow = () => {
    openWindow('scale-demo', <ExampleWindow />, { 
      animationType: 'scale',
      backdropColor: 'rgba(0, 0, 0, 0.5)',
    });
  };

  const openCustomWindow = () => {
    openWindow('custom-demo', <ExampleWindow />, { 
      animationType: 'custom',
      customAnimation: {
        animation: 'lazy',
        enterStyle: { opacity: 0, scale: 0.5, rotate: '180deg' },
        exitStyle: { opacity: 0, scale: 0.5, rotate: '-180deg' },
      },
      backdropColor: 'rgba(255, 0, 0, 0.2)',
    });
  };

  return (
    <YStack space="$4" padding="$4">
      <Text fontSize="$8" fontWeight="bold" color="$color">
        Window System Demo
      </Text>
      
      <YStack space="$3">
        <Button onPress={openFadeWindow} size="$4">
          Open Fade Window
        </Button>
        
        <Button onPress={openSlideWindow} size="$4">
          Open Slide Window
        </Button>
        
        <Button onPress={openScaleWindow} size="$4">
          Open Scale Window
        </Button>
        
        <Button onPress={openCustomWindow} size="$4">
          Open Custom Window
        </Button>
      </YStack>
    </YStack>
  );
};
