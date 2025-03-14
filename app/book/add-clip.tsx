import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
  Modal,
  ScrollView,
  Keyboard,
  KeyboardEvent,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter, Router } from "expo-router";
import { ClipStorageService } from "../../services/ClipStorageService";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "../../hooks/useThemeColor";
import CameraView from "../../components/CameraView";
import OCRResultView from "../../components/OCRResultView";
import ImageSelectionView, {
  SelectionArea,
} from "../../components/ImageSelectionView";

// ルーターシムを作成する関数の型定義
interface RouterShim {
  back: () => void;
}

// モーダル内でのルーターコンテキスト問題を回避するため、
// router.back()の代わりに使用するカスタム関数
const createRouterShim = (router: Router): RouterShim => ({
  back: () => {
    try {
      if (router && typeof router.back === "function") {
        router.back();
      } else {
        console.warn("Router not available, using fallback navigation");
      }
    } catch (error) {
      console.warn("Error navigating back:", error);
    }
  },
});

export default function AddClipScreen() {
  const { bookId, bookTitle } = useLocalSearchParams<{
    bookId: string;
    bookTitle: string;
  }>();
  const [clipText, setClipText] = useState("");
  const [pageNumber, setPageNumber] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [showOCRResult, setShowOCRResult] = useState(false);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [showImageSelection, setShowImageSelection] = useState(false);
  const [selectedArea, setSelectedArea] = useState<SelectionArea | undefined>(
    undefined
  );
  const router = useRouter();
  const routerShim = createRouterShim(router);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const secondaryBackgroundColor = useThemeColor({}, "secondaryBackground");

  // キーボードの表示を監視
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e: KeyboardEvent) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // キーボードを閉じる関数
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleSaveClip = async () => {
    if (!clipText.trim()) {
      Alert.alert("エラー", "クリップするテキストを入力してください");
      return;
    }

    // ページ番号が空または数値でない場合の処理
    const page = pageNumber.trim() ? parseInt(pageNumber, 10) : 0;
    if (isNaN(page)) {
      Alert.alert("エラー", "ページ番号は数値で入力してください");
      return;
    }

    try {
      await ClipStorageService.saveClip({
        id: Date.now().toString(),
        bookId: bookId as string,
        text: clipText.trim(),
        page,
        createdAt: new Date().toISOString(),
      });

      // 保存成功したら前の画面に戻る
      router.back();
    } catch (error) {
      console.error("Failed to save clip:", error);
      Alert.alert("エラー", "クリップの保存に失敗しました");
    }
  };

  // カメラ撮影画面を表示
  const handleShowCamera = () => {
    setShowCamera(true);
  };

  // カメラ撮影後の処理
  const handleCapture = (imageUri: string) => {
    setCapturedImageUri(imageUri);
    setShowCamera(false);
    // 画像選択画面を表示
    setShowImageSelection(true);
  };

  // カメラキャンセル
  const handleCameraClose = () => {
    setShowCamera(false);
  };

  // 画像選択後の処理
  const handleSelectionConfirm = async (selectionArea: SelectionArea) => {
    if (!capturedImageUri) return;

    // 選択領域を保存
    setSelectedArea(selectionArea);

    setShowImageSelection(false);
    setShowOCRResult(true); // OCR結果画面を表示
  };

  // 画像選択キャンセル
  const handleSelectionCancel = () => {
    setShowImageSelection(false);
    setCapturedImageUri(null);
  };

  // OCR結果から取得したテキストを設定
  const handleConfirmOCRText = (text: string) => {
    setClipText(text);
    setShowOCRResult(false);
  };

  // OCR結果画面を閉じる
  const handleCancelOCR = () => {
    setShowOCRResult(false);
  };

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
        <Text style={[styles.headerTitle, { color: textColor }]}>
          クリップを追加
        </Text>
      </View>

      <ScrollView
        style={[styles.scrollView, { backgroundColor }]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 100 : 100 },
        ]}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.form}>
          <Text style={[styles.bookTitle, { color: textColor }]}>
            {bookTitle || "書籍タイトル"}
          </Text>

          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Text style={[styles.label, { color: textColor }]}>
                クリップするテキスト
              </Text>
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={handleShowCamera}
                testID="camera-button"
              >
                <Ionicons name="camera" size={24} color="#FF4757" />
                <Text style={styles.cameraButtonText}>写真から追加</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: textColor,
                  backgroundColor: secondaryBackgroundColor,
                },
              ]}
              placeholder="印象に残った文章をクリップしましょう"
              placeholderTextColor="gray"
              multiline
              value={clipText}
              onChangeText={setClipText}
              testID="clip-text-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: textColor }]}>ページ番号</Text>
            <TextInput
              style={[
                styles.pageInput,
                {
                  color: textColor,
                  backgroundColor: secondaryBackgroundColor,
                },
              ]}
              placeholder="例: 42"
              placeholderTextColor="gray"
              keyboardType="number-pad"
              value={pageNumber}
              onChangeText={setPageNumber}
              testID="page-number-input"
            />
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveClip}
            activeOpacity={0.8}
            testID="save-clip-button"
          >
            <Text style={styles.saveButtonText}>保存する</Text>
          </TouchableOpacity>

          {/* 追加の余白 */}
          <View style={{ height: 80 }} />
        </View>
      </ScrollView>

      {/* カメラモーダル */}
      {showCamera && (
        <Modal
          visible={true}
          animationType="slide"
          onRequestClose={handleCameraClose}
        >
          <CameraView
            onCapture={handleCapture}
            onClose={handleCameraClose}
            router={routerShim}
          />
        </Modal>
      )}

      {/* 画像選択モーダル（新規追加） */}
      {showImageSelection && capturedImageUri && (
        <Modal
          visible={true}
          animationType="slide"
          onRequestClose={handleSelectionCancel}
        >
          <ImageSelectionView
            imageUri={capturedImageUri}
            onConfirm={handleSelectionConfirm}
            onCancel={handleSelectionCancel}
            router={routerShim}
          />
        </Modal>
      )}

      {/* OCR結果モーダル */}
      {showOCRResult && capturedImageUri && (
        <Modal
          visible={true}
          animationType="slide"
          onRequestClose={handleCancelOCR}
        >
          <OCRResultView
            imageUri={capturedImageUri}
            selectionArea={selectedArea}
            onConfirm={handleConfirmOCRText}
            onCancel={handleCancelOCR}
            router={routerShim}
          />
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  form: {
    padding: 20,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  cameraButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  cameraButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#FF4757",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: "top",
  },
  pageInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 50,
  },
  saveButton: {
    backgroundColor: "#FF4757",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
