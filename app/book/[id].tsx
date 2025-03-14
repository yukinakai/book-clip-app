import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Book, Clip } from "../../constants/MockData";
import { BookStorageService } from "../../services/BookStorageService";
import { ClipStorageService } from "../../services/ClipStorageService";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "../../hooks/useThemeColor";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const secondaryBackgroundColor = useThemeColor({}, "secondaryBackground");

  // 書籍データとクリップを読み込む
  const loadBookDetailsAndClips = async () => {
    try {
      setLoading(true);

      // 書籍情報を取得
      const books = await BookStorageService.getAllBooks();
      const foundBook = books.find((b) => b.id === id);

      if (foundBook) {
        setBook(foundBook);

        // 書籍に関連するクリップを取得
        const bookClips = await ClipStorageService.getClipsByBookId(id);
        setClips(bookClips);
      }
    } catch (error) {
      console.error("Error loading book details:", error);
    } finally {
      setLoading(false);
    }
  };

  // 画面がフォーカスされるたびにデータを再読み込み
  useFocusEffect(
    useCallback(() => {
      if (id) {
        loadBookDetailsAndClips();
      }
    }, [id])
  );

  const handleAddClip = () => {
    if (book) {
      // Expo Routerの相対パスを使用
      router.push(
        `/book/add-clip?bookId=${id}&bookTitle=${encodeURIComponent(
          book.title
        )}`
      );
    }
  };

  const renderClipItem = ({ item }: { item: Clip }) => (
    <TouchableOpacity
      style={[styles.clipItem, { backgroundColor: secondaryBackgroundColor }]}
      onPress={() => {
        // @ts-ignore - 動的ルーティングの型エラーを無視
        router.push(`/clip/${item.id}`);
      }}
      testID={`clip-item-${item.id}`}
    >
      <View style={styles.clipContent}>
        <Text style={[styles.clipText, { color: textColor }]}>{item.text}</Text>
        <View style={styles.clipInfo}>
          <Text style={[styles.pageInfo, { color: textColor }]}>
            P. {item.page}
          </Text>
          <Text style={[styles.dateInfo, { color: textColor }]}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyClipsList = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: textColor }]}>
        この書籍にはまだクリップがありません
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <Text style={{ color: textColor }}>読み込み中...</Text>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={[styles.errorContainer, { backgroundColor }]}>
        <Text style={{ color: textColor }}>書籍が見つかりませんでした</Text>
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
        <Text style={[styles.headerTitle, { color: textColor }]}>書籍</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.bookInfoContainer}>
          <Image source={{ uri: book.coverImage }} style={styles.coverImage} />
          <View style={styles.bookInfo}>
            <Text style={[styles.title, { color: textColor }]}>
              {book.title}
            </Text>
            <Text style={[styles.author, { color: textColor }]}>
              {book.author}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.clipsSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            クリップ
          </Text>
          <FlatList
            data={clips}
            renderItem={renderClipItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.clipsList}
            scrollEnabled={false}
            ListEmptyComponent={renderEmptyClipsList}
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.addButton,
          { backgroundColor: Colors[colorScheme].primary },
        ]}
        activeOpacity={0.8}
        testID="add-clip-button"
        onPress={handleAddClip}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
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
  errorContainer: {
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
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  scrollContainer: {
    flex: 1,
  },
  bookInfoContainer: {
    flexDirection: "row",
    padding: 20,
    alignItems: "center",
  },
  coverImage: {
    width: 100,
    height: 150,
    borderRadius: 8,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginHorizontal: 20,
  },
  clipsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  clipsList: {
    paddingBottom: 80, // ボタンの高さ分の余白
  },
  clipItem: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  clipContent: {
    padding: 16,
  },
  clipText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  clipInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  pageInfo: {
    fontSize: 14,
    opacity: 0.7,
  },
  dateInfo: {
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
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
