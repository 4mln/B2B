import { useWindow } from '@/hooks/useWindow';
import { Button, Text, XStack, YStack } from '@tamagui/core';
import React from 'react';

// Example of how to integrate the window system into your existing components

export const IntegrationExample: React.FC = () => {
  const { openWindow } = useWindow();

  // Example: Message Box (now uses the universal window system)
  const showMessageBox = () => {
    // Import the messageBoxStore to trigger the message box
    import('@/context/messageBoxStore').then(({ useMessageBoxStore }) => {
      const { show } = useMessageBoxStore.getState();
      show({
        type: 'info',
        title: 'Window System Integration',
        message: 'This message box now uses the universal window system with smooth Tamagui animations!',
        actions: [
          { label: 'OK', onPress: () => console.log('Message box confirmed') }
        ]
      });
    });
  };

  // Example: Form Dialog
  const showFormDialog = () => {
    const FormDialog = () => (
      <YStack space="$4" padding="$4" minWidth={350}>
        <Text fontSize="$6" fontWeight="bold" color="$color">
          Create Item
        </Text>
        <YStack space="$3">
          <Text fontSize="$4" color="$color">Name:</Text>
          {/* Add your form inputs here */}
          <Text fontSize="$3" color="$color" opacity={0.6}>
            Form inputs would go here...
          </Text>
        </YStack>
        <XStack space="$3" justifyContent="flex-end">
          <Button variant="outlined" size="$3">
            Cancel
          </Button>
          <Button size="$3">
            Create
          </Button>
        </XStack>
      </YStack>
    );

    openWindow('form-dialog', <FormDialog />, {
      animationType: 'scale',
      backdropColor: 'rgba(0, 0, 0, 0.5)',
      closeOnBackdropClick: false,
    });
  };

  // Example: Notification Popup
  const showNotification = () => {
    const Notification = () => (
      <YStack space="$3" padding="$4" backgroundColor="$green9" borderRadius="$4" minWidth={250}>
        <XStack space="$3" alignItems="center">
          <Text fontSize="$5" color="white" fontWeight="bold">
            ✅ Success!
          </Text>
        </XStack>
        <Text fontSize="$4" color="white" opacity={0.9}>
          Your action was completed successfully.
        </Text>
      </YStack>
    );

    openWindow('notification', <Notification />, {
      animationType: 'slide-down',
      backdropColor: 'transparent',
      closeOnBackdropClick: true,
      zIndex: 9999,
    });

    // Auto-close after 3 seconds
    setTimeout(() => {
      openWindow('close', null);
    }, 3000);
  };

  // Example: Settings Sheet
  const showSettingsSheet = () => {
    const SettingsSheet = () => (
      <YStack space="$4" padding="$4" backgroundColor="$background" borderRadius="$6" maxHeight="80%">
        <Text fontSize="$6" fontWeight="bold" color="$color">
          Settings
        </Text>
        <YStack space="$3">
          <Text fontSize="$4" color="$color">Theme</Text>
          <Text fontSize="$4" color="$color">Notifications</Text>
          <Text fontSize="$4" color="$color">Privacy</Text>
          <Text fontSize="$4" color="$color">About</Text>
        </YStack>
        <XStack space="$3" justifyContent="flex-end" marginTop="$4">
          <Button variant="outlined" size="$3">
            Close
          </Button>
        </XStack>
      </YStack>
    );

    openWindow('settings-sheet', <SettingsSheet />, {
      animationType: 'slide-up',
      backdropColor: 'rgba(0, 0, 0, 0.3)',
    });
  };

  return (
    <YStack space="$4" padding="$4">
      <Text fontSize="$8" fontWeight="bold" color="$color">
        Window System Integration Examples
      </Text>
      
      <Text fontSize="$4" color="$color" opacity={0.8}>
        Click the buttons below to see different window types in action:
      </Text>
      
      <YStack space="$3">
        <Button onPress={showMessageBox} size="$4">
          Show Message Box
        </Button>
        
        <Button onPress={showFormDialog} size="$4">
          Show Form Dialog
        </Button>
        
        <Button onPress={showNotification} size="$4">
          Show Notification
        </Button>
        
        <Button onPress={showSettingsSheet} size="$4">
          Show Settings Sheet
        </Button>
      </YStack>
    </YStack>
  );
};
