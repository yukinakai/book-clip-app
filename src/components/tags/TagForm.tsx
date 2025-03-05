import React, { useCallback, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Dialog } from '../ui/Dialog';
import { ThemedText } from '../ui/ThemedText';
import { CreateTagInput } from '@/types/tag';

interface TagFormProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTagInput) => void;
  initialValues?: CreateTagInput;
  testID?: string;
}

export const TagForm: React.FC<TagFormProps> = ({
  isVisible,
  onClose,
  onSubmit,
  initialValues,
  testID,
}) => {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [error, setError] = useState('');

  const handleSubmit = useCallback(() => {
    if (!name.trim()) {
      setError('タグ名を入力してください');
      return;
    }

    onSubmit({ name });
    setName('');
    setError('');
    onClose();
  }, [name, onSubmit, onClose]);

  const handleCancel = useCallback(() => {
    setName('');
    setError('');
    onClose();
  }, [onClose]);

  return (
    <Dialog
      isVisible={isVisible}
      onClose={handleCancel}
      title={initialValues ? 'タグを編集' : 'タグを作成'}
      content={
        <View style={styles.container}>
          <ThemedText style={styles.label}>タグ名</ThemedText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="タグ名を入力..."
            style={styles.input}
            testID={`${testID}-input`}
          />
          {error ? (
            <ThemedText style={styles.error} testID={`${testID}-error`}>
              {error}
            </ThemedText>
          ) : null}
        </View>
      }
      actions={
        <View style={styles.actions}>
          <Dialog.Button
            label="キャンセル"
            onPress={handleCancel}
          />
          <Dialog.Button
            label={initialValues ? '更新' : '作成'}
            onPress={handleSubmit}
          />
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
  },
  error: {
    color: 'red',
    fontSize: 14,
  },
});
