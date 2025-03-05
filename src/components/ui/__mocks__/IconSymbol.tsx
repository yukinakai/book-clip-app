import React from 'react';
import { TouchableOpacity, Text, ViewStyle } from 'react-native';

type IconName =
  | 'pencil'
  | 'add'
  | 'trash'
  | 'chevron-back'
  | 'chevron-forward'
  | 'close'
  | 'search'
  | 'scan'
  | 'tag'
  | 'plus.curcle';

interface IconSymbolProps {
  name: IconName;
  size?: number;
  color?: string;
  onPress?: () => void;
  testID?: string;
  style?: ViewStyle;
}

function IconSymbol({
  name,
  size = 24,
  color = '#000',
  onPress,
  testID,
  style,
}: IconSymbolProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={style}
      testID={testID}
    >
      <Text style={{ color }}>{name}</Text>
    </TouchableOpacity>
  );
}

export default IconSymbol;
export { IconSymbol };
