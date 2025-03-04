import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookWithQuotes } from '@/types/book';
import { Quote, QuoteFormData } from '@/types/quote';
import { useAuth } from '@/hooks/useAuth';
import { getBook, updateBook } from '@/lib/books';
import { createQuote, updateQuote, deleteQuote } from '@/lib/quotes';
import { Dialog } from '@/components/ui/Dialog';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { ParallaxScrollView } from '@/components/ParallaxScrollView';
import { Tag } from '@/types/tag';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditBookDialogOpen, setIsEditBookDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookWithQuotes | null>(null);

  const queryClient = useQueryClient();

  // 書籍情報の取得
  const {
    data: book,
    isLoading,
    error
  } = useQuery<BookWithQuotes, Error, BookWithQuotes>({
    queryKey: ['book', id],
    queryFn: async () => {
      const data = await getBook(id);
      if (!data) throw new Error('書籍が見つかりませんでした');
      return data as BookWithQuotes;
    }
  });

  // 引用の作成
  const createQuoteMutation = useMutation({
    mutationFn: async (data: QuoteFormData) =>
      createQuote({
        bookId: book!.id,
        content: data.content,
        page: data.page,
        memo: data.memo,
        tags: data.tags?.map(tagId => ({ id: tagId })) as Tag[],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book', id] });
    },
  });

  // 引用の更新
  const updateQuoteMutation = useMutation({
    mutationFn: async ({
      quoteId,
      data,
    }: {
      quoteId: string;
      data: Partial<QuoteFormData>;
    }) => {
      if (!quoteId) throw new Error('引用IDが指定されていません');
      const result = await updateQuote(quoteId, {
        content: data.content,
        page: data.page,
        memo: data.memo,
        tags: data.tags?.map(tagId => ({ id: tagId })) as Tag[],
      });
      if (!result) throw new Error('引用の更新に失敗しました');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book', id] });
      setEditingQuote(null);
    }
  });

  // 引用の削除
  const deleteQuoteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const result = await deleteQuote(quoteId);
      if (!result) throw new Error('引用の削除に失敗しました');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book', id] });
      setIsDeleteDialogOpen(false);
    },
  });

  // 書籍情報の更新
  const updateBookMutation = useMutation({
    mutationFn: async (data: { title?: string; description?: string }) => {
      if (!book?.id) throw new Error('書籍IDが指定されていません');
      const result = await updateBook(book.id, data);
      if (!result) throw new Error('書籍の更新に失敗しました');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book', id] });
      setIsEditBookDialogOpen(false);
      setEditingBook(null);
    },
  });

  if (isLoading || createQuoteMutation.isPending || updateQuoteMutation.isPending || deleteQuoteMutation.isPending || updateBookMutation.isPending) {
    return (
      <ThemedView style={styles.container} testID="loading-indicator">
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.error}>{error.message}</ThemedText>
      </ThemedView>
    );
  }

  if (!book || !user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>書籍が見つかりませんでした</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ParallaxScrollView
      headerImage={book.thumbnailUrl}
      title={book.title}
      subtitle={book.author}
      headerRight={
        <IconSymbol
          name="pencil"
          onPress={() => {
            setEditingBook(book);
            setIsEditBookDialogOpen(true);
          }}
        />
      }
    >
      <ThemedView style={styles.container}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>書籍情報</ThemedText>
          <ThemedText>出版社: {book.publisher}</ThemedText>
          {book.publishedDate && (
            <ThemedText>出版日: {book.publishedDate}</ThemedText>
          )}
          {book.description && (
            <ThemedText style={styles.description}>{book.description}</ThemedText>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>引用一覧</ThemedText>
            <IconSymbol
              name="add"
              onPress={() => {
                setEditingQuote({
                  bookId: book.id,
                  content: '',
                  page: undefined,
                  memo: undefined,
                  tags: [],
                  id: '',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  userId: user.id
                });
              }}
            />
          </View>

          {book.quotes?.map(quote => (
            <ThemedView key={quote.id} style={styles.quoteCard}>
              <ThemedText>{quote.content}</ThemedText>
              {quote.page && <ThemedText>P.{quote.page}</ThemedText>}
              {quote.memo && (
                <ThemedText style={styles.memo}>{quote.memo}</ThemedText>
              )}
              {quote.tags && quote.tags.length > 0 && (
                <View style={styles.tags}>
                  {quote.tags.map(tag => (
                    <ThemedView key={tag.id} style={styles.tag}>
                      <ThemedText>{tag.name}</ThemedText>
                    </ThemedView>
                  ))}
                </View>
              )}
              <View style={styles.quoteActions}>
                <IconSymbol
                  name="pencil"
                  onPress={() => setEditingQuote(quote)}
                />
                <IconSymbol
                  name="trash"
                  onPress={() => {
                    setEditingQuote(quote);
                    setIsDeleteDialogOpen(true);
                  }}
                />
              </View>
            </ThemedView>
          ))}
        </View>
      </ThemedView>

      {/* 引用の編集/作成ダイアログ */}
      <Dialog
        title={editingQuote?.id ? '引用を編集' : '引用を追加'}
        isVisible={!!editingQuote}
        onClose={() => setEditingQuote(null)}
        content={
          <View>
            <Dialog.Input
              label="引用"
              value={editingQuote?.content}
              onChangeText={text =>
                setEditingQuote((prev: Quote | null) => ({
                  ...prev!,
                  content: text,
                }))
              }
              placeholder="引用を入力"
              multiline
            />
            <Dialog.Input
              label="ページ番号"
              value={editingQuote?.page?.toString()}
              onChangeText={text =>
                setEditingQuote((prev: Quote | null) => ({
                  ...prev!,
                  page: text ? parseInt(text, 10) : undefined,
                }))
              }
              placeholder="ページ番号"
              keyboardType="number-pad"
            />
            <Dialog.Input
              label="メモ"
              value={editingQuote?.memo}
              onChangeText={text =>
                setEditingQuote((prev: Quote | null) => ({
                  ...prev!,
                  memo: text,
                }))
              }
              placeholder="メモ"
              multiline
            />
          </View>
        }
        actions={
          <>
            <Dialog.Button
              label="キャンセル"
              onPress={() => setEditingQuote(null)}
            />
            <Dialog.Button
              label={editingQuote?.id ? '更新' : '保存'}
              onPress={() => {
                const quoteData: QuoteFormData = {
                  content: editingQuote!.content,
                  page: editingQuote!.page,
                  memo: editingQuote!.memo,
                  tags: editingQuote!.tags?.map(tag => tag.id),
                };

                if (editingQuote?.id) {
                  updateQuoteMutation.mutate({
                    quoteId: editingQuote.id,
                    data: quoteData,
                  });
                } else if (editingQuote) {
                  createQuoteMutation.mutate(quoteData);
                }
              }}
            />
          </>
        }
      />

      {/* 引用の削除確認ダイアログ */}
      <Dialog
        title="引用の削除"
        isVisible={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        content={
          <ThemedText>この引用を削除してもよろしいですか？</ThemedText>
        }
        actions={
          <>
            <Dialog.Button
              label="キャンセル"
              onPress={() => setIsDeleteDialogOpen(false)}
            />
            <Dialog.Button
              label="削除"
              onPress={() => editingQuote && deleteQuoteMutation.mutate(editingQuote.id)}
              destructive
            />
          </>
        }
      />

      {/* 書籍情報の編集ダイアログ */}
      <Dialog
        title="書籍情報を編集"
        isVisible={isEditBookDialogOpen}
        onClose={() => {
          setIsEditBookDialogOpen(false);
          setEditingBook(null);
        }}
        content={
          <View>
            <Dialog.Input
              label="タイトル"
              value={editingBook?.title}
              onChangeText={text =>
                setEditingBook((prev: BookWithQuotes | null) => ({
                  ...prev!,
                  title: text,
                }))
              }
              placeholder="タイトル"
            />
            <Dialog.Input
              label="説明"
              value={editingBook?.description}
              onChangeText={text =>
                setEditingBook((prev: BookWithQuotes | null) => ({
                  ...prev!,
                  description: text,
                }))
              }
              placeholder="説明"
              multiline
            />
          </View>
        }
        actions={
          <>
            <Dialog.Button
              label="キャンセル"
              onPress={() => {
                setIsEditBookDialogOpen(false);
                setEditingBook(null);
              }}
            />
            <Dialog.Button
              label="更新"
              onPress={() =>
                editingBook &&
                updateBookMutation.mutate({
                  title: editingBook.title,
                  description: editingBook.description,
                })
              }
            />
          </>
        }
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    marginTop: 8,
  },
  quoteCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  memo: {
    fontStyle: 'italic',
    marginTop: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  quoteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  error: {
    color: 'red',
  },
});
