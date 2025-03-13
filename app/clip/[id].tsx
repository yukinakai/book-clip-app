import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Clip } from "../../constants/MockData";
import { ClipStorageService } from "../../services/ClipStorageService";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "../../hooks/useThemeColor";

export default function ClipDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [clip, setClip] = useState<Clip | null>(null);
  const [text, setText] = useState("");
  const [page, setPage] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookTitle, setBookTitle] = useState("");
  const router = useRouter();

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const secondaryBackgroundColor = useThemeColor({}, "secondaryBackground");

  // クリップデータを読み込む
  useEffect(() => {
    const loadClipDetails = async () => {
      try {
        setLoading(true);
        const allClips = await ClipStorageService.getAllClips();
        const foundClip = allClips.find((c) => c.id === id);

        if (foundClip) {
          setClip(foundClip);
          setText(foundClip.text);
          setPage(foundClip.page.toString());

          // 書籍タイトルを取得する処理を追加することも可能
          // ここでは省略していますが、BookStorageServiceから取得できます
        }
      } catch (error) {
        console.error("Error loading clip details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadClipDetails();
    }
  }, [id]);

  // クリップを更新する
  const handleUpdateClip = async () => {
    if (!clip) return;

    try {
      // ページ番号のバリデーション
      const pageNumber = parseInt(page, 10);
      if (isNaN(pageNumber) || pageNumber <= 0) {
        Alert.alert("エラー", "有効なページ番号を入力してください");
        return;
      }

      // テキストのバリデーション
      if (!text.trim()) {
        Alert.alert("エラー", "クリップテキストを入力してください");
        return;
      }

      // 更新されたクリップを作成
      const updatedClip: Clip = {
        ...clip,
        text: text.trim(),
        page: pageNumber,
      };

      // クリップを更新
      await ClipStorageService.updateClip(updatedClip);

      // 更新完了後、前の画面に戻る
      router.back();
    } catch (error) {
      console.error("Error updating clip:", error);
      Alert.alert("エラー", "クリップの更新に失敗しました");
    }
  };

  // クリップを削除する
  const handleDeleteClip = () => {
    Alert.alert(
      "確認",
      "このクリップを削除してもよろしいですか？",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          style: "destructive",
          onPress: async () => {
            try {
              await ClipStorageService.removeClip(id);
              // 削除完了後、前の画面に戻る
              router.back();
            } catch (error) {
              console.error("Error deleting clip:", error);
              Alert.alert("エラー", "クリップの削除に失敗しました");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <Text style={{ color: textColor }}>読み込み中...</Text>
      </View>
    );
  }

  if (!clip) {
    return (
      <View style={[styles.errorContainer, { backgroundColor }]}>
        <Text style={{ color: textColor }}>クリップが見つかりませんでした</Text>
      </View>
    );
  }

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
            クリップ編集
          </Text>
        </View>

        <ScrollView style={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <Text style={[styles.label, { color: textColor }]}>
              クリップテキスト
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { color: textColor, backgroundColor: secondaryBackgroundColor },
              ]}
              value={text}
              onChangeText={setText}
              multiline
              numberOfLines={6}
              placeholder="クリップテキストを入力"
              placeholderTextColor="#999"
              testID="clip-text-input"
            />

            <Text style={[styles.label, { color: textColor }]}>ページ</Text>
            <TextInput
              style={[
                styles.pageInput,
                { color: textColor, backgroundColor: secondaryBackgroundColor },
              ]}
              value={page}
              onChangeText={setPage}
              keyboardType="number-pad"
              placeholder="ページ番号"
              placeholderTextColor="#999"
              testID="clip-page-input"
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.updateButton]}
                onPress={handleUpdateClip}
                testID="update-clip-button"
              >
                <Text style={styles.buttonText}>更新</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor }]}
                onPress={handleDeleteClip}
                testID="delete-clip-button"
              >
                <Text style={styles.deleteButtonText}>削除</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
  },
  pageInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "column",
    marginTop: 30,
  },
  updateButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: "#4CAF50",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
  },
});
