import React, { ReactNode } from 'react';
import { View, Text, Pressable as RNPressable, TextInput, Modal, KeyboardTypeOptions, StyleProp, TextStyle } from 'react-native';

// Create a local Pressable component to ensure it's properly defined
const Pressable = RNPressable;

export interface DialogButtonProps {
  label: string;
  onPress: () => void;
  testID?: string;
  destructive?: boolean;
  disabled?: boolean;
}

export interface DialogInputProps {
  placeholder?: string;
  value?: string;
  onChangeText: (text: string) => void;
  testID?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  label?: string;
  autoFocus?: boolean;
}

export interface DialogMessageProps {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  testID?: string;
}

export interface DialogProps {
  visible: boolean;
  onClose: () => void;
  children?: ReactNode;
  actions?: ReactNode;
  testID?: string;
  title?: string;
  content?: ReactNode;
}

const Dialog: React.FC<DialogProps> & {
  Button: React.FC<DialogButtonProps>;
  Input: React.FC<DialogInputProps>;
  Message: React.FC<DialogMessageProps>;
} = ({ visible, onClose, children, actions, testID = 'dialog', title, content }) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View testID={testID}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          {title && <Text testID="dialog-title">{title}</Text>}
          {content}
          {children}
          {actions}
        </Pressable>
      </View>
    </Modal>
  );
};

Dialog.Button = ({ label, onPress, testID, destructive, disabled }) => (
  <Pressable 
    testID={testID} 
    onPress={onPress}
    accessibilityState={{ disabled }}
    disabled={disabled}
  >
    <Text style={destructive ? { color: '#FF3B30' } : undefined}>{label}</Text>
  </Pressable>
);

Dialog.Input = ({
  placeholder,
  value = '',
  onChangeText,
  testID,
  multiline,
  keyboardType,
  label,
  autoFocus
}) => (
  <View>
    {label && <Text>{label}</Text>}
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      testID={testID}
      multiline={multiline}
      keyboardType={keyboardType}
      style={multiline ? { minHeight: 80, textAlignVertical: 'top' } : undefined}
      autoFocus={autoFocus}
    />
  </View>
);

Dialog.Message = ({ children, style, testID }) => (
  <Text style={style} testID={testID}>
    {children}
  </Text>
);

export default Dialog;
export { Dialog };
