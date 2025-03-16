// app/(tabs)/index.tsx
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Pressable,
  View,
  Alert,
  Text,
  SafeAreaView,
} from "react-native";
import { Book } from "../../constants/MockData";
import { Colors } from "../../constants/Colors";
import BookshelfView from "../../components/BookshelfView";
import { Ionicons } from "@expo/vector-icons";
import CameraModal from "../../components/camera/CameraModal";
import { useColorScheme } from "../../hooks/useColorScheme";

export default function HomeScreen() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const colorScheme = useColorScheme() ?? "light";
  const [isOpeningCamera, setIsOpeningCamera] = useState(false);

  // タイマー参照を保持
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // クリーンアップ
  useEffect(() => {
    return () => {
      // コンポーネントのアンマウント時にタイマーをクリア
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // モーダルの状態をログに出力
  useEffect(() => {
    console.log("CameraModal状態:", isCameraOpen ? "表示" : "非表示");
  }, [isCameraOpen]);

  const handleBookSelect = (book: Book) => {
    console.log("Selected book:", book.title);
  };

  const handleBookAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleImageCaptured = (imageUri: string) => {
    console.log("画像が選択されました:", imageUri);
    Alert.alert(
      "画像キャプチャ",
      "写真の処理が完了しました。この後、OCRやバーコードスキャンなどの処理を追加できます。"
    );
  };

  const handleOpenCamera = () => {
    console.log("handleOpenCameraが呼ばれました");

    // 既存のタイマーがあればクリア
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // 既に処理中なら何もしない（連続タップ防止）
    if (isOpeningCamera) {
      console.log("処理中のため無視します");
      return;
    }

    console.log("カメラを開こうとしています");
    setIsOpeningCamera(true);

    // 即時実行
    setIsCameraOpen(true);
    console.log("isCameraOpen設定後:", true);

    // 処理完了フラグをリセット (500ms後)
    timerRef.current = setTimeout(() => {
      setIsOpeningCamera(false);
      timerRef.current = null;
    }, 500);
  };

  const handleClose = () => {
    console.log("カメラを閉じます");

    // 既存のタイマーがあればクリア
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // 遅延をかけずに即座に閉じる
    setIsCameraOpen(false);
    // 書籍が追加された場合のリフレッシュ処理
    handleBookAdded();

    // この後500msは操作を受け付けない状態にする
    setIsOpeningCamera(true);
    timerRef.current = setTimeout(() => {
      setIsOpeningCamera(false);
      timerRef.current = null;
    }, 500);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <View
        style={[
          styles.headerContainer,
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
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            {
              backgroundColor: Colors[colorScheme].primary,
              opacity: pressed ? 0.7 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
          onPress={handleOpenCamera}
          onPressIn={() => console.log("Press In Event")}
          android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: false }}
          testID="add-book-button"
          hitSlop={20}
        >
          <Ionicons name="book-outline" size={18} color="white" />
          <Text style={styles.buttonText}>書籍を追加</Text>
        </Pressable>
      </View>

      <View style={styles.bookshelfContainer}>
        <BookshelfView
          onSelectBook={handleBookSelect}
          headerTitle=""
          refreshTrigger={refreshTrigger}
        />
      </View>

      <CameraModal
        isVisible={isCameraOpen}
        onClose={handleClose}
        onImageCaptured={handleImageCaptured}
        key={`camera-modal-${isCameraOpen}`}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E0D1", // Vintage Beige
    position: "relative",
  },
  titleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  bookshelfContainer: {
    flex: 1,
    width: "100%",
    marginTop: 0, // ヘッダーとコンテンツの間のスペースを削除
  },
  addButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    minWidth: 110,
    minHeight: 36,
    zIndex: 10,
    marginRight: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
});
