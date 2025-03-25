import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  ActionSheetIOS,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Book, Clip } from "../../constants/MockData";
import { BookStorageService } from "../../services/BookStorageService";
import { ClipStorageService } from "../../services/ClipStorageService";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "../../hooks/useThemeColor";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import NoImagePlaceholder from "../../components/NoImagePlaceholder";

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
  const dividerColor = useThemeColor({}, "divider");

  // 書籍データとクリップを読み込む
  const loadBookDetailsAndClips = useCallback(async () => {
    try {
      console.log("書籍詳細の読み込み開始 - ID:", id);
      setLoading(true);

      // 最適化: 全書籍を取得するのではなく、IDで書籍を直接取得
      let foundBook: Book | null = null;

      try {
        // 単一の書籍データを取得する高速パスを試みる
        foundBook = await BookStorageService.getBookById(id as string);
        console.log("書籍取得結果:", foundBook);
      } catch (err) {
        console.warn("高速パスでの書籍取得に失敗、全書籍から検索します:", err);
        // 古い方法: 全書籍を取得してフィルタリング
        const books = await BookStorageService.getAllBooks();
        console.log("取得した全書籍:", books.length, "件");
        foundBook = books.find((b) => b.id === id) || null;
      }

      console.log("検索された書籍:", foundBook);

      if (foundBook) {
        setBook(foundBook);

        // 書籍に関連するクリップを取得
        const bookClips = await ClipStorageService.getClipsByBookId(
          id as string
        );
        console.log("関連するクリップ:", bookClips.length, "件");
        setClips(bookClips);
      } else {
        console.log("書籍が見つかりませんでした - ID:", id);
      }
    } catch (error) {
      console.error("Error loading book details:", error);
    } finally {
      console.log("書籍詳細の読み込み完了");
      setLoading(false);
    }
  }, [id, setLoading, setBook, setClips]);

  // 画面がフォーカスされるたびにデータを再読み込み
  useFocusEffect(
    useCallback(() => {
      if (id) {
        loadBookDetailsAndClips();
      }
    }, [id, loadBookDetailsAndClips])
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

  // オプションメニューを表示
  const showOptions = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["キャンセル", "編集", "削除"],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
          userInterfaceStyle: colorScheme,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleEditBook();
          } else if (buttonIndex === 2) {
            confirmDeleteBook();
          }
        }
      );
    } else {
      // Androidの場合はAlertでメニューを表示
      Alert.alert("書籍オプション", "選択してください", [
        { text: "キャンセル", style: "cancel" },
        { text: "編集", onPress: handleEditBook },
        { text: "削除", onPress: confirmDeleteBook, style: "destructive" },
      ]);
    }
  };

  // 書籍編集画面に遷移
  const handleEditBook = () => {
    if (book) {
      router.push(
        `/book/edit?id=${id}&title=${encodeURIComponent(
          book.title
        )}&author=${encodeURIComponent(
          book.author || ""
        )}&coverImage=${encodeURIComponent(book.coverImage || "")}`
      );
    }
  };

  // 書籍削除の確認ダイアログを表示
  const confirmDeleteBook = () => {
    Alert.alert(
      "書籍を削除しますか？",
      "この書籍に関連するすべてのクリップも削除されます。この操作は元に戻せません。",
      [
        { text: "キャンセル", style: "cancel" },
        { text: "削除", onPress: handleDeleteBook, style: "destructive" },
      ]
    );
  };

  // 書籍を削除
  const handleDeleteBook = async () => {
    try {
      if (id) {
        // 関連するクリップをすべて削除
        await ClipStorageService.deleteClipsByBookId(id);

        // 書籍を削除
        await BookStorageService.deleteBook(id);

        // ホーム画面に戻る
        router.replace("/");
      }
    } catch (error) {
      console.error("Error deleting book:", error);
      Alert.alert("エラー", "書籍の削除中にエラーが発生しました。");
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
            {item.createdAt
              ? new Date(item.createdAt).toLocaleDateString()
              : ""}
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
      <View style={[styles.header, { borderBottomColor: dividerColor }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="back-button"
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            書籍の詳細
          </Text>
        </View>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={showOptions}
          testID="options-button"
        >
          <Ionicons name="ellipsis-horizontal" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={clips}
        renderItem={renderClipItem}
        keyExtractor={(item: Clip) => item.id || `clip-${Date.now()}`}
        contentContainerStyle={styles.clipsList}
        ListHeaderComponent={() => (
          <>
            <View style={styles.bookInfoContainer}>
              {book.coverImage ? (
                <Image
                  source={{ uri: book.coverImage }}
                  style={styles.coverImage}
                />
              ) : (
                <View style={styles.coverImage}>
                  <NoImagePlaceholder width={100} height={150} />
                </View>
              )}
              <View style={styles.bookInfo}>
                <Text style={[styles.title, { color: textColor }]}>
                  {book.title}
                </Text>
                <Text style={[styles.author, { color: textColor }]}>
                  {book.author}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            <View style={styles.clipsSection}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                クリップ
              </Text>
            </View>
          </>
        )}
        ListEmptyComponent={renderEmptyClipsList}
      />

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
  headerButton: {
    marginLeft: 16,
    position: "absolute",
    right: 16,
  },
});
