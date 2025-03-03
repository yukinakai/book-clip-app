import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  TextInputProps,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';

interface DialogInputProps extends TextInputProps {
  label: string;
}

interface DialogProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  children: React.ReactNode;
}

function DialogInput({ label, style, ...props }: DialogInputProps) {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.inputContainer}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TextInput
        style={[
          styles.input,
          {
            color: Colors[colorScheme].text,
            backgroundColor: Colors[colorScheme].background,
            borderColor: Colors[colorScheme].border,
          },
          style,
        ]}
        placeholderTextColor={Colors[colorScheme].placeholder}
        {...props}
      />
    </View>
  );
}

export function Dialog({ visible, onClose, onSubmit, title, children }: DialogProps) {
  const colorScheme = useColorScheme();

  const handleSubmit = () => {
    onSubmit();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={styles.dialogContainer}>
            <TouchableOpacity activeOpacity={1}>
              <ThemedView style={styles.dialog}>
                <ThemedText style={styles.title}>{title}</ThemedText>
                <ScrollView style={styles.content}>
                  {children}
                </ScrollView>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={onClose}
                  >
                    <ThemedText>キャンセル</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      {
                        backgroundColor: Colors[colorScheme].primary,
                      },
                    ]}
                    onPress={handleSubmit}
                  >
                    <ThemedText style={styles.submitButtonText}>
                      保存
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </ThemedView>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

Dialog.Input = DialogInput;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    width: '90%',
    maxWidth: 500,
  },
  dialog: {
    borderRadius: 8,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  content: {
    maxHeight: '70%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
