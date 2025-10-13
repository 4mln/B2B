import { useMessageBoxStore } from '@/context/messageBoxStore';
import { Button, Text, YStack } from '@tamagui/core';
import React from 'react';

export const MessageBoxExample: React.FC = () => {
  const { show } = useMessageBoxStore();

  const showInfoMessage = () => {
    show({
      type: 'info',
      title: 'Information',
      message: 'This is an info message using the universal window system!',
      actions: [
        { label: 'OK', onPress: () => console.log('Info message confirmed') }
      ]
    });
  };

  const showWarningMessage = () => {
    show({
      type: 'warning',
      title: 'Warning',
      message: 'This is a warning message with custom styling.',
      actions: [
        { label: 'Cancel', variant: 'secondary', onPress: () => console.log('Warning cancelled') },
        { label: 'Continue', variant: 'danger', onPress: () => console.log('Warning accepted') }
      ]
    });
  };

  const showErrorMessage = () => {
    show({
      type: 'error',
      title: 'Error',
      message: 'This is an error message with multiple actions.',
      actions: [
        { label: 'Retry', onPress: () => console.log('Retry clicked') },
        { label: 'Cancel', variant: 'secondary', onPress: () => console.log('Error cancelled') }
      ]
    });
  };

  const showCustomMessage = () => {
    show({
      type: 'info',
      title: 'Custom Title',
      message: 'This message has a custom title and uses the universal window system with Tamagui animations.',
      actions: [
        { label: 'Got it!', onPress: () => console.log('Custom message confirmed') }
      ]
    });
  };

  return (
    <YStack space="$4" padding="$4">
      <Text fontSize="$8" fontWeight="bold" color="$color">
        MessageBox with Window System
      </Text>
      
      <Text fontSize="$4" color="$color" opacity={0.8}>
        The MessageBox component now uses the universal window system with smooth Tamagui animations instead of React Native's Animated API.
      </Text>
      
      <YStack space="$3">
        <Button onPress={showInfoMessage} size="$4">
          Show Info Message
        </Button>
        
        <Button onPress={showWarningMessage} size="$4">
          Show Warning Message
        </Button>
        
        <Button onPress={showErrorMessage} size="$4">
          Show Error Message
        </Button>
        
        <Button onPress={showCustomMessage} size="$4">
          Show Custom Message
        </Button>
      </YStack>
      
      <YStack space="$2" marginTop="$4">
        <Text fontSize="$3" color="$color" opacity={0.7}>
          Features:
        </Text>
        <Text fontSize="$3" color="$color" opacity={0.6}>
          • Uses universal window system
        </Text>
        <Text fontSize="$3" color="$color" opacity={0.6}>
          • Tamagui animations (scale effect)
        </Text>
        <Text fontSize="$3" color="$color" opacity={0.6}>
          • Theme-aware styling
        </Text>
        <Text fontSize="$3" color="$color" opacity={0.6}>
          • Portal rendering
        </Text>
        <Text fontSize="$3" color="$color" opacity={0.6}>
          • Backdrop click to close
        </Text>
      </YStack>
    </YStack>
  );
};
