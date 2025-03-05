import React from 'react';
import { Text, TextProps } from 'react-native';
import { useColorScheme } from '@hooks/useColorScheme';

interface ThemedTextProps extends TextProps {
  type?: 'title'|'subtitle'|'defaultSemiBold';
  children: React.ReactNode;
}

export function ThemedText({ style, ...props }: ThemedTextProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Text
      style={[
        { color: isDark ? '#fff' : '#000' },
        style,
      ]}
      {...props}
    />
  );
}
