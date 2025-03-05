import React, { useCallback, useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { ParallaxScrollView } from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TagList } from '@/components/tags/TagList';
import { TagForm } from '@/components/tags/TagForm';
import { Dialog } from '@/components/ui/Dialog';
import { Tag } from '@/types/tag';
import { createTag, deleteTag, getAllTags, updateTag } from '@/lib/tags';
import { useAuth } from '@/hooks/useAuth';

export default function ExploreScreen() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
  const { user } = useAuth();

  const loadTags = useCallback(async () => {
    if (!user) return;
    const fetchedTags = await getAllTags();
    setTags(fetchedTags);
  }, [user]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const handleAddTag = useCallback(() => {
    setSelectedTag(null);
    setIsFormVisible(true);
  }, []);

  const handleEditTag = useCallback((tag: Tag) => {
    setSelectedTag(tag);
    setIsFormVisible(true);
  }, []);

  const handleDeleteTag = useCallback((tag: Tag) => {
    setSelectedTag(tag);
    setIsDeleteDialogVisible(true);
  }, []);

  const handleFormSubmit = useCallback(async (name: string) => {
    if (selectedTag) {
      await updateTag(selectedTag.id, name);
    } else {
      await createTag(name);
    }
    loadTags();
    setIsFormVisible(false);
  }, [selectedTag, loadTags]);

  const handleFormClose = useCallback(() => {
    setIsFormVisible(false);
    setSelectedTag(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (selectedTag) {
      await deleteTag(selectedTag.id);
      loadTags();
    }
    setIsDeleteDialogVisible(false);
    setSelectedTag(null);
  }, [selectedTag, loadTags]);

  const handleDeleteCancel = useCallback(() => {
    setIsDeleteDialogVisible(false);
    setSelectedTag(null);
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="tag"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">タグ管理</ThemedText>
          <IconSymbol
            name="plus.circle"
            size={24}
            onPress={handleAddTag}
            testID="add-tag-button"
          />
        </ThemedView>

        <TagList
          tags={tags}
          onEditTag={handleEditTag}
          onDeleteTag={handleDeleteTag}
          testID="tag-list"
        />

        <TagForm
          visible={isFormVisible}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          tag={selectedTag || undefined}
        />

        <Dialog
          visible={isDeleteDialogVisible}
          onClose={handleDeleteCancel}
          title="タグの削除"
          testID="delete-dialog"
          content={
            <ThemedText>
              {selectedTag?.name}
              を削除してもよろしいですか？削除すると、このタグが付けられた引用からも削除されます。
            </ThemedText>
          }
          actions={
            <>
              <Dialog.Button
                label="キャンセル"
                onPress={handleDeleteCancel}
                testID="delete-cancel-button"
              />
              <Dialog.Button
                label="削除"
                onPress={handleDeleteConfirm}
                testID="delete-confirm-button"
                destructive
              />
            </>
          }
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
});
