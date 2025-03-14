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
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

export default function ClipDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [clip, setClip] = useState<Clip | null>(null);
  const [text, setText] = useState("");
  const [page, setPage] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookTitle, setBookTitle] = useState("");
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const secondaryBackgroundColor = useThemeColor({}, "secondaryBackground");
  const borderColor = Colors[colorScheme].tabIconDefault;

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
      try {
        router.back();
      } catch (error) {
        console.warn("Error navigating back:", error);
        // フォールバックナビゲーションなし - エラーのみログ出力
      }
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
              try {
                router.back();
              } catch (error) {
                console.warn("Error navigating back:", error);
                // エラーが発生しても画面遷移を続行
                Alert.alert(
                  "操作完了",
                  "クリップが削除されました。前の画面に戻ってください。"
                );
              }
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
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            testID="back-button"
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            クリップを編集
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
                {
                  color: textColor,
                  backgroundColor: secondaryBackgroundColor,
                  borderColor: borderColor,
                },
              ]}
              value={text}
              onChangeText={setText}
              multiline
              numberOfLines={6}
              placeholder="クリップテキストを入力"
              placeholderTextColor={Colors[colorScheme].tabIconDefault}
              testID="clip-text-input"
            />

            <Text style={[styles.label, { color: textColor }]}>ページ</Text>
            <TextInput
              style={[
                styles.pageInput,
                {
                  color: textColor,
                  backgroundColor: secondaryBackgroundColor,
                  borderColor: borderColor,
                },
              ]}
              value={page}
              onChangeText={setPage}
              keyboardType="number-pad"
              placeholder="ページ番号"
              placeholderTextColor={Colors[colorScheme].tabIconDefault}
              testID="clip-page-input"
            />

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  { borderColor: Colors[colorScheme].alert },
                ]}
                onPress={handleDeleteClip}
                testID="delete-clip-button"
              >
                <Text
                  style={[
                    styles.cancelButtonText,
                    { color: Colors[colorScheme].alert },
                  ]}
                >
                  削除
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  { backgroundColor: Colors[colorScheme].primary },
                ]}
                onPress={handleUpdateClip}
                testID="update-clip-button"
              >
                <Text style={styles.confirmButtonText}>更新</Text>
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
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
  },
  pageInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
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
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButton: {
    flex: 2,
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
});
