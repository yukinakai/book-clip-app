import React, { useEffect, useState, useCallback } from "react";
import { View, FlatList, StyleSheet, Image, Text } from "react-native";
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
        <Text style={[styles.author, { color: textColor }]}>{item.author}</Text>
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
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={renderHeader}
        onRefresh={loadBooks}
        refreshing={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 10,
  },
  bookItem: {
    flex: 1,
    margin: 5,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    maxWidth: "50%",
  },
  coverImage: {
    width: 120,
    height: 180,
    borderRadius: 4,
  },
  bookInfo: {
    marginTop: 8,
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  author: {
    fontSize: 12,
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
