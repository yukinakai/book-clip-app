// app/(tabs)/index.tsx
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Book } from "../../constants/MockData";
import { Colors } from "../../constants/Colors";
import BookshelfView from "../../components/BookshelfView";
import { Ionicons } from "@expo/vector-icons";
import CameraModal from "../../components/camera/CameraModal";
import CameraView from "../../components/CameraView";
import { useColorScheme } from "../../hooks/useColorScheme";
import { useRouter } from "expo-router";
import { BookStorageService } from "../../services/BookStorageService";

export default function HomeScreen() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isOcrCameraOpen, setIsOcrCameraOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const [bookCount, setBookCount] = useState(0);

  // 書籍の件数を取得
  useEffect(() => {
    const fetchBookCount = async () => {
      try {
        const books = await BookStorageService.getAllBooks();
        setBookCount(books.length);
      } catch (error) {
        console.error("Error fetching book count:", error);
      }
    };

    fetchBookCount();
  }, [refreshTrigger]);

  // モーダルの状態をログに出力
  useEffect(() => {
    console.log("CameraModal状態:", isCameraOpen ? "表示" : "非表示");
    console.log("CameraModal描画: isVisible=", isCameraOpen);
  }, [isCameraOpen]);

  const handleBookSelect = (book: Book) => {
    console.log("Selected book:", book.title);
  };

  const handleBookAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // 書籍追加カメラでの画像キャプチャ処理
  const handleImageCaptured = (imageUri: string) => {
    console.log("画像が選択されました:", imageUri);
    // クリップ登録画面に遷移
    router.push(`/book/add-clip?imageUri=${encodeURIComponent(imageUri)}`);
  };

  // OCRカメラでの画像キャプチャ処理
  const handleOcrImageCaptured = (imageUri: string) => {
    console.log("OCR用画像が選択されました:", imageUri);
    // クリップ登録画面に遷移（OCR処理用として）
    router.push(
      `/book/add-clip?imageUri=${encodeURIComponent(imageUri)}&isOcr=true`
    );
    setIsOcrCameraOpen(false);
  };

  // OCRカメラを閉じる
  const handleOcrCameraClose = () => {
    setIsOcrCameraOpen(false);
  };

  const handleOpenCamera = () => {
    console.log("カメラを開きます");
    setIsCameraOpen(true);
  };

  const handleClose = () => {
    console.log("カメラを閉じます");
    setIsCameraOpen(false);
    // 書籍が追加された場合のリフレッシュ処理
    handleBookAdded();
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      {/* ヘッダー部分 - 固定表示 */}
      <View
        style={[
          styles.header,
          { backgroundColor: Colors[colorScheme].background },
        ]}
      >
        <View style={styles.titleContainer}>
          <Text
            style={[styles.headerTitle, { color: Colors[colorScheme].text }]}
          >
            マイライブラリ
          </Text>
        </View>
      </View>

      {/* スクロール可能な領域 - メニューバーとブックシェルフを含む */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* メニューバー - 件数表示と書籍追加ボタン */}
        <View style={styles.menuBar}>
          <View style={styles.bookCountContainer}>
            <Text
              style={[
                styles.bookCountText,
                { color: Colors[colorScheme].text },
              ]}
            >
              {bookCount}冊の書籍
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.addBookButton,
              { backgroundColor: Colors[colorScheme].primary },
            ]}
            onPress={handleOpenCamera}
            activeOpacity={0.7}
            testID="add-book-button"
          >
            <Ionicons name="book-outline" size={16} color="white" />
            <Text style={styles.buttonText}>書籍を追加</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bookshelfContainer}>
          <BookshelfView
            onSelectBook={handleBookSelect}
            headerTitle=""
            refreshTrigger={refreshTrigger}
          />
        </View>
      </ScrollView>

      {/* 書籍追加用カメラモーダル */}
      <CameraModal
        isVisible={isCameraOpen}
        onClose={handleClose}
        onImageCaptured={handleImageCaptured}
        key={`camera-modal-${isCameraOpen}`}
      />

      {/* OCR用カメラモーダル */}
      {isOcrCameraOpen && (
        <Modal
          visible={true}
          animationType="slide"
          onRequestClose={handleOcrCameraClose}
        >
          <CameraView
            onCapture={handleOcrImageCaptured}
            onClose={handleOcrCameraClose}
          />
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    position: "relative",
    height: 56, // ヘッダーの高さを固定
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  scrollContainer: {
    flex: 1,
    width: "100%",
  },
  menuBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bookCountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  bookCountText: {
    fontSize: 14,
    fontWeight: "500",
  },
  addBookButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  bookshelfContainer: {
    flex: 1,
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  loginPromptContainer: {
    margin: 12,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  loginPromptText: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
  loginButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: "center",
  },
  loginButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});
