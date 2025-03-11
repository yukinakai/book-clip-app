// components/camera/CameraModal.tsx
import React, { useState } from "react";
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import BarcodeScanner from "./BarcodeScanner";
import ImagePreview from "./ImagePreview";
import PermissionRequest from "./PermissionRequest";

interface CameraModalProps {
  isVisible: boolean;
  onClose: () => void;
  onImageCaptured: (imageUri: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({
  isVisible,
  onClose,
  onImageCaptured,
}) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [processedISBNs, setProcessedISBNs] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleBarcodeScanned = (isbn: string) => {
    // 既に処理済みのISBNなら無視
    if (processedISBNs.has(isbn) || isLoading) return;

    console.log("ISBN検出:", isbn);

    // このISBNを処理済みとしてマーク
    setProcessedISBNs((prev) => new Set(prev).add(isbn));

    // スキャンを一時停止（処理中フラグを立てる）
    setIsLoading(true);

    // アラートを1回だけ表示
    Alert.alert(
      "ISBN検出",
      `ISBN: ${isbn}\n\nこのISBNを使って書籍情報を検索しますか？`,
      [
        {
          text: "キャンセル",
          style: "cancel",
          onPress: () => {
            // スキャンを再開
            setIsLoading(false);
          },
        },
        {
          text: "検索する",
          onPress: async () => {
            try {
              // setIsLoading(true) は既に上部で設定済み
              setError(null);

              // 楽天APIを使ってISBNで書籍情報を検索する処理を実装
              const applicationId = process.env.EXPO_PUBLIC_RAKUTEN_APP_ID; // Expoの環境変数から読み込む

              // アプリケーションIDが設定されているか確認
              if (!applicationId) {
                throw new Error(
                  "楽天アプリケーションIDが設定されていません。環境変数EXPO_PUBLIC_RAKUTEN_APP_IDを確認してください。"
                );
              }

              // ISBNコードの整形（ハイフンを削除し、13桁の数字のみにする）
              const formattedIsbn = isbn.replace(/[^0-9]/g, "");

              // ISBNの形式チェック
              if (formattedIsbn.length !== 13 || !/^\d+$/.test(formattedIsbn)) {
                throw new Error(
                  `無効なISBN形式です: ${formattedIsbn}。13桁の数字が必要です。`
                );
              }

              // デバッグ情報を追加
              console.log("元のISBN:", isbn);
              console.log("整形後ISBN:", formattedIsbn);
              console.log("環境変数 applicationId:", applicationId);

              // パラメータ名をisbnjに修正（楽天APIの仕様通り）
              const apiUrl = `https://app.rakuten.co.jp/services/api/BooksTotal/Search/20170404?format=json&isbnjan=${formattedIsbn}&applicationId=${applicationId}`;
              console.log("API URL:", apiUrl);

              const response = await fetch(apiUrl);

              // レスポンスの詳細情報も出力
              console.log("Response status:", response.status);
              console.log("Response statusText:", response.statusText);

              if (!response.ok) {
                throw new Error(
                  `API request failed with status ${response.status}`
                );
              }

              const data = await response.json();
              console.log("楽天API response:", data); // Debug logging

              // Check if the response has items (books found)
              if (!data.Items || data.Items.length === 0) {
                Alert.alert(
                  "書籍が見つかりません",
                  `ISBN ${isbn} に一致する書籍が見つかりませんでした。`,
                  [{ text: "OK" }]
                );
                setIsLoading(false);
                return;
              }

              // 書籍情報を取得できた場合の処理
              const bookInfo = data.Items[0].Item;
              console.log("Book info:", bookInfo);

              // ここで書籍情報を使った処理を行う
              Alert.alert(
                "書籍情報",
                `タイトル: ${bookInfo.title || "不明"}\n著者: ${
                  bookInfo.author || "不明"
                }`,
                [
                  {
                    text: "OK",
                    onPress: () => {
                      // 書籍情報を保存するなどの処理をここに実装
                      onClose();
                    },
                  },
                ]
              );
            } catch (error) {
              console.error("書籍情報の検索中にエラーが発生しました:", error);
              Alert.alert(
                "エラー",
                "書籍情報の取得に失敗しました。ネットワーク接続を確認してください。",
                [{ text: "OK" }]
              );
            } finally {
              setIsLoading(false);
              // モーダルを閉じる際に状態をリセット
              setProcessedISBNs(new Set());
            }
          },
        },
      ]
    );
  };

  const handleClose = () => {
    setCapturedImage(null);
    setError(null);
    setIsLoading(false);
    setProcessedISBNs(new Set());
    onClose();
  };

  const renderContent = () => {
    if (!permission) {
      return <PermissionRequest loading={true} requestPermission={() => {}} />;
    }

    if (!permission.granted) {
      return <PermissionRequest requestPermission={requestPermission} />;
    }

    if (capturedImage) {
      return (
        <ImagePreview
          imageUri={capturedImage}
          onRetake={() => setCapturedImage(null)}
          onUse={(uri) => {
            onImageCaptured(uri);
            onClose();
            setTimeout(() => setCapturedImage(null), 500);
          }}
        />
      );
    }

    return (
      <BarcodeScanner
        onBarcodeScanned={isLoading ? () => {} : handleBarcodeScanned}
      />
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {capturedImage ? "プレビュー" : "バーコードスキャン"}
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {renderContent()}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    left: 15,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    backgroundColor: "rgba(255, 0, 0, 0.7)",
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  errorText: {
    color: "white",
    textAlign: "center",
  },
});

export default CameraModal;
