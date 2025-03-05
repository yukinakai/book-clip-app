import React from 'react';
import { Text, View, TextInput } from 'react-native';

const Dialog = ({ visible, onClose, title, children }: any) => {
  if (!visible) return null;
  return (
    <View testID="dialog">
      <Text>{title}</Text>
      {children}
      <Text onPress={onClose}>Close</Text>
    </View>
  );
};

Dialog.Button = ({ label, onPress, testID, destructive }: any) => (
  <Text
    testID={testID}
    onPress={onPress}
    style={destructive ? { color: 'red' } : undefined}
  >
    {label}
  </Text>
);

Dialog.Input = ({ label, value, onChangeText, placeholder, multiline, keyboardType, testID }: any) => (
  <View>
    <Text>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline={multiline}
      keyboardType={keyboardType}
      testID={testID}
    />
  </View>
);

export { Dialog };
