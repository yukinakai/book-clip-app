import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Image,
  Text,
  Dimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Book } from "../constants/MockData";
import { BookStorageService } from "../services/BookStorageService";
import { useThemeColor } from "../hooks/useThemeColor";

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

  const loadBooks = useCallback(async () => {
    const savedBooks = await BookStorageService.getAllBooks();
    setBooks(savedBooks);
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks, refreshTrigger]);

  const renderItem = ({ item }: { item: Book }) => (
    <View
      style={[styles.bookItem, { backgroundColor: secondaryBackgroundColor }]}
    >
      <Image source={{ uri: item.coverImage }} style={styles.coverImage} />
      <View style={styles.bookInfo}>
        <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.author, { color: textColor }]} numberOfLines={1}>
          {item.author}
        </Text>
      </View>
    </View>
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
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={["top"]}
    >
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
    </SafeAreaView>
  );
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const ITEM_MARGIN = 4;
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
    opacity: 0.7,
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
