import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { OCRService, OCRResult } from "../services/OCRService";
import { useThemeColor } from "../hooks/useThemeColor";
import { SelectionArea } from "./ImageSelectionView";

// ルーターシムのインターフェース
interface RouterShim {
  back: () => void;
}

interface OCRResultViewProps {
  imageUri: string;
  onConfirm: (text: string) => void;
  onCancel: () => void;
  router?: RouterShim; // オプショナルなので既存のコードを壊さない
  selectionArea?: SelectionArea; // 選択領域の情報（オプション）
}

export default function OCRResultView({
  imageUri,
  onConfirm,
  onCancel,
  router,
  selectionArea,
}: OCRResultViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [editedText, setEditedText] = useState("");
  const [confidence, setConfidence] = useState<number | undefined>(undefined);

  // テーマカラーの取得
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = "#ddd"; // 固定値に変更
  const secondaryBackgroundColor = useThemeColor({}, "secondaryBackground");

  // 画像からテキストを抽出
  useEffect(() => {
    extractText();
  }, [imageUri, selectionArea]);

  const extractText = async () => {
    try {
      setLoading(true);
      setError(null);

      // OCRサービスを呼び出して画像からテキストを抽出
      // 選択領域の情報がある場合は渡す
      const result: OCRResult = await OCRService.extractTextFromImage(
        imageUri,
        selectionArea
      );

      if (result.error) {
        setError(result.error);
      } else {
        setExtractedText(result.text);
        setEditedText(result.text); // 編集用のテキストにも同じ値をセット
        setConfidence(result.confidence);
      }
    } catch (err) {
      console.error("OCR処理中のエラー:", err);
      setError("テキスト抽出中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  // テキストを確定して親コンポーネントに渡す
  const handleConfirm = () => {
    onConfirm(editedText.trim());
  };

  // 再度テキスト抽出を試みる
  const handleRetry = () => {
    extractText();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          テキスト抽出結果
        </Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* 撮影した画像のプレビュー */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF4757" />
            <Text style={[styles.loadingText, { color: textColor }]}>
              テキストを抽出中...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#FF4757" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>再試行</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultContainer}>
            {confidence !== undefined && (
              <Text style={[styles.confidenceText, { color: textColor }]}>
                信頼度: {Math.round(confidence * 100)}%
              </Text>
            )}

            <Text style={[styles.label, { color: textColor }]}>
              抽出されたテキスト:
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: textColor,
                  backgroundColor: secondaryBackgroundColor,
                  borderColor: borderColor,
                },
              ]}
              multiline
              value={editedText}
              onChangeText={setEditedText}
              placeholder="抽出されたテキストがここに表示されます"
              placeholderTextColor="#999"
            />

            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !editedText.trim() && styles.disabledButton,
                ]}
                onPress={handleConfirm}
                disabled={!editedText.trim()}
              >
                <Text style={styles.confirmButtonText}>テキストを使用</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  spacer: {
    width: 40, // closeButtonと同じ幅を確保
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    padding: 16,
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    resizeMode: "cover",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#555",
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#FF4757",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#FF4757",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  resultContainer: {
    padding: 16,
  },
  confidenceText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
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
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButton: {
    flex: 2,
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#A5D6A7", // 薄い緑色
    opacity: 0.7,
  },
});
