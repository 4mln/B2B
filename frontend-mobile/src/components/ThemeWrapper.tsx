import React, { useEffect, useMemo } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Theme } from 'tamagui';
import { useThemeContext } from './ThemeProvider';

export interface ThemeWrapperProps {
  children: React.ReactNode;
}

export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children }) => {
  const { isDark } = useThemeContext();
  
  // Create animation values only once
  const animations = useMemo(() => ({
    fade: new Animated.Value(1),
    background: new Animated.Value(isDark ? 1 : 0),
  }), []);

  useEffect(() => {
    const { fade, background } = animations;
    
    // Animate theme change
    Animated.parallel([
      Animated.sequence([
        Animated.timing(fade, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(background, {
        toValue: isDark ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isDark, animations]);

  const backgroundColor = animations.background.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ffffff', '#000000'],
  });

  return (
    <Theme name={isDark ? 'dark' : 'light'}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: animations.fade,
            backgroundColor,
          },
        ]}
      >
        {children}
      </Animated.View>
    </Theme>
  );
};