import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Alert,
  TouchableOpacity,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { RakutenBookService } from "../services/RakutenBookService";
import { Colors } from "../constants/Colors";
import { useColorScheme } from "../hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { BookStorageService } from "../services/BookStorageService";
import { Book } from "../constants/MockData";

interface BarcodeScannerProps {
  onClose: () => void;
}

// No-Image用のデフォルト画像URL
const DEFAULT_BOOK_IMAGE = "https://via.placeholder.com/150x200?text=No+Image";

export default function BarcodeScanner({ onClose }: BarcodeScannerProps) {
  const [hasScanned, setHasScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showManualEntryForm, setShowManualEntryForm] = useState(false);
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [scannedBarcode, setScannedBarcode] = useState("");
  const colorScheme = useColorScheme() ?? "light";

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (hasScanned || isProcessing) return;
    setHasScanned(true);
    setIsProcessing(true);
    setScannedBarcode(data);

    try {
      const result = await RakutenBookService.searchAndSaveBook(data);
      if (result.book) {
        if (result.isExisting) {
          Alert.alert(
            "登録済みの本",
            `「${result.book.title}」は既に本棚に登録されています。`,
            [
              {
                text: "OK",
                onPress: () => {
                  setHasScanned(false);
                  setIsProcessing(false);
                },
              },
            ]
          );
        } else {
          Alert.alert(
            "保存完了",
            `「${result.book.title}」を本棚に追加しました。`,
            [{ text: "OK", onPress: onClose }]
          );
        }
      } else {
        // 書籍が見つからない場合、手入力フォームを表示する
        Alert.alert(
          "書籍が見つかりませんでした",
          "書籍情報を手動で入力しますか？",
          [
            {
              text: "いいえ",
              onPress: () => {
                setHasScanned(false);
                setIsProcessing(false);
              },
              style: "cancel",
            },
            {
              text: "はい",
              onPress: () => {
                setIsProcessing(false);
                setShowManualEntryForm(true);
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error handling barcode scan:", error);
      Alert.alert("エラー", "本の検索中にエラーが発生しました。", [
        {
          text: "OK",
          onPress: () => {
            setHasScanned(false);
            setIsProcessing(false);
          },
        },
      ]);
    }
  };

  const handleManualSave = async () => {
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
        coverImage: DEFAULT_BOOK_IMAGE,
      };

      // 書籍を保存
      await BookStorageService.saveBook(newBook);

      Alert.alert("保存完了", `「${newBook.title}」を本棚に追加しました。`, [
        { text: "OK", onPress: onClose },
      ]);
    } catch (error) {
      console.error("Error saving manual book entry:", error);
      Alert.alert("エラー", "書籍の保存中にエラーが発生しました。", [
        { text: "OK" },
      ]);
    }
  };

  const renderManualEntryForm = () => (
    <Modal
      visible={showManualEntryForm}
      transparent={true}
      animationType="slide"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View
          style={[
            styles.formContainer,
            { backgroundColor: Colors[colorScheme].background },
          ]}
        >
          <Text style={[styles.formTitle, { color: Colors[colorScheme].text }]}>
            書籍情報を入力
          </Text>

          <Text style={[styles.label, { color: Colors[colorScheme].text }]}>
            書籍名 *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor:
                  Colors[colorScheme].secondaryBackground || "#F0F0F0",
                color: Colors[colorScheme].text,
              },
            ]}
            value={bookTitle}
            onChangeText={setBookTitle}
            placeholder="書籍名を入力（必須）"
            placeholderTextColor="#888"
          />

          <Text style={[styles.label, { color: Colors[colorScheme].text }]}>
            著者名
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor:
                  Colors[colorScheme].secondaryBackground || "#F0F0F0",
                color: Colors[colorScheme].text,
              },
            ]}
            value={bookAuthor}
            onChangeText={setBookAuthor}
            placeholder="著者名を入力（任意）"
            placeholderTextColor="#888"
          />

          <Text
            style={[
              styles.noteText,
              { color: Colors[colorScheme].tabIconDefault },
            ]}
          >
            ※サムネイルは「No Image」で登録されます
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                { backgroundColor: Colors[colorScheme].tabIconDefault },
              ]}
              onPress={() => {
                setShowManualEntryForm(false);
                setHasScanned(false);
              }}
            >
              <Text style={styles.buttonText}>キャンセル</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                { backgroundColor: Colors[colorScheme].primary },
              ]}
              onPress={handleManualSave}
            >
              <Text style={styles.buttonText}>登録する</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <BarCodeScanner
        onBarCodeScanned={hasScanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />

      {/* スキャンエリアを示すオーバーレイ */}
      <View style={styles.overlay}>
        <View style={styles.unfocusedArea} />
        <View style={styles.middleRow}>
          <View style={styles.unfocusedArea} />
          <View
            style={[
              styles.scanArea,
              { borderColor: Colors[colorScheme].primary },
            ]}
          />
          <View style={styles.unfocusedArea} />
        </View>
        <View style={styles.unfocusedArea} />
      </View>

      {/* スキャンステータスの表示 */}
      {isProcessing && (
        <View
          style={[
            styles.processingContainer,
            { backgroundColor: Colors[colorScheme].background },
          ]}
        >
          <Text style={{ color: Colors[colorScheme].text }}>
            書籍を検索中...
          </Text>
        </View>
      )}

      {/* 閉じるボタン */}
      <TouchableOpacity
        style={[
          styles.closeButton,
          { backgroundColor: Colors[colorScheme].background },
        ]}
        onPress={onClose}
      >
        <Ionicons name="close" size={24} color={Colors[colorScheme].text} />
      </TouchableOpacity>

      {/* スキャン案内テキスト */}
      <View style={styles.instructionContainer}>
        <Text
          style={[
            styles.instructionText,
            { color: Colors[colorScheme].background },
          ]}
        >
          書籍のバーコードを枠内に合わせてください
        </Text>
      </View>

      {/* 手動入力フォーム */}
      {renderManualEntryForm()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  unfocusedArea: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  middleRow: {
    flexDirection: "row",
    flex: 1,
  },
  scanArea: {
    width: 250,
    aspectRatio: 1.5,
    borderWidth: 3,
    borderRadius: 12,
    borderStyle: "dashed",
  },
  processingContainer: {
    position: "absolute",
    padding: 16,
    borderRadius: 8,
    top: "50%",
    left: "50%",
    marginLeft: -100,
    marginTop: -25,
    width: 200,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  instructionContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  instructionText: {
    fontSize: 16,
    fontWeight: "600",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  // 手動入力フォーム用スタイル
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  formContainer: {
    width: "85%",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  noteText: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    marginRight: 10,
  },
  saveButton: {
    marginLeft: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
