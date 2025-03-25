import { useState, useRef, useCallback } from "react";
import { Alert } from "react-native";
import { RakutenBookService } from "@/services/RakutenBookService";
import { BookStorageService } from "@/services/BookStorageService";
import { Book } from "@/constants/MockData";
import { router } from "expo-router";

// No-Image用のフラグ - この値がcoverImageに設定された場合はプレースホルダーを表示
const NO_IMAGE_FLAG = null;

interface UseBookScannerProps {
  onClose: () => void;
}

export const useBookScanner = ({ onClose }: UseBookScannerProps) => {
  const [processedISBNs, setProcessedISBNs] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAlertShowing, setIsAlertShowing] = useState<boolean>(false);
  // 手動入力フォーム用の状態
  const [showManualEntryForm, setShowManualEntryForm] =
    useState<boolean>(false);
  const [bookTitle, setBookTitle] = useState<string>("");
  const [bookAuthor, setBookAuthor] = useState<string>("");
  const [_scannedBarcode, setScannedBarcode] = useState<string>("");

  const isProcessingRef = useRef(false);
  const lastProcessedTime = useRef(0);
  const DEBOUNCE_TIME = 1000; // 1秒のデバウンス時間

  // 手動入力フォームを表示する関数
  const showManualForm = useCallback(() => {
    setShowManualEntryForm(true);
  }, []);

  // 手動入力フォームを閉じる関数
  const hideManualForm = useCallback(() => {
    setShowManualEntryForm(false);
    setBookTitle("");
    setBookAuthor("");
  }, []);

  // 書籍を選択して詳細画面に移動する関数
  const navigateToBookDetail = useCallback(
    (bookId: string | undefined) => {
      if (!bookId) {
        console.error("書籍IDが未定義です");
        onClose();
        return;
      }

      // onCloseを呼び出してカメラモーダルを閉じる
      onClose();
      // 少し遅延させて詳細画面に遷移
      setTimeout(() => {
        router.push(`/book/${bookId}`);
      }, 300);
    },
    [onClose]
  );

  // 手動入力された書籍情報を保存する関数
  const handleManualSave = useCallback(async () => {
    if (!bookTitle.trim()) {
      Alert.alert("エラー", "書籍名は必須です");
      return;
    }

    try {
      // 手動で入力された情報から書籍オブジェクトを作成
      const newBook: Book = {
        id: `manual_${Date.now()}`,
        title: bookTitle.trim(),
        author: bookAuthor.trim() || "不明",
        coverImage: NO_IMAGE_FLAG, // SVGプレースホルダーを使用するためnullを設定
        isbn: `manual_${Date.now()}`, // 手動入力の場合は一意のISBNを生成
      };

      // 書籍を保存
      await BookStorageService.saveBook(newBook);

      Alert.alert("保存完了", `「${newBook.title}」を本棚に追加しました。`, [
        {
          text: "詳細を見る",
          onPress: () => {
            hideManualForm();
            navigateToBookDetail(newBook.id);
          },
        },
        {
          text: "閉じる",
          onPress: () => {
            hideManualForm();
            onClose();
          },
        },
      ]);
    } catch (error) {
      console.error("Error saving manual book entry:", error);
      Alert.alert("エラー", "書籍の保存中にエラーが発生しました。", [
        { text: "OK" },
      ]);
    }
  }, [bookTitle, bookAuthor, hideManualForm, onClose, navigateToBookDetail]);

  const handleBarcodeScanned = useCallback(
    async (isbn: string) => {
      // 処理中フラグまたはAlertの表示状態をチェック
      if (isProcessingRef.current || isAlertShowing) return;

      // デバウンスチェック
      const now = Date.now();
      if (now - lastProcessedTime.current < DEBOUNCE_TIME) return;
      lastProcessedTime.current = now;

      // 既に処理済みのISBNをチェック
      if (processedISBNs.has(isbn)) return;

      console.log("ISBN検出:", isbn);
      isProcessingRef.current = true;
      setProcessedISBNs((prev) => new Set(prev).add(isbn));
      setScannedBarcode(isbn); // 検出したISBNを保存
      // ここでローディング表示はしない
      setIsAlertShowing(true);

      Alert.alert(
        "ISBN検出",
        `ISBN: ${isbn}\n\nこのISBNを使って書籍情報を検索しますか？`,
        [
          {
            text: "キャンセル",
            style: "cancel",
            onPress: () => {
              setIsAlertShowing(false);
              isProcessingRef.current = false;
            },
          },
          {
            text: "検索する",
            onPress: async () => {
              try {
                // 書籍検索中にローディング表示
                setIsLoading(true);
                const result = await RakutenBookService.searchByIsbn(isbn);
                setIsLoading(false);

                if (!result) {
                  Alert.alert(
                    "書籍が見つかりません",
                    `ISBN ${isbn} に一致する書籍が見つかりませんでした。手動で入力しますか？`,
                    [
                      {
                        text: "いいえ",
                        style: "cancel",
                        onPress: () => {
                          setIsAlertShowing(false);
                          isProcessingRef.current = false;
                        },
                      },
                      {
                        text: "はい",
                        onPress: () => {
                          setIsAlertShowing(false);
                          isProcessingRef.current = false;
                          showManualForm();
                        },
                      },
                    ]
                  );
                  return;
                }

                Alert.alert(
                  "書籍情報",
                  `タイトル: ${result.title}\n著者: ${result.author}\n\nこの本を本棚に追加しますか？`,
                  [
                    {
                      text: "キャンセル",
                      style: "cancel",
                      onPress: () => {
                        setIsAlertShowing(false);
                        isProcessingRef.current = false;
                      },
                    },
                    {
                      text: "追加する",
                      onPress: async () => {
                        try {
                          // 書籍保存中にローディング表示
                          setIsLoading(true);
                          const saveResult =
                            await RakutenBookService.searchAndSaveBook(isbn);
                          setIsLoading(false);

                          if (saveResult.isExisting) {
                            Alert.alert(
                              "登録済みの本",
                              `「${saveResult.book?.title}」は既に本棚に登録されています。`,
                              [
                                {
                                  text: "詳細を見る",
                                  onPress: () => {
                                    setIsAlertShowing(false);
                                    isProcessingRef.current = false;
                                    if (saveResult.book) {
                                      navigateToBookDetail(saveResult.book.id);
                                    }
                                  },
                                },
                                {
                                  text: "閉じる",
                                  onPress: () => {
                                    setIsAlertShowing(false);
                                    isProcessingRef.current = false;
                                    onClose();
                                  },
                                },
                              ]
                            );
                          } else if (saveResult.book) {
                            // このブロックにはsaveResult.bookが存在する
                            const book = saveResult.book; // 変数に代入

                            Alert.alert(
                              "保存完了",
                              `「${book.title}」を本棚に追加しました。`,
                              [
                                {
                                  text: "詳細を見る",
                                  onPress: () => {
                                    setIsAlertShowing(false);
                                    isProcessingRef.current = false;
                                    // null安全のために明示的にチェック
                                    if (book && book.id) {
                                      navigateToBookDetail(book.id);
                                    } else {
                                      console.error("書籍IDが取得できません");
                                      onClose();
                                    }
                                  },
                                },
                                {
                                  text: "閉じる",
                                  onPress: () => {
                                    setIsAlertShowing(false);
                                    isProcessingRef.current = false;
                                    onClose();
                                  },
                                },
                              ]
                            );
                          }
                        } catch (error) {
                          // エラーが発生した場合はローディングを非表示に
                          setIsLoading(false);
                          // エラー詳細は不要なため、ユーザーへの通知のみを行う
                          Alert.alert(
                            "エラー",
                            "本の保存中にエラーが発生しました。",
                            [
                              {
                                text: "OK",
                                onPress: () => {
                                  setIsAlertShowing(false);
                                  isProcessingRef.current = false;
                                },
                              },
                            ]
                          );
                        }
                      },
                    },
                  ]
                );
              } catch (error) {
                // エラーが発生した場合はローディングを非表示に
                setIsLoading(false);
                // エラー詳細は不要なため、ユーザーへの通知のみを行う
                Alert.alert("エラー", "本の検索中にエラーが発生しました。", [
                  {
                    text: "OK",
                    onPress: () => {
                      setIsAlertShowing(false);
                      isProcessingRef.current = false;
                    },
                  },
                ]);
              }
            },
          },
        ]
      );
    },
    [
      isAlertShowing,
      processedISBNs,
      onClose,
      showManualForm,
      navigateToBookDetail,
    ]
  );

  const resetScanner = useCallback(() => {
    setProcessedISBNs(new Set());
    setIsLoading(false);
    setIsAlertShowing(false);
    setShowManualEntryForm(false);
    setBookTitle("");
    setBookAuthor("");
    setScannedBarcode("");
    isProcessingRef.current = false;
    lastProcessedTime.current = 0;
  }, []);

  return {
    handleBarcodeScanned:
      isLoading || isAlertShowing ? () => {} : handleBarcodeScanned,
    isLoading,
    resetScanner,
    // 手動入力関連の値を追加
    showManualEntryForm,
    showManualForm,
    hideManualForm,
    bookTitle,
    setBookTitle,
    bookAuthor,
    setBookAuthor,
    handleManualSave,
  };
};
