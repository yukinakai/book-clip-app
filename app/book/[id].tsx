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

// グローバル型定義を拡張
declare global {
  var _cachedClips: Clip[];
}

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [bookLoading, setBookLoading] = useState(true);
  const [clipsLoading, setClipsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreClips, setHasMoreClips] = useState(true);
  const [page, setPage] = useState(1);
  const CLIPS_PER_PAGE = 10;

  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const secondaryBackgroundColor = useThemeColor({}, "secondaryBackground");
  const dividerColor = useThemeColor({}, "divider");

  // 書籍データとクリップを読み込む
  const loadBookDetailsAndClips = useCallback(async () => {
    // スコープ外で参照できるようにする
    let startTime = Date.now();
    try {
      console.log("書籍詳細の読み込み開始 - ID:", id);
      setBookLoading(true);
      setClipsLoading(true);

      // 書籍情報とクリップを並行して取得
      const bookPromise = BookStorageService.getBookById(id as string);
      const clipsPromise = ClipStorageService.getClipsByBookId(id as string);

      // Promise.allを使用して並行処理
      const [foundBook, bookClips] = await Promise.all([
        bookPromise,
        clipsPromise,
      ]);

      const bookEndTime = Date.now();
      console.log(
        `書籍情報取得完了 (${bookEndTime - startTime}ms) - 結果:`,
        foundBook
      );

      if (foundBook) {
        setBook(foundBook);
        setBookLoading(false);

        const clipsToShow = bookClips.slice(0, CLIPS_PER_PAGE);
        const hasMore = bookClips.length > CLIPS_PER_PAGE;

        console.log(
          `クリップ取得完了 (${Date.now() - startTime}ms) - 全${
            bookClips.length
          }件中${clipsToShow.length}件表示`
        );
        setClips(clipsToShow);
        setHasMoreClips(hasMore);

        // globalにキャッシュする（React Nativeでは window は使わない）
        global._cachedClips = bookClips;
      } else {
        console.log("書籍が見つかりませんでした - ID:", id);
      }
    } catch (error) {
      console.error("書籍詳細の読み込み中にエラー:", error);
    } finally {
      const endTime = Date.now();
      console.log(
        `書籍詳細の読み込み完了 - 合計時間: ${endTime - startTime}ms`
      );
      // ローディング状態を確実に終了する
      setBookLoading(false);
      setClipsLoading(false);
    }
  }, [id]);

  // さらにクリップを読み込む（無限スクロール用）
  const loadMoreClips = useCallback(() => {
    if (loadingMore || !hasMoreClips) return;

    try {
      setLoadingMore(true);
      // windowではなくglobalを使用
      const cachedClips = global._cachedClips || [];
      const nextPage = page + 1;
      const startIndex = (nextPage - 1) * CLIPS_PER_PAGE;
      const endIndex = nextPage * CLIPS_PER_PAGE;

      // キャッシュから次のページのクリップを取得
      const nextClips = cachedClips.slice(startIndex, endIndex);

      if (nextClips.length > 0) {
        setClips((prev) => [...prev, ...nextClips]);
        setPage(nextPage);
        setHasMoreClips(endIndex < cachedClips.length);
      } else {
        setHasMoreClips(false);
      }
    } catch (error) {
      console.error("追加クリップ読み込みエラー:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMoreClips, page, CLIPS_PER_PAGE]);

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

  // スケルトンローダー用コンポーネント
  const BookDetailSkeleton = () => (
    <View style={styles.bookInfoContainer}>
      <View
        style={[styles.coverImageSkeleton, { backgroundColor: dividerColor }]}
      />
      <View style={styles.bookInfo}>
        <View
          style={[styles.titleSkeleton, { backgroundColor: dividerColor }]}
        />
        <View
          style={[styles.authorSkeleton, { backgroundColor: dividerColor }]}
        />
      </View>
    </View>
  );

  const ClipItemSkeleton = () => (
    <View
      style={[styles.clipItem, { backgroundColor: secondaryBackgroundColor }]}
    >
      <View style={styles.clipContent}>
        <View
          style={[styles.clipTextSkeleton, { backgroundColor: dividerColor }]}
        />
        <View
          style={[
            styles.clipTextSkeleton,
            { width: "70%", backgroundColor: dividerColor },
          ]}
        />
        <View style={styles.clipInfo}>
          <View
            style={[styles.pageInfoSkeleton, { backgroundColor: dividerColor }]}
          />
          <View
            style={[styles.dateInfoSkeleton, { backgroundColor: dividerColor }]}
          />
        </View>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.loadingMoreContainer}>
        <Text style={{ color: textColor }}>さらに読み込み中...</Text>
      </View>
    );
  };

  const handleEndReached = () => {
    if (!loadingMore && hasMoreClips) {
      loadMoreClips();
    }
  };

  if (!bookLoading && !book) {
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
            {bookLoading ? (
              <BookDetailSkeleton />
            ) : (
              <View style={styles.bookInfoContainer}>
                {book?.coverImage ? (
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
                    {book?.title}
                  </Text>
                  <Text style={[styles.author, { color: textColor }]}>
                    {book?.author}
                  </Text>
                </View>
              </View>
            )}

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            <View style={styles.clipsSection}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                クリップ {clipsLoading ? "" : `(${clips.length}件)`}
              </Text>
            </View>

            {clipsLoading && (
              <>
                <ClipItemSkeleton />
                <ClipItemSkeleton />
                <ClipItemSkeleton />
              </>
            )}
          </>
        )}
        ListEmptyComponent={!clipsLoading ? renderEmptyClipsList : null}
        ListFooterComponent={renderFooter}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
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
  coverImageSkeleton: {
    width: 100,
    height: 150,
    borderRadius: 8,
    opacity: 0.3,
  },
  titleSkeleton: {
    height: 24,
    borderRadius: 4,
    marginBottom: 8,
    width: "90%",
    opacity: 0.3,
  },
  authorSkeleton: {
    height: 18,
    borderRadius: 4,
    width: "60%",
    opacity: 0.3,
  },
  clipTextSkeleton: {
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
    width: "100%",
    opacity: 0.3,
  },
  pageInfoSkeleton: {
    height: 14,
    width: 40,
    borderRadius: 4,
    opacity: 0.3,
  },
  dateInfoSkeleton: {
    height: 14,
    width: 80,
    borderRadius: 4,
    opacity: 0.3,
  },
  loadingMoreContainer: {
    padding: 16,
    alignItems: "center",
  },
});
