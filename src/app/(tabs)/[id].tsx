import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { BookWithQuotes, Quote } from '@/types/book';
import { useAuth } from '@/hooks/useAuth';
import { getBook, updateBook } from '@/lib/books';
import { createQuote, updateQuote, deleteQuote } from '@/lib/quotes';
import { Dialog } from '@/components/ui/Dialog';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ParallaxScrollView } from '@/components/ParallaxScrollView';
import { Tag } from '@/types/tag';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [book, setBook] = useState<BookWithQuotes | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditBookDialogOpen, setIsEditBookDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(book);

  // 書籍データの取得
  useEffect(() => {
    const fetchBook = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getBook(id);
        setBook(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '書籍の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  // 引用の追加
  const handleCreateQuote = async (data: { content: string; page?: number; memo?: string; tags?: string[] }) => {
    if (!user || !book) return;

    try {
      setIsLoading(true);
      setError(null);

      const newQuote = await createQuote({
        bookId: book.id,
        content: data.content,
        page: data.page,
        memo: data.memo,
        tags: data.tags?.map(tagId => ({ id: tagId })) as Tag[],
      });

      // 成功した場合、書籍の引用リストを更新
      setBook(prev => {
        if (!prev) return null;
        return {
          ...prev,
          quotes: [newQuote, ...(prev.quotes || [])],
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '引用の追加に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 引用の更新
  const handleUpdateQuote = async (quoteId: string, data: { content?: string; page?: number; memo?: string; tags?: string[] }) => {
    if (!user || !book) return;

    try {
      setIsLoading(true);
      setError(null);

      const updatedQuote = await updateQuote(quoteId, {
        content: data.content,
        page: data.page,
        memo: data.memo,
        tags: data.tags?.map(tagId => ({ id: tagId })) as Tag[],
      });

      // 成功した場合、書籍の引用リストを更新
      setBook(prev => {
        if (!prev) return null;
        return {
          ...prev,
          quotes: prev.quotes?.map(q => (q.id === quoteId ? updatedQuote : q)),
        };
      });

      setEditingQuote(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '引用の更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 引用の削除
  const handleDeleteQuote = async (quoteId: string) => {
    if (!user || !book) return;

    try {
      setIsLoading(true);
      setError(null);
      const result = await deleteQuote(quoteId);

      if (result) {
        // 成功した場合、書籍の引用リストから削除
        setBook(prev => {
          if (!prev) return null;
          return {
            ...prev,
            quotes: prev.quotes?.filter(q => q.id !== quoteId),
          };
        });
      }

      setIsDeleteDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '引用の削除に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 書籍情報の更新
  const handleUpdateBook = async (data: { title?: string; description?: string }) => {
    if (!user || !book) return;

    try {
      setIsLoading(true);
      setError(null);

      const updatedBook = await updateBook(book.id, data);
      setBook(updatedBook);
      setIsEditBookDialogOpen(false);
      setEditingBook(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '書籍の更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>読み込み中...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.error}>{error}</ThemedText>
      </ThemedView>
    );
  }

  if (!book) {
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
                setEditingQuote({ bookId: book.id } as Quote);
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
                setEditingQuote(prev => ({
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
                setEditingQuote(prev => ({
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
                setEditingQuote(prev => ({
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
                if (editingQuote?.id) {
                  handleUpdateQuote(editingQuote.id, editingQuote);
                } else if (editingQuote) {
                  handleCreateQuote(editingQuote);
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
              onPress={() => editingQuote && handleDeleteQuote(editingQuote.id)}
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
                setEditingBook(prev => ({
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
                setEditingBook(prev => ({
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
                handleUpdateBook({
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
