import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Dialog } from '@/components/ui/Dialog';
import { Tag } from '@/types/tag';
import { QuoteFormData } from '@/types/quote';

interface QuoteFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: QuoteFormData) => void;
  availableTags: Tag[];
  initialValues?: QuoteFormData;
}

export const QuoteForm: React.FC<QuoteFormProps> = ({
  visible,
  onClose,
  onSubmit,
  availableTags,
  initialValues,
}) => {
  // フォームの状態
  const [content, setContent] = useState(initialValues?.content ?? '');
  const [page, setPage] = useState(initialValues?.page?.toString() ?? '');
  const [memo, setMemo] = useState(initialValues?.memo ?? '');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialValues?.tags ?? []
  );
  const [isTagSelectVisible, setIsTagSelectVisible] = useState(false);

  // 必須項目が入力されているかチェック
  const isValid = content.trim().length > 0;

  // フォームのリセット
  const resetForm = useCallback(() => {
    setContent('');
    setPage('');
    setMemo('');
    setSelectedTagIds([]);
  }, []);

  // フォームのキャンセル
  const handleCancel = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  // フォームの送信
  const handleSubmit = useCallback(() => {
    if (!isValid) return;

    onSubmit({
      content,
      page: page ? parseInt(page, 10) : undefined,
      memo: memo || undefined,
      tags: selectedTagIds,
    });

    resetForm();
    onClose();
  }, [content, page, memo, selectedTagIds, onSubmit, onClose, resetForm, isValid]);

  // タグの選択・解除
  const toggleTag = useCallback((tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  }, []);

  return (
    <Dialog
      title="引用の追加"
      visible={visible}
      onClose={onClose}
      testID="quote-form-dialog"
      content={
        <View>
          {/* 引用内容 */}
          <Dialog.Input
            label="引用内容"
            value={content}
            onChangeText={setContent}
            multiline
            placeholder="引用内容を入力"
            testID="content-input"
          />

          {/* ページ番号 */}
          <Dialog.Input
            label="ページ番号"
            value={page}
            onChangeText={setPage}
            keyboardType="number-pad"
            placeholder="ページ番号を入力"
            testID="page-input"
          />

          {/* メモ */}
          <Dialog.Input
            label="メモ"
            value={memo}
            onChangeText={setMemo}
            multiline
            placeholder="メモを入力"
            testID="memo-input"
          />

          {/* タグ選択 */}
          <View style={styles.selectedTags}>
            {selectedTagIds.map(tagId => {
              const tag = availableTags.find(t => t.id === tagId);
              if (!tag) return null;
              return (
                <View
                  key={tag.id}
                  style={styles.tagChip}
                  testID={`selected-tag-${tag.id}`}
                >
                  <Dialog.Message>{tag.name}</Dialog.Message>
                </View>
              );
            })}
          </View>

          {/* タグ選択ボタン */}
          <Dialog.Button
            label="タグを選択"
            onPress={() => setIsTagSelectVisible(true)}
            testID="tag-select"
          />

          {/* タグ選択ダイアログ */}
          <Dialog
            title="タグを選択"
            visible={isTagSelectVisible}
            onClose={() => setIsTagSelectVisible(false)}
            content={
              <View style={styles.tagList}>
                {availableTags.map(tag => (
                  <Dialog.Button
                    key={tag.id}
                    label={tag.name}
                    onPress={() => toggleTag(tag.id)}
                    testID={`tag-${tag.id}`}
                  />
                ))}
              </View>
            }
            actions={
              <Dialog.Button
                label="完了"
                onPress={() => setIsTagSelectVisible(false)}
              />
            }
          />
        </View>
      }
      actions={
        <View style={styles.actions}>
          <Dialog.Button
            label="キャンセル"
            onPress={handleCancel}
            testID="cancel-button"
          />
          <Dialog.Button
            label={initialValues ? '更新' : '追加'}
            onPress={handleSubmit}
            disabled={!isValid}
            testID="submit-button"
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
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  tagChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  tagList: {
    gap: 8,
  },
});
