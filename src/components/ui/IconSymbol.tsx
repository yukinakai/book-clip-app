import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';

interface Props extends Omit<TouchableOpacityProps, 'children'> {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
}

export function IconSymbol({ name, size = 24, color, style, ...props }: Props) {
  const colorScheme = useColorScheme();
  const iconColor = color ?? Colors[colorScheme].text;

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      {...props}
    >
      <Ionicons name={name} size={size} color={iconColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});
