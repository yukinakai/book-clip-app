import React from 'react';
import { Text } from 'react-native';

export const Ionicons = ({ name, size, color }: { name: string; size: number; color: string }) => (
  <Text testID={`ionicon-${name}`} style={{ fontSize: size, color }}>
    {name}
  </Text>
);

Ionicons.glyphMap = {
  pencil: '',
  add: '',
  trash: '',
  'chevron-back': '',
  'chevron-forward': '',
  close: '',
  search: '',
  scan: '',
};
