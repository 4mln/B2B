# Universal Animated Window System

A production-ready animated window system for Expo + React Native + Tamagui projects that provides consistent animations for modals, sheets, message boxes, and full-screen overlay pages.

## Features

- 🎨 **Tamagui Native Animations**: Uses `@tamagui/animate-presence`, `@tamagui/motion`, and `@tamagui/portal`
- 🚀 **Universal**: Works on iOS, Android, and Web
- 🎭 **Multiple Animation Types**: Fade, slide, scale, and custom animations
- 🎯 **Type-Safe**: Full TypeScript support
- 🎪 **Portal Rendering**: Never blocks UI or breaks existing routes
- 🎨 **Theme-Aware**: Uses Tamagui theme tokens
- 📱 **Mobile Optimized**: Touch-friendly with backdrop interactions

## Installation

```bash
npm install @tamagui/animate-presence @tamagui/motion @tamagui/portal
```

## Setup

### 1. Wrap your app with the WindowManagerProvider

```tsx
// In your _layout.tsx or App.tsx
import { WindowManagerProvider } from '@/components/window-system';

export default function RootLayout() {
  return (
    <WindowManagerProvider>
      {/* Your app content */}
      <AppWindows />
    </WindowManagerProvider>
  );
}
```

### 2. Add AppWindows to your root component

```tsx
import { AppWindows } from '@/components/window-system';

export default function App() {
  return (
    <>
      {/* Your app content */}
      <AppWindows />
    </>
  );
}
```

## Usage

### Basic Usage

```tsx
import { useWindow } from '@/components/window-system';

function MyComponent() {
  const { openWindow, closeWindow } = useWindow();

  const showModal = () => {
    openWindow('my-modal', <MyModalContent />, {
      animationType: 'fade',
      backdropColor: 'rgba(0, 0, 0, 0.5)',
    });
  };

  return <Button onPress={showModal}>Show Modal</Button>;
}
```

### Animation Types

```tsx
// Fade animation
openWindow('fade', <Content />, { animationType: 'fade' });

// Slide animations
openWindow('slide-up', <Content />, { animationType: 'slide-up' });
openWindow('slide-down', <Content />, { animationType: 'slide-down' });
openWindow('slide-left', <Content />, { animationType: 'slide-left' });
openWindow('slide-right', <Content />, { animationType: 'slide-right' });

// Scale animation
openWindow('scale', <Content />, { animationType: 'scale' });

// Custom animation
openWindow('custom', <Content />, {
  animationType: 'custom',
  customAnimation: {
    animation: 'lazy',
    enterStyle: { opacity: 0, scale: 0.5, rotate: '180deg' },
    exitStyle: { opacity: 0, scale: 0.5, rotate: '-180deg' },
  },
});
```

### Window Options

```tsx
interface WindowOptions {
  animationType?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale' | 'custom';
  backdropColor?: string;
  backdropOpacity?: number;
  zIndex?: number;
  closeOnBackdropClick?: boolean;
  customAnimation?: {
    enterStyle?: Record<string, any>;
    exitStyle?: Record<string, any>;
    animation?: string;
  };
}
```

### Window Management

```tsx
const { openWindow, closeWindow, closeAllWindows } = useWindow();

// Open a window
openWindow('unique-id', <Component />, options);

// Close specific window
closeWindow('unique-id');

// Close last window
closeWindow();

// Close all windows
closeAllWindows();
```

## Examples

### Modal Dialog

```tsx
const ModalDialog = () => (
  <YStack space="$4" padding="$4">
    <Text fontSize="$6" fontWeight="bold">Confirm Action</Text>
    <Text>Are you sure you want to proceed?</Text>
    <XStack space="$3" justifyContent="flex-end">
      <Button variant="outlined" onPress={() => closeWindow()}>
        Cancel
      </Button>
      <Button onPress={handleConfirm}>
        Confirm
      </Button>
    </XStack>
  </YStack>
);

// Usage
openWindow('confirm-dialog', <ModalDialog />, {
  animationType: 'scale',
  closeOnBackdropClick: false,
});
```

### Bottom Sheet

```tsx
const BottomSheet = () => (
  <YStack space="$4" padding="$4" backgroundColor="$background">
    <Text fontSize="$6" fontWeight="bold">Options</Text>
    <YStack space="$2">
      <Button>Option 1</Button>
      <Button>Option 2</Button>
      <Button>Option 3</Button>
    </YStack>
  </YStack>
);

// Usage
openWindow('bottom-sheet', <BottomSheet />, {
  animationType: 'slide-up',
  backdropColor: 'rgba(0, 0, 0, 0.3)',
});
```

### Full Screen Overlay

```tsx
const FullScreenOverlay = () => (
  <YStack flex={1} backgroundColor="$background" padding="$4">
    <Text fontSize="$8" fontWeight="bold">Full Screen</Text>
    {/* Your content */}
  </YStack>
);

// Usage
openWindow('full-screen', <FullScreenOverlay />, {
  animationType: 'fade',
  backdropColor: 'transparent',
  closeOnBackdropClick: false,
});
```

## API Reference

### useWindow()

Returns window management functions:

- `openWindow(id: string, component: ReactNode, options?: WindowOptions)`: Open a new window
- `closeWindow(id?: string)`: Close a specific window or the last opened window
- `closeAllWindows()`: Close all open windows

### WindowManagerProvider

Context provider that manages the window state using Zustand.

### AppWindows

Root component that renders all open windows using Portal.Host.

### AnimatedWindow

Individual animated window component with Tamagui animations.

## Best Practices

1. **Unique IDs**: Always use unique IDs for windows to prevent conflicts
2. **Performance**: Close windows when not needed to free up memory
3. **Accessibility**: Ensure windows are accessible with proper focus management
4. **Theme**: Use Tamagui theme tokens for consistent styling
5. **Animations**: Choose appropriate animation types for your use case

## Troubleshooting

### Common Issues

1. **Windows not showing**: Ensure `AppWindows` is rendered in your root component
2. **Animations not working**: Check that Tamagui animation packages are installed
3. **Portal issues**: Make sure you're using the latest version of `@tamagui/portal`

### Debug Mode

```tsx
// Add this to see all open windows
const { windows } = useWindowManager();
console.log('Open windows:', windows);
```
