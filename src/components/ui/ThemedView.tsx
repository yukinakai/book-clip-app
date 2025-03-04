import React from 'react';
import { View, ViewProps } from 'react-native';
import { useColorScheme } from '@hooks/useColorScheme';

interface ThemedViewProps extends ViewProps {
  children?: React.ReactNode;
}

export function ThemedView({ style, ...props }: ThemedViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={[
        { backgroundColor: isDark ? '#000' : '#fff' },
        style,
      ]}
      {...props}
    />
  );
}
