import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Animated } from 'react-native';

export function HapticTab(props: BottomTabBarButtonProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = (ev: any) => {
    // Zoom in animation - subtle effect
    Animated.spring(scaleAnim, {
      toValue: 1.15,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();

    if (process.env.EXPO_OS === 'ios') {
      // Add a soft haptic feedback when pressing down on the tabs.
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    props.onPressIn?.(ev);
  };

  const handlePressOut = (ev: any) => {
    // Zoom out animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
    props.onPressOut?.(ev);
  };

  const handleHoverIn = () => {
    // Zoom in animation on hover
    Animated.spring(scaleAnim, {
      toValue: 1.15,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handleHoverOut = () => {
    // Zoom out animation on hover out
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <PlatformPressable
        {...props}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}
      />
    </Animated.View>
  );
}
