import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Book } from '@/types/book';
import { FontAwesome } from '@expo/vector-icons';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';

const COLUMN_COUNT = 3;
const GRID_SPACING = 10;
const ASPECT_RATIO = 1.5; // 一般的な本の縦横比

const getItemDimensions = (width: number) => {
  const itemWidth = (width - GRID_SPACING * (COLUMN_COUNT + 1)) / COLUMN_COUNT;
  const itemHeight = itemWidth * ASPECT_RATIO;
  return { itemWidth, itemHeight };
};

interface BookListProps {
  books: Book[];
  onBookPress: (book: Book) => void;
  onDeletePress: (id: string) => void;
  onAddPress: () => void;
}

export const BookList: React.FC<BookListProps> = ({
  books,
  onBookPress,
  onDeletePress,
  onAddPress,
}) => {
  // コンポーネント内で useWindowDimensions を呼び出して動的に幅を取得
  const { width } = useWindowDimensions();
  const { itemWidth, itemHeight } = getItemDimensions(width);

  const renderItem = ({ item }: { item: Book }) => (
    <TouchableOpacity
      style={[
        styles.bookItem,
        { width: itemWidth, marginHorizontal: GRID_SPACING / 2, marginBottom: GRID_SPACING },
      ]}
      onPress={() => onBookPress(item)}
      accessibilityRole="button"
      accessibilityLabel={item.title}
      testID={`book-item-${item.id}`}
    >
      <View style={styles.bookContainer}>
        <Image
          source={
            item.thumbnailUrl
              ? { uri: item.thumbnailUrl }
              : require('@/assets/images/book-placeholder.png')
          }
          style={[styles.bookCover, { width: itemWidth, height: itemHeight }]}
          resizeMode="cover"
          testID={`book-cover-${item.id}`}
        />
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDeletePress(item.id)}
          accessibilityRole="button"
          accessibilityLabel="削除"
          testID={`delete-button-${item.id}`}
        >
          <FontAwesome name="times-circle" size={24} color="red" />
        </TouchableOpacity>
      </View>
      <Text style={styles.bookTitle} numberOfLines={2} testID={`book-title-${item.id}`}>
        {item.title}
      </Text>
      <Text style={styles.bookAuthor} numberOfLines={1} testID={`book-author-${item.id}`}>
        {item.author}
      </Text>
    </TouchableOpacity>
  );

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText} testID="empty-message">
        登録されている書籍はありません
      </Text>
    </View>
  );

  return (
    <View style={styles.container} testID="book-list">
      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={EmptyComponent}
        testID="book-flatlist"
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={onAddPress}
        accessibilityRole="button"
        accessibilityLabel="追加"
        testID="add-button"
      >
        <FontAwesome name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  listContent: {
    padding: GRID_SPACING,
    paddingBottom: 80, // FABの下にスペースを確保
  },
  bookItem: {
    // 幅は動的に指定するため、ここでは空オブジェクトにしておく
  },
  bookContainer: {
    position: 'relative',
  },
  bookCover: {
    // 幅と高さは動的に指定するため、ここでは borderRadius や backgroundColor のみ設定
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 0,
  },
  bookTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 10,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
