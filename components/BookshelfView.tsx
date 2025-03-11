import React, { useEffect, useState } from "react";
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
}

const BookshelfView: React.FC<BookshelfViewProps> = ({
  onSelectBook,
  headerTitle,
}) => {
  const [books, setBooks] = useState<Book[]>([]);
  const backgroundColor = useThemeColor({}, "background");

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    const savedBooks = await BookStorageService.getAllBooks();
    setBooks(savedBooks);
  };

  const renderItem = ({ item }: { item: Book }) => (
    <View style={styles.bookItem}>
      <Image source={{ uri: item.coverImage }} style={styles.coverImage} />
      <View style={styles.bookInfo}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.author}>{item.author}</Text>
      </View>
    </View>
  );

  const renderHeader = () => {
    if (!headerTitle) return null;

    return (
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
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
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContainer: {
    padding: 10,
  },
  bookItem: {
    flex: 1,
    margin: 5,
    padding: 10,
    backgroundColor: "#f8f8f8",
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
    color: "#666",
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
