import { useThemeContext } from '@/components/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Pressable } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Stack as Box, Text, XStack as HStack, YStack as VStack } from 'tamagui';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUTTON_SIZE = 50;
const TUBE_WIDTH = 200;
const TUBE_HEIGHT = BUTTON_SIZE;
const SNAP_THRESHOLD = SCREEN_WIDTH / 2;
const EDGE_PADDING = 20;
const TOP_PADDING = 60;

export const ThemeSwitcher: React.FC = () => {
  const { isDark, setTheme } = useThemeContext();
  const [isPanelVisible, setIsPanelVisible] = React.useState(false);
  const [isOnRight, setIsOnRight] = React.useState(true);

  // Animated values
  const translateX = useSharedValue(SCREEN_WIDTH - BUTTON_SIZE - EDGE_PADDING);
  const translateY = useSharedValue(TOP_PADDING);
  const scale = useSharedValue(1);
  const tubeWidth = useSharedValue(0);

  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    try {
      console.log('🔍 ThemeSwitcher: Switching to theme:', newTheme);
      await setTheme(newTheme);
      togglePanel();
    } catch (error) {
      console.error('🔍 ThemeSwitcher: Failed to set theme:', error);
    }
  };

  const togglePanel = () => {
    setIsPanelVisible(!isPanelVisible);
    if (!isPanelVisible) {
      // Opening - slide out the tube
      tubeWidth.value = withSpring(TUBE_WIDTH, {
        damping: 15,
        stiffness: 100,
      });
    } else {
      // Closing - slide in the tube
      tubeWidth.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
      });
    }
  };

  // Gesture handlers for dragging
  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Zoom in when starting to drag
      scale.value = withSpring(1.2);
    })
    .onUpdate((event) => {
      // Update position while dragging
      translateX.value = event.translationX + (isOnRight ? SCREEN_WIDTH - BUTTON_SIZE - EDGE_PADDING : EDGE_PADDING);
      translateY.value = event.translationY + TOP_PADDING;
    })
    .onEnd(() => {
      // Zoom out when releasing
      scale.value = withSpring(1);

      // Snap to the nearest side
      const newIsOnRight = translateX.value > SNAP_THRESHOLD;
      
      // Update the side state
      runOnJS(setIsOnRight)(newIsOnRight);

      // Animate to the snapped position
      translateX.value = withSpring(
        newIsOnRight ? SCREEN_WIDTH - BUTTON_SIZE - EDGE_PADDING : EDGE_PADDING,
        {
          damping: 15,
          stiffness: 100,
        }
      );

      // Keep Y within bounds
      const minY = EDGE_PADDING;
      const maxY = SCREEN_HEIGHT - BUTTON_SIZE - EDGE_PADDING;
      if (translateY.value < minY) {
        translateY.value = withSpring(minY);
      } else if (translateY.value > maxY) {
        translateY.value = withSpring(maxY);
      }
    });

  // Tap gesture for opening panel
  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      // Zoom in when pressing
      scale.value = withTiming(1.1, { duration: 100 });
    })
    .onFinalize(() => {
      // Zoom out when releasing
      scale.value = withTiming(1, { duration: 100 });
      runOnJS(togglePanel)();
    });

  // Combine gestures
  const composedGesture = Gesture.Race(panGesture, tapGesture);

  // Animated styles for the button
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Animated styles for the tube
  const animatedTubeStyle = useAnimatedStyle(() => {
    const direction = isOnRight ? -1 : 1;
    return {
      width: tubeWidth.value,
      transform: [
        { translateX: direction * (BUTTON_SIZE / 2) },
      ],
    };
  });

  return (
    <>
      {/* Main draggable button */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: BUTTON_SIZE,
              height: BUTTON_SIZE,
              zIndex: 10000,
            },
            animatedButtonStyle,
          ]}
        >
          <Box
            width={BUTTON_SIZE}
            height={BUTTON_SIZE}
            borderRadius="$full"
            backgroundColor={isDark ? '$backgroundDark50' : '$backgroundLight100'}
            borderWidth={1}
            borderColor={isDark ? '$borderLight300' : '$borderLight200'}
            alignItems="center"
            justifyContent="center"
            shadowColor="#000"
            shadowOpacity={0.2}
            shadowRadius={8}
            elevation={5}
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={24}
              color={isDark ? '#fbbf24' : '#374151'}
            />
          </Box>

          {/* Tube-style panel */}
          {isPanelVisible && (
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  height: TUBE_HEIGHT,
                  overflow: 'hidden',
                  zIndex: -1,
                },
                isOnRight
                  ? { right: BUTTON_SIZE / 2 }
                  : { left: BUTTON_SIZE / 2 },
                animatedTubeStyle,
              ]}
            >
              <Box
                height="100%"
                backgroundColor={isDark ? '$backgroundDark0' : '$backgroundLight0'}
                borderRadius="$md"
                borderWidth={1}
                borderColor={isDark ? '$borderLight300' : '$borderLight200'}
                paddingHorizontal="$md"
                paddingVertical="$sm"
                shadowColor="#000"
                shadowOpacity={0.15}
                shadowRadius={8}
                elevation={5}
                flexDirection="row"
                alignItems="center"
                justifyContent="space-around"
              >
                {/* Light theme button */}
                <Pressable
                  onPress={() => handleThemeChange('light')}
                  style={{ padding: 8 }}
                >
                  <Box
                    width={36}
                    height={36}
                    borderRadius="$full"
                    backgroundColor={!isDark ? '$primary500' : '$backgroundLight100'}
                    borderWidth={2}
                    borderColor={!isDark ? '$primary500' : '$borderLight300'}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Ionicons
                      name="sunny"
                      size={18}
                      color={!isDark ? 'white' : '#6b7280'}
                    />
                  </Box>
                </Pressable>

                {/* Dark theme button */}
                <Pressable
                  onPress={() => handleThemeChange('dark')}
                  style={{ padding: 8 }}
                >
                  <Box
                    width={36}
                    height={36}
                    borderRadius="$full"
                    backgroundColor={isDark ? '$primary500' : '$backgroundLight100'}
                    borderWidth={2}
                    borderColor={isDark ? '$primary500' : '$borderLight300'}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Ionicons
                      name="moon"
                      size={18}
                      color={isDark ? 'white' : '#6b7280'}
                    />
                  </Box>
                </Pressable>
              </Box>
            </Animated.View>
          )}
        </Animated.View>
      </GestureDetector>
    </>
  );
};
