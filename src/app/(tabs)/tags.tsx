import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TagList } from '@/components/tags/TagList';
import { TagForm } from '@/components/tags/TagForm';
import { createTag, deleteTag, getAllTags, updateTag } from '@/lib/tags';
import { Tag } from '@/types/tag';
import { ThemedView } from '@/components/ui/ThemedView';
import { Dialog } from '@/components/ui/Dialog';

export default function TagsScreen() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | undefined>(undefined);

  // タグ一覧を取得
  const fetchTags = useCallback(async () => {
    const fetchedTags = await getAllTags();
    setTags(fetchedTags);
  }, []);

  // 画面がフォーカスされたときにタグ一覧を更新
  useFocusEffect(
    useCallback(() => {
      fetchTags();
    }, [fetchTags])
  );

  // タグの作成/更新
  const handleSubmit = async (name: string) => {
    if (selectedTag) {
      const updated = await updateTag(selectedTag.id, name);
      if (updated) {
        setTags(prev => prev.map(tag => 
          tag.id === selectedTag.id ? { ...tag, name } : tag
        ));
      }
    } else {
      const created = await createTag(name);
      if (created) {
        setTags(prev => [...prev, created]);
      }
    }
    setSelectedTag(undefined);
  };

  // タグの削除
  const handleDelete = async () => {
    if (!selectedTag) return;
    
    const success = await deleteTag(selectedTag.id);
    if (success) {
      setTags(prev => prev.filter(tag => tag.id !== selectedTag.id));
    }
    setIsDeleteDialogVisible(false);
    setSelectedTag(undefined);
  };

  // タグの編集
  const handleEdit = (tag: Tag) => {
    setSelectedTag(tag);
    setIsFormVisible(true);
  };

  // タグの削除確認
  const handleDeleteConfirm = (tag: Tag) => {
    setSelectedTag(tag);
    setIsDeleteDialogVisible(true);
  };

  return (
    <ThemedView style={styles.container}>
      <TagList
        tags={tags}
        onEditTag={handleEdit}
        onDeleteTag={handleDeleteConfirm}
        testID="tag-list"
      />

      {/* 新規作成ボタン */}
      <IconSymbol
        name="plus.curcle"
        size={50}
        style={styles.fab}
        onPress={() => {
          setSelectedTag(undefined);
          setIsFormVisible(true);
        }}
        testID="create-tag-button"
      />

      {/* タグ作成/編集フォーム */}
      <TagForm
        visible={isFormVisible}
        onClose={() => {
          setIsFormVisible(false);
          setSelectedTag(undefined);
        }}
        onSubmit={handleSubmit}
        tag={selectedTag}
      />

      {/* 削除確認ダイアログ */}
      <Dialog
        title="タグを削除"
        visible={isDeleteDialogVisible}
        onClose={() => {
          setIsDeleteDialogVisible(false);
          setSelectedTag(undefined);
        }}
        content={
          <View>
            <Dialog.Message>
              {`"${selectedTag?.name}" を削除してもよろしいですか？`}
            </Dialog.Message>
          </View>
        }
        actions={
          <View style={styles.dialogActions}>
            <Dialog.Button
              label="キャンセル"
              onPress={() => {
                setIsDeleteDialogVisible(false);
                setSelectedTag(undefined);
              }}
              testID="cancel-delete-button"
            />
            <Dialog.Button
              label="削除"
              onPress={handleDelete}
              destructive
              testID="confirm-delete-button"
            />
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});
