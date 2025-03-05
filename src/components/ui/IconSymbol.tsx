import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type IconName =
  | 'pencil' // edit
  | 'add' // plus
  | 'trash' // delete
  | 'chevron-back'
  | 'chevron-forward'
  | 'close'
  | 'search'
  | 'scan';

interface IconSymbolProps {
  name: IconName;
  size?: number;
  color?: string;
  onPress?: () => void;
  testID?: string;
  style?: ViewStyle;
}

const iconMap: Record<IconName, keyof typeof Ionicons['glyphMap']> = {
  pencil: 'pencil',
  add: 'add',
  trash: 'trash',
  'chevron-back': 'chevron-back',
  'chevron-forward': 'chevron-forward',
  close: 'close',
  search: 'search',
  scan: 'scan',
};

export function IconSymbol({
  name,
  size = 24,
  color = '#000',
  onPress,
  testID,
  style,
}: IconSymbolProps) {
  const mappedName = iconMap[name];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={[styles.container, style]}
      testID={testID}
    >
      <Ionicons name={mappedName} size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});
