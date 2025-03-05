import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
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
      content={
        <Dialog.Input
          label="タグ名"
          value={name}
          onChangeText={setName}
          placeholder="タグの名前を入力"
          autoFocus
          testID="tag-name-input"
        />
      }
      actions={
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
            destructive={false}
          />
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});
