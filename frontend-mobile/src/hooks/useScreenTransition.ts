import { useCallback } from 'react';
import { useAnimatedStyle, useSharedValue, withSpring, withTiming, runOnJS } from 'react-native-reanimated';

export const useScreenTransition = (setCurrentScreen: (screen: 'login' | 'signup' | 'otp' | null) => void) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const translateY = useSharedValue(50);

  const enterStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const animateIn = useCallback((screen: 'login' | 'signup' | 'otp') => {
    setCurrentScreen(screen);
    opacity.value = withTiming(1, { duration: 250 });
    scale.value = withSpring(1, { damping: 20, stiffness: 200 });
    translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
  }, [opacity, scale, translateY, setCurrentScreen]);

  const animateOut = useCallback(() => {
    opacity.value = withTiming(0, { duration: 250 });
    scale.value = withSpring(0.8, { damping: 20, stiffness: 200 });
    translateY.value = withSpring(-100, { damping: 20, stiffness: 200 }, () => {
      runOnJS(setCurrentScreen)(null);
    });
  }, [opacity, scale, translateY, setCurrentScreen]);

  return {
    enterStyle,
    animateIn,
    animateOut,
  };
};