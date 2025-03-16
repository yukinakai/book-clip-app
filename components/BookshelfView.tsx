import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Image,
  Text,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Book } from "../constants/MockData";
import { BookStorageService } from "../services/BookStorageService";
import { useThemeColor } from "../hooks/useThemeColor";
import { useRouter } from "expo-router";
import { Colors } from "../constants/Colors";
import { useColorScheme } from "../hooks/useColorScheme";
import NoImagePlaceholder from "./NoImagePlaceholder";

interface BookshelfViewProps {
  onSelectBook?: (book: Book) => void;
  headerTitle?: string;
  refreshTrigger?: number;
}

const BookshelfView: React.FC<BookshelfViewProps> = ({
  onSelectBook,
  headerTitle,
  refreshTrigger = 0,
}) => {
  const [books, setBooks] = useState<Book[]>([]);
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const secondaryBackgroundColor = useThemeColor({}, "secondaryBackground");
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();

  const loadBooks = useCallback(async () => {
    const savedBooks = await BookStorageService.getAllBooks();
    setBooks(savedBooks);
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks, refreshTrigger]);

  const handleBookPress = (book: Book) => {
    if (onSelectBook) {
      onSelectBook(book);
    }

    // 書籍詳細画面へ遷移
    // @ts-ignore - 動的ルーティングの型エラーを無視
    router.push(`/book/${book.id}`);
  };

  const renderItem = ({ item }: { item: Book }) => (
    <TouchableOpacity
      style={[styles.bookItem, { backgroundColor: secondaryBackgroundColor }]}
      onPress={() => handleBookPress(item)}
      testID={`book-item-${item.id}`}
    >
      {item.coverImage === null ? (
        <View style={styles.coverImage}>
          <NoImagePlaceholder
            width={ITEM_WIDTH - ITEM_MARGIN * 4}
            height={(ITEM_WIDTH - ITEM_MARGIN * 4) * COVER_ASPECT_RATIO}
          />
        </View>
      ) : (
        <Image source={{ uri: item.coverImage }} style={styles.coverImage} />
      )}
      <View style={styles.bookInfo}>
        <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text
          style={[styles.author, { color: Colors[colorScheme].tabIconDefault }]}
          numberOfLines={1}
        >
          {item.author}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => {
    if (!headerTitle) return null;

    return (
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          {headerTitle}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={renderHeader}
        onRefresh={loadBooks}
        refreshing={false}
      />
    </View>
  );
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const ITEM_MARGIN = 6;
const ITEM_WIDTH =
  (SCREEN_WIDTH - (COLUMN_COUNT + 1) * ITEM_MARGIN * 2) / COLUMN_COUNT;
const COVER_ASPECT_RATIO = 1.5; // 一般的な本の表紙の縦横比（高さ/幅）

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: ITEM_MARGIN,
  },
  bookItem: {
    margin: ITEM_MARGIN,
    padding: ITEM_MARGIN,
    borderRadius: 8,
    alignItems: "center",
    width: ITEM_WIDTH,
  },
  coverImage: {
    width: ITEM_WIDTH - ITEM_MARGIN * 4,
    height: (ITEM_WIDTH - ITEM_MARGIN * 4) * COVER_ASPECT_RATIO,
    borderRadius: 4,
  },
  bookInfo: {
    marginTop: 4,
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 2,
  },
  author: {
    fontSize: 10,
  },
  headerContainer: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
});

export default BookshelfView;
