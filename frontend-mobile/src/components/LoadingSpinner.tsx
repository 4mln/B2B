import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { semanticSpacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  overlay?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color,
  text,
  overlay = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const spinnerColor = color || colors.primary[500];
  const backgroundColor = isDark ? colors.background.dark : colors.background.light;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: overlay ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
    },
    content: {
      alignItems: 'center',
      padding: semanticSpacing.lg,
      backgroundColor: overlay ? backgroundColor : 'transparent',
      borderRadius: overlay ? semanticSpacing.radius.lg : 0,
      ...(overlay && semanticSpacing.shadow.lg),
    },
    text: {
      fontSize: typography.body.fontSize,
      color: isDark ? colors.text.primary : colors.text.primary,
      marginTop: semanticSpacing.md,
      textAlign: 'center',
    },
  });

  return (
    <View style={[styles.container, overlay && styles.overlay]}>
      <View style={styles.content}>
        <ActivityIndicator size={size} color={spinnerColor} />
        {text && <Text style={styles.text}>{text}</Text>}
      </View>
    </View>
  );
};
