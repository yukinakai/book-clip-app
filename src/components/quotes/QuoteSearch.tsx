import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import { Quote } from '@/types/quote';
import { searchQuotes } from '@/lib/quotes';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { Dialog } from '@/components/ui/Dialog';
import { TagList } from '@/components/tags/TagList';
import { Tag } from '@/types/tag';

import { getAllTags } from '@/lib/tags';

const ITEMS_PER_PAGE = 20;

// タグデータを取得するクエリキー
const TAGS_QUERY_KEY = ['tags'] as const;

export const QuoteSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [offset, setOffset] = useState(0);
  const [isTagFilterVisible, setIsTagFilterVisible] = useState(false);

  const { data: tags = [] } = useQuery({
    queryKey: TAGS_QUERY_KEY,
    queryFn: getAllTags,
  });

  const { data: quotes, isLoading, error } = useQuery<Quote[]>({
    queryKey: ['quotes', searchQuery, selectedTags, offset],
    queryFn: () =>
      searchQuotes({
        query: searchQuery,
        tagIds: selectedTags,
        limit: ITEMS_PER_PAGE,
        offset,
        orderBy: 'createdAt',
        ascending: false,
      }),
  });

  // 検索処理のデバウンス
  const debouncedSearch = useCallback(
    debounce((text: string) => {
      setSearchQuery(text);
      setOffset(0);
    }, 300),
    []
  );

  // スクロール処理
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isEndReached =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

    if (isEndReached && !isLoading && quotes?.length === ITEMS_PER_PAGE) {
      setOffset(prev => prev + ITEMS_PER_PAGE);
    }
  };

  // タグ選択時の処理
  const handleTagSelect = (tag: Tag) => {
    setSelectedTags(prev =>
      prev.includes(tag.id)
        ? prev.filter(id => id !== tag.id)
        : [...prev, tag.id]
    );
    setOffset(0);
  };

  // 引用アイテムのレンダリング
  const renderQuoteItem = ({ item }: { item: Quote }) => (
    <ThemedView style={styles.quoteCard} testID={`quote-item-${item.id}`}>
      <ThemedText>{item.content}</ThemedText>
      {item.page && <ThemedText>P.{item.page}</ThemedText>}
      {item.memo && (
        <ThemedText style={styles.memo}>{item.memo}</ThemedText>
      )}
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tags}>
          {item.tags.map(tag => (
            <ThemedView key={tag.id} style={styles.tag}>
              <ThemedText>{tag.name}</ThemedText>
            </ThemedView>
          ))}
        </View>
      )}
    </ThemedView>
  );

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.error} testID="error-message">
          エラーが発生しました: {error.message}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="引用を検索..."
          onChangeText={debouncedSearch}
          testID="quote-search-input"
        />
        <Dialog.Button
          label="タグで絞り込む"
          onPress={() => setIsTagFilterVisible(true)}
          testID="tag-filter"
        />
      </View>

      {isLoading && offset === 0 ? (
        <ActivityIndicator size="large" testID="loading-indicator" />
      ) : (
        <FlatList
          data={quotes}
          renderItem={renderQuoteItem}
          keyExtractor={item => item.id}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.list}
          testID="quote-list"
          ListFooterComponent={
            isLoading ? <ActivityIndicator size="small" /> : null
          }
        />
      )}

      <Dialog
        visible={isTagFilterVisible}
        onClose={() => setIsTagFilterVisible(false)}
        title="タグで絞り込む"
      >
        <TagList
          tags={tags}
          selectedTags={selectedTags}
          onTagPress={handleTagSelect}
          showActions={false}
        />
      </Dialog>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  list: {
    flex: 1,
  },
  quoteCard: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
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
  error: {
    color: 'red',
    padding: 16,
  },
});
