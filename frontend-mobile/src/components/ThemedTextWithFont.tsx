import { useFontFamily } from '@/hooks/useFontFamily';
import React from 'react';
import { Text, TextProps } from 'tamagui';

interface ThemedTextWithFontProps extends TextProps {
  children: React.ReactNode;
}

export const ThemedTextWithFont: React.FC<ThemedTextWithFontProps> = ({
  children,
  ...props
}) => {
  const fontFamily = useFontFamily();

  return (
    <Text
      {...props}
      fontFamily={fontFamily.regular}
    >
      {children}
    </Text>
  );
};

export default ThemedTextWithFont;