import React, { useEffect, useState } from "react";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { Book, Clip, MOCK_CLIPS } from "../../constants/MockData";
import { BookStorageService } from "../../services/BookStorageService";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "../../hooks/useThemeColor";

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const secondaryBackgroundColor = useThemeColor({}, "secondaryBackground");

  useEffect(() => {
    const loadBookDetails = async () => {
      try {
        setLoading(true);

        // 書籍情報を取得
        const books = await BookStorageService.getAllBooks();
        const foundBook = books.find((b) => b.id === id);

        if (foundBook) {
          setBook(foundBook);

          // 【一時的な修正】: 本来は特定の書籍のクリップだけをフィルタリングするが、
          // テスト目的ですべてのクリップを表示する
          // const bookClips = MOCK_CLIPS.filter((clip) => clip.bookId === id);
          const bookClips = MOCK_CLIPS; // すべてのクリップを表示
          setClips(bookClips);
        }
      } catch (error) {
        console.error("Error loading book details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadBookDetails();
    }
  }, [id]);

  const renderClipItem = ({ item }: { item: Clip }) => (
    <View
      style={[styles.clipItem, { backgroundColor: secondaryBackgroundColor }]}
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
    </View>
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
        <Text style={[styles.headerTitle, { color: textColor }]}>マイライブラリ</Text>
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
        style={styles.addButton}
        activeOpacity={0.8}
        testID="add-clip-button"
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
    backgroundColor: "#FF4757",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
