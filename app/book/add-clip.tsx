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
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ClipStorageService } from "../../services/ClipStorageService";
import { BookStorageService } from "../../services/BookStorageService";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "../../hooks/useThemeColor";
import CameraView from "../../components/CameraView";
import OCRResultView from "../../components/OCRResultView";
import ImageSelectionView, {
  SelectionArea,
} from "../../components/ImageSelectionView";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import { Book } from "../../constants/MockData";
import NoImagePlaceholder from "../../components/NoImagePlaceholder";
import { useLastClipBook } from "../../contexts/LastClipBookContext";

export default function AddClipScreen() {
  const params = useLocalSearchParams<{
    bookId: string;
    bookTitle: string;
    imageUri: string;
    isOcr: string;
    clipText: string;
    selectedBook: string;
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
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isLoadingBook, setIsLoadingBook] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const { lastClipBook, setLastClipBook } = useLastClipBook();

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const secondaryBackgroundColor = useThemeColor({}, "secondaryBackground");
  const borderColor = Colors[colorScheme].tabIconDefault;

  // 書籍データの初期ロード
  useEffect(() => {
    let isMounted = true;

    async function loadBooks() {
      try {
        setIsLoadingBook(true);
        const loadedBooks = await BookStorageService.getAllBooks();

        if (!isMounted) return;

        // 書籍の選択優先順位:
        // 1. URL指定のbookId
        // 2. 最後に使用した書籍（コンテキストから）
        // 3. 最初の書籍（書籍がある場合）
        let bookToSet: Book | null = null;

        if (params?.bookId) {
          bookToSet = loadedBooks.find((b) => b.id === params.bookId) || null;
          console.log("URLパラメータから書籍を設定:", bookToSet?.title);
        }

        if (!bookToSet && lastClipBook) {
          const lastBook =
            loadedBooks.find((b) => b.id === lastClipBook.id) || null;
          if (lastBook) {
            bookToSet = lastBook;
            console.log("最後に使用した書籍を設定:", lastBook.title);
          }
        }

        if (!bookToSet && loadedBooks.length > 0) {
          bookToSet = loadedBooks[0];
          console.log("最初の書籍を設定:", loadedBooks[0].title);
        }

        if (isMounted) {
          setSelectedBook(bookToSet);
        }
      } catch (error) {
        console.error("書籍データの読み込みに失敗:", error);
        if (isMounted) {
          Alert.alert(
            "エラー",
            "書籍データの読み込みに失敗しました。\n画面を再読み込みしてください。"
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingBook(false);
        }
      }
    }

    loadBooks();

    return () => {
      isMounted = false;
    };
  }, []);

  // URLパラメータのクリップテキストを設定
  useEffect(() => {
    if (params?.clipText) {
      setClipText(params.clipText);
    }
  }, [params?.clipText]);

  // 書籍選択画面から戻ってきたときの処理
  useEffect(() => {
    if (params?.selectedBook) {
      try {
        const book = JSON.parse(params.selectedBook) as Book;
        setSelectedBook(book);
      } catch (error) {
        console.error("書籍データのパースに失敗:", error);
      }
    }
  }, [params?.selectedBook]);

  // 画像が渡された場合の処理
  useEffect(() => {
    if (params?.imageUri) {
      setCapturedImageUri(params.imageUri);
      if (params?.isOcr === "true") {
        // OCRカメラからの画像の場合、直接画像選択画面を表示
        setShowImageSelection(true);
      }
    }
  }, [params?.imageUri, params?.isOcr]);

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

  // 書籍選択画面に遷移
  const handleBookSelect = () => {
    // 現在のクリップテキストを保持
    router.push({
      pathname: "/book/select",
      params: {
        fromClip: "true",
        clipText: clipText,
      },
    });
  };

  const handleSaveClip = async () => {
    if (isSaving) return; // 保存中は処理をスキップ

    if (!clipText.trim()) {
      Alert.alert("エラー", "クリップするテキストを入力してください");
      return;
    }

    if (!selectedBook) {
      Alert.alert("エラー", "書籍を選択してください");
      return;
    }

    // ページ番号が空または数値でない場合の処理
    const page = pageNumber.trim() ? parseInt(pageNumber, 10) : 0;
    if (isNaN(page)) {
      Alert.alert("エラー", "ページ番号は数値で入力してください");
      return;
    }

    try {
      setIsSaving(true); // 保存開始

      await ClipStorageService.saveClip({
        id: Date.now().toString(),
        bookId: selectedBook.id!,
        text: clipText.trim(),
        page,
        createdAt: new Date().toISOString(),
      });

      // 最後に使用した書籍を更新
      setLastClipBook(selectedBook);

      // 保存成功したら書籍詳細画面に遷移
      Alert.alert("成功", "クリップを保存しました", [
        {
          text: "OK",
          onPress: () => {
            // 書籍詳細画面に直接遷移
            router.replace(`/book/${selectedBook.id}`);
          },
        },
      ]);
    } catch (error) {
      console.error("Failed to save clip:", error);
      Alert.alert("エラー", "クリップの保存に失敗しました");
    } finally {
      setIsSaving(false); // 保存完了
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
    setShowImageSelection(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="back-button"
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            クリップを追加
          </Text>
        </View>
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
          {/* 書籍選択UI */}
          <View style={styles.bookSelectionContainer}>
            <View style={styles.bookInfoHeader}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                書籍を選択
              </Text>
              <TouchableOpacity
                style={styles.changeBookButton}
                onPress={handleBookSelect}
                testID="change-book-button"
              >
                <Text
                  style={[
                    styles.changeBookButtonText,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  変更
                </Text>
              </TouchableOpacity>
            </View>

            {isLoadingBook ? (
              <Text style={[styles.loadingText, { color: textColor }]}>
                読み込み中...
              </Text>
            ) : selectedBook ? (
              <View
                style={[
                  styles.selectedBookContainer,
                  { backgroundColor: secondaryBackgroundColor },
                ]}
              >
                <View style={styles.bookContent}>
                  {selectedBook.coverImage ? (
                    <Image
                      source={{ uri: selectedBook.coverImage }}
                      style={styles.coverImage}
                    />
                  ) : (
                    <View style={styles.coverImage}>
                      <NoImagePlaceholder width={50} height={75} />
                    </View>
                  )}
                  <View style={styles.bookInfo}>
                    <Text style={[styles.bookTitle, { color: textColor }]}>
                      {selectedBook.title}
                    </Text>
                    <Text style={[styles.bookAuthor, { color: textColor }]}>
                      {selectedBook.author}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.selectBookPrompt,
                  { backgroundColor: secondaryBackgroundColor },
                ]}
                onPress={handleBookSelect}
              >
                <Text style={[styles.selectBookText, { color: textColor }]}>
                  書籍を選択してください
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.divider} />

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
                <Ionicons
                  name="camera"
                  size={24}
                  color={Colors[colorScheme].text}
                />
                <Text
                  style={[
                    styles.cameraButtonText,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  写真から追加
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: textColor,
                  backgroundColor: secondaryBackgroundColor,
                  borderColor: borderColor,
                },
              ]}
              placeholder="印象に残った文章をクリップしましょう"
              placeholderTextColor={Colors[colorScheme].tabIconDefault}
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
                  borderColor: borderColor,
                },
              ]}
              placeholder="例: 42"
              placeholderTextColor={Colors[colorScheme].tabIconDefault}
              keyboardType="number-pad"
              value={pageNumber}
              onChangeText={setPageNumber}
              testID="page-number-input"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: Colors[colorScheme].primary },
              isSaving && styles.saveButtonDisabled,
            ]}
            onPress={handleSaveClip}
            activeOpacity={0.8}
            disabled={isSaving}
            testID="save-clip-button"
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? "保存中..." : "保存する"}
            </Text>
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
          <CameraView onCapture={handleCapture} onClose={handleCameraClose} />
        </Modal>
      )}

      {/* 画像選択モーダル */}
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
  bookInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  changeBookButton: {
    padding: 8,
  },
  changeBookButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  bookSelectionContainer: {
    marginBottom: 20,
  },
  selectedBookContainer: {
    borderRadius: 8,
    overflow: "hidden",
  },
  bookContent: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
  },
  coverImage: {
    width: 50,
    height: 75,
    borderRadius: 4,
    marginRight: 12,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  bookAuthor: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  selectBookPrompt: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  selectBookText: {
    fontSize: 16,
  },
  loadingText: {
    padding: 16,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginBottom: 20,
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
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: "top",
  },
  pageInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 50,
  },
  saveButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
