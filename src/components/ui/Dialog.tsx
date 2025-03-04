import React, { ReactNode } from 'react';
import { Modal, StyleSheet, View, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

interface DialogProps {
  title: string;
  isVisible: boolean;
  onClose: () => void;
  content: ReactNode;
  actions: ReactNode;
}

interface DialogButtonProps {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface DialogInputProps extends TextInputProps {
  label: string;
}

export function Dialog({ title, isVisible, onClose, content, actions }: DialogProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ThemedView style={styles.container}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <View style={styles.content}>{content}</View>
          <View style={styles.actions}>{actions}</View>
        </ThemedView>
      </View>
    </Modal>
  );
}

Dialog.Button = function DialogButton({ label, onPress, destructive }: DialogButtonProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <ThemedText
        style={[
          styles.button,
          destructive && styles.destructiveButton,
        ]}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
};

Dialog.Input = function DialogInput({
  label,
  ...props
}: DialogInputProps) {
  return (
    <View style={styles.inputContainer}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TextInput
        style={styles.input}
        placeholderTextColor="#666"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 8,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  content: {
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    padding: 8,
    fontWeight: '600',
  },
  destructiveButton: {
    color: '#ff3b30',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    color: '#000',
  },
});
