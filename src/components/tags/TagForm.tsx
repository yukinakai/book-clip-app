import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Dialog } from '@/components/ui/Dialog';
import { Tag } from '@/types/tag';

export interface TagFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  tag?: Tag;
}

export const TagForm: React.FC<TagFormProps> = ({
  visible,
  onClose,
  onSubmit,
  tag,
}) => {
  const [name, setName] = useState(tag?.name ?? '');

  const handleCancel = () => {
    setName('');
    onClose();
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit(name.trim());
    setName('');
    onClose();
  };

  return (
    <Dialog
      title={tag ? 'タグを編集' : 'タグを作成'}
      visible={visible}
      onClose={onClose}
    >
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="タグ名"
        autoFocus
        testID="tag-name-input"
      />
      <View style={styles.actions}>
        <Dialog.Button
          label="キャンセル"
          onPress={handleCancel}
          testID="cancel-button"
        />
        <Dialog.Button
          label={tag ? '更新' : '作成'}
          onPress={handleSubmit}
          testID="submit-button"
        />
      </View>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});
