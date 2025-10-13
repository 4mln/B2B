import { useMessageBoxStore } from '@/context/messageBoxStore';
import { ExampleWindow, WindowSystemDemo } from '@/examples/ExampleWindow';
import { MessageBoxExample } from '@/examples/MessageBoxExample';
import { useWindow } from '@/hooks/useWindow';
import { Button, Text, XStack, YStack } from '@tamagui/core';

export default function WindowTestPage() {
  const { openWindow, closeWindow, closeAllWindows } = useWindow();
  const { show } = useMessageBoxStore();

  const testBasicWindow = () => {
    const TestContent = () => (
      <YStack space="$4" padding="$4" minWidth={300}>
        <Text fontSize="$6" fontWeight="bold" color="$color">
          Test Window
        </Text>
        <Text fontSize="$4" color="$color" opacity={0.8}>
          This is a basic test window using the universal window system.
        </Text>
        <XStack space="$3" justifyContent="flex-end">
          <Button size="$3" onPress={() => closeWindow('test-window')}>
            Close
          </Button>
        </XStack>
      </YStack>
    );

    openWindow('test-window', <TestContent />, {
      animationType: 'fade',
      backdropColor: 'rgba(0, 0, 0, 0.4)',
    });
  };

  const testMessageBox = () => {
    show({
      type: 'info',
      title: 'Window System Test',
      message: 'The MessageBox is now working with the universal window system!',
      actions: [
        { label: 'Great!', onPress: () => console.log('MessageBox test successful') }
      ]
    });
  };

  const testMultipleWindows = () => {
    // Open multiple windows to test stacking
    openWindow('window-1', <ExampleWindow />, { animationType: 'slide-up' });
    setTimeout(() => {
      openWindow('window-2', <ExampleWindow />, { animationType: 'scale' });
    }, 500);
    setTimeout(() => {
      openWindow('window-3', <ExampleWindow />, { animationType: 'fade' });
    }, 1000);
  };

  return (
    <YStack space="$4" padding="$4" flex={1} backgroundColor="$background">
      <Text fontSize="$8" fontWeight="bold" color="$color">
        Window System Test Page
      </Text>
      
      <Text fontSize="$4" color="$color" opacity={0.8}>
        Test the universal window system integration:
      </Text>

      <YStack space="$3">
        <Button onPress={testBasicWindow} size="$4">
          Test Basic Window
        </Button>
        
        <Button onPress={testMessageBox} size="$4">
          Test MessageBox
        </Button>
        
        <Button onPress={testMultipleWindows} size="$4">
          Test Multiple Windows
        </Button>
        
        <Button onPress={closeAllWindows} size="$4" variant="outlined">
          Close All Windows
        </Button>
      </YStack>

      <YStack space="$4" marginTop="$6">
        <Text fontSize="$6" fontWeight="bold" color="$color">
          Demo Components
        </Text>
        
        <WindowSystemDemo />
        
        <MessageBoxExample />
      </YStack>
    </YStack>
  );
}
