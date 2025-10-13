import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/theme/colors';
import { semanticSpacing } from '@/theme/spacing';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

interface WebLayoutProps {
  children: React.ReactNode;
  maxWidth?: number;
}

export const WebLayout: React.FC<WebLayoutProps> = ({ 
  children, 
  maxWidth = 1200 
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = Dimensions.get('window');
  
  // Only apply web layout on larger screens
  const isWeb = width > 768;
  
  if (!isWeb) {
    return <>{children}</>;
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
    },
    content: {
      flex: 1,
      maxWidth: maxWidth,
      width: '100%',
      alignSelf: 'center',
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
    },
    sidebar: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 280,
      backgroundColor: isDark ? colors.gray[900] : colors.gray[50],
      borderRightWidth: 1,
      borderRightColor: isDark ? colors.border.light : colors.border.light,
      paddingTop: semanticSpacing.xl,
    },
    mainContent: {
      marginLeft: 280,
      flex: 1,
      paddingHorizontal: semanticSpacing.xl,
      paddingTop: semanticSpacing.xl,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};
