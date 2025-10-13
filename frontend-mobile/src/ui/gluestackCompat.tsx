// ⚠️ DEPRECATED: This file is no longer needed after Tamagui migration
// The project has fully migrated from Gluestack to Tamagui
// All components should now import directly from 'tamagui'

// This file is kept for reference only and should be removed
// once all imports have been updated to use Tamagui directly

import { Pressable as RNPressable, Text as RNText } from 'react-native';
import { Button, H1, Input, Spinner, Stack, XStack, YStack } from 'tamagui';

// Legacy exports - use Tamagui imports directly instead
export const Box = Stack;
export const Pressable = RNPressable;
export const Text = RNText;
export { Spinner };
export const HStack = XStack;
export const VStack = YStack;
export const Heading = H1;
export { Button, Input, Stack };

// TODO: Remove this file once all components use Tamagui directly


