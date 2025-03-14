import { useState, useRef, useCallback } from "react";
import { Alert } from "react-native";
import { RakutenBookService } from "@/services/RakutenBookService";

interface UseBookScannerProps {
  onClose: () => void;
}

export const useBookScanner = ({ onClose }: UseBookScannerProps) => {
  const [processedISBNs, setProcessedISBNs] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAlertShowing, setIsAlertShowing] = useState<boolean>(false);
  const isProcessingRef = useRef(false);
  const lastProcessedTime = useRef(0);
  const DEBOUNCE_TIME = 1000; // 1秒のデバウンス時間

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
      setIsLoading(true);
      setIsAlertShowing(true);
      setIsLoading(true);

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
                    `ISBN ${isbn} に一致する書籍が見つかりませんでした。`,
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
    [isAlertShowing, processedISBNs, onClose]
  );

  const resetScanner = useCallback(() => {
    setProcessedISBNs(new Set());
    setIsLoading(false);
    setIsAlertShowing(false);
    isProcessingRef.current = false;
    lastProcessedTime.current = 0;
  }, []);

  return {
    handleBarcodeScanned:
      isLoading || isAlertShowing ? () => {} : handleBarcodeScanned,
    isLoading,
    resetScanner,
  };
};
