import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Book } from "../../constants/MockData";
import { BookStorageService } from "../../services/BookStorageService";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "../../hooks/useThemeColor";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import NoImagePlaceholder from "../../components/NoImagePlaceholder";

export default function BookSelectScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const { fromClip, clipText } = useLocalSearchParams<{
    fromClip: string;
    clipText: string;
  }>();

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const secondaryBackgroundColor = useThemeColor({}, "secondaryBackground");

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const allBooks = await BookStorageService.getAllBooks();
      setBooks(allBooks);
    } catch (error) {
      console.error("Error loading books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSelect = (book: Book) => {
    console.log("選択した書籍:", book.title);

    if (fromClip === "true") {
      // クリップ追加画面に戻る
      router.push({
        pathname: "/book/add-clip",
        params: {
          bookId: book.id,
          bookTitle: book.title,
          ...(clipText ? { clipText } : {}),
        },
      });
    } else {
      // 通常の書籍追加からの遷移
      router.push({
        pathname: "/book/add-clip",
        params: {
          bookId: book.id,
          bookTitle: book.title,
        },
      });
    }
  };

  const renderBookItem = ({ item }: { item: Book }) => (
    <TouchableOpacity
      style={[styles.bookItem, { backgroundColor: secondaryBackgroundColor }]}
      onPress={() => handleBookSelect(item)}
      testID={`book-item-${item.id}`}
    >
      <View style={styles.bookContent}>
        {item.coverImage ? (
          <Image source={{ uri: item.coverImage }} style={styles.coverImage} />
        ) : (
          <View style={styles.coverImage}>
            <NoImagePlaceholder width={60} height={90} />
          </View>
        )}
        <View style={styles.bookInfo}>
          <Text style={[styles.title, { color: textColor }]}>{item.title}</Text>
          <Text style={[styles.author, { color: textColor }]}>
            {item.author}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="back-button"
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            書籍を選択
          </Text>
        </View>
      </View>

      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: textColor }]}>
              書籍が登録されていません
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    position: "relative",
  },
  backButton: {
    marginRight: 10,
    zIndex: 1,
  },
  titleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
  },
  bookItem: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  bookContent: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
  },
  coverImage: {
    width: 60,
    height: 90,
    borderRadius: 4,
    marginRight: 12,
  },
  bookInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    opacity: 0.7,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
  },
});
