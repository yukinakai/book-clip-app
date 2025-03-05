import React from 'react';
import { View, ViewProps, Pressable } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

export interface ThemedViewProps extends ViewProps {
  children?: React.ReactNode;
  onPress?: () => void;
}

export function ThemedView({ style, onPress, ...props }: ThemedViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const content = (
    <View
      style={[
        { backgroundColor: isDark ? '#000' : '#fff' },
        style,
      ]}
      {...props}
    />
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}
