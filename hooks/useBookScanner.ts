import { useState } from "react";
import { Alert } from "react-native";
import { searchBookByIsbn } from "@/services/bookSearch";

interface UseBookScannerProps {
  onClose: () => void;
}

export const useBookScanner = ({ onClose }: UseBookScannerProps) => {
  const [processedISBNs, setProcessedISBNs] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleBarcodeScanned = async (isbn: string) => {
    if (processedISBNs.has(isbn) || isLoading) return;

    console.log("ISBN検出:", isbn);
    setProcessedISBNs((prev) => new Set(prev).add(isbn));
    setIsLoading(true);

    Alert.alert(
      "ISBN検出",
      `ISBN: ${isbn}\n\nこのISBNを使って書籍情報を検索しますか？`,
      [
        {
          text: "キャンセル",
          style: "cancel",
          onPress: () => setIsLoading(false),
        },
        {
          text: "検索する",
          onPress: async () => {
            try {
              const bookInfo = await searchBookByIsbn(isbn);

              if (!bookInfo) {
                Alert.alert(
                  "書籍が見つかりません",
                  `ISBN ${isbn} に一致する書籍が見つかりませんでした。`,
                  [{ text: "OK" }]
                );
                return;
              }

              Alert.alert(
                "書籍情報",
                `タイトル: ${bookInfo.title}\n著者: ${bookInfo.author}`,
                [
                  {
                    text: "OK",
                    onPress: () => {
                      onClose();
                    },
                  },
                ]
              );
            } catch (error) {
              Alert.alert(
                "エラー",
                "書籍情報の取得に失敗しました。ネットワーク接続を確認してください。",
                [{ text: "OK" }]
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const resetScanner = () => {
    setProcessedISBNs(new Set());
    setIsLoading(false);
  };

  return {
    handleBarcodeScanned: isLoading ? () => {} : handleBarcodeScanned,
    isLoading,
    resetScanner,
  };
};
