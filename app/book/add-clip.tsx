import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ClipStorageService } from "../../services/ClipStorageService";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "../../hooks/useThemeColor";

export default function AddClipScreen() {
  const { bookId, bookTitle } = useLocalSearchParams<{
    bookId: string;
    bookTitle: string;
  }>();
  const [clipText, setClipText] = useState("");
  const [pageNumber, setPageNumber] = useState("");
  const router = useRouter();

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const secondaryBackgroundColor = useThemeColor({}, "secondaryBackground");

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
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

        <View style={styles.form}>
          <Text style={[styles.bookTitle, { color: textColor }]}>
            {bookTitle || "書籍タイトル"}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: textColor }]}>
              クリップするテキスト
            </Text>
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
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
  form: {
    padding: 20,
    flex: 1,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
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
