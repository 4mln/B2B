import { useCallback } from 'react';
import { useSharedValue, withSpring, withTiming, runOnJS } from 'react-native-reanimated';

export const useModalAnimation = (setIsRendered: (rendered: boolean) => void) => {
  const backdropOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.8);
  const modalTranslateY = useSharedValue(50);

  console.log('🔍 useModalAnimation: Hook initialized');

  const animateIn = useCallback(() => {
    console.log('🔍 useModalAnimation: animateIn called');
    setIsRendered(true);
    backdropOpacity.value = withTiming(1, { duration: 250 });
    modalScale.value = withSpring(1, { damping: 20, stiffness: 200 });
    modalTranslateY.value = withSpring(0, { damping: 20, stiffness: 200 });
  }, [backdropOpacity, modalScale, modalTranslateY, setIsRendered]);

  const animateOut = useCallback(() => {
    backdropOpacity.value = withTiming(0, { duration: 150 });
    modalScale.value = withSpring(0.8, { damping: 25, stiffness: 300 });
    modalTranslateY.value = withSpring(100, { damping: 25, stiffness: 300 }, () => {
      runOnJS(setIsRendered)(false);
    });
  }, [backdropOpacity, modalScale, modalTranslateY, setIsRendered]);

  return {
    animateIn,
    animateOut,
    backdropOpacity,
    modalScale,
    modalTranslateY,
  };
};