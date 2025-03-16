import { useState, useRef, useCallback } from "react";
import { Alert } from "react-native";
import { RakutenBookService } from "@/services/RakutenBookService";
import { BookStorageService } from "@/services/BookStorageService";
import { Book } from "@/constants/MockData";

// No-Image用のデフォルト画像URL
const DEFAULT_BOOK_IMAGE =
  "https://placehold.co/150x200/e0e0e0/696969?text=No+Image";

// No-Image用のフラグ - この値がcoverImageに設定された場合はプレースホルダーを表示
export const NO_IMAGE_FLAG = null;

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
  const [scannedBarcode, setScannedBarcode] = useState<string>("");

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
      };

      // 書籍を保存
      await BookStorageService.saveBook(newBook);

      Alert.alert("保存完了", `「${newBook.title}」を本棚に追加しました。`, [
        {
          text: "OK",
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
  }, [bookTitle, bookAuthor, hideManualForm, onClose]);

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
      setIsLoading(true);
      setIsAlertShowing(true);

      Alert.alert(
        "ISBN検出",
        `ISBN: ${isbn}\n\nこのISBNを使って書籍情報を検索しますか？`,
        [
          {
            text: "キャンセル",
            style: "cancel",
            onPress: () => {
              setIsLoading(false);
              setIsAlertShowing(false);
              isProcessingRef.current = false;
            },
          },
          {
            text: "検索する",
            onPress: async () => {
              try {
                const result = await RakutenBookService.searchByIsbn(isbn);

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
                          setIsLoading(false);
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
                          const saveResult =
                            await RakutenBookService.searchAndSaveBook(isbn);
                          if (saveResult.isExisting) {
                            Alert.alert(
                              "登録済みの本",
                              `「${saveResult.book?.title}」は既に本棚に登録されています。`,
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
                          } else if (saveResult.book) {
                            Alert.alert(
                              "保存完了",
                              `「${saveResult.book.title}」を本棚に追加しました。`,
                              [
                                {
                                  text: "OK",
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
                Alert.alert("エラー", "本の検索中にエラーが発生しました。", [
                  {
                    text: "OK",
                    onPress: () => {
                      setIsAlertShowing(false);
                      isProcessingRef.current = false;
                    },
                  },
                ]);
              } finally {
                setIsLoading(false);
              }
            },
          },
        ]
      );
    },
    [isAlertShowing, processedISBNs, onClose, showManualForm]
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
