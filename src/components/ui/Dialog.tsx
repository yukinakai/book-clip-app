import React, { ReactNode } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, TextInput, KeyboardTypeOptions } from 'react-native';

export interface DialogButtonProps {
  label: string;
  onPress: () => void;
  testID?: string;
  destructive?: boolean;
}

export interface DialogInputProps {
  placeholder?: string;
  value?: string;
  onChangeText: (text: string) => void;
  testID?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  label?: string;
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

export const Dialog: React.FC<DialogProps> & {
  Button: React.FC<DialogButtonProps>;
  Input: React.FC<DialogInputProps>;
} = ({ visible, onClose, children, actions, testID, title, content }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.container} testID={testID}>
          <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
            {title && <Text style={styles.title}>{title}</Text>}
            {content}
            {children}
            {actions}
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

Dialog.Button = ({ label, onPress, testID, destructive }) => (
  <Pressable
    style={({ pressed }) => [
      styles.button,
      pressed && styles.buttonPressed,
    ]}
    onPress={onPress}
    testID={testID}
  >
    <Text
      style={[
        styles.buttonText,
        destructive && styles.destructiveButtonText,
      ]}
    >
      {label}
    </Text>
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
}) => (
  <View>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput
      style={[styles.input, multiline && styles.multilineInput]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      testID={testID}
      multiline={multiline}
      keyboardType={keyboardType}
    />
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  content: {
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
  },
  destructiveButtonText: {
    color: '#FF3B30',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
    marginBottom: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
