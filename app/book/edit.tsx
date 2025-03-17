import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BookStorageService } from "../../services/BookStorageService";
import { useThemeColor } from "../../hooks/useThemeColor";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

export default function EditBookScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    title: string;
    author: string;
    coverImage: string;
  }>();
  const colorScheme = useColorScheme() ?? "light";
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "icon");

  // 直接初期値として設定
  const [title, setTitle] = useState(
    typeof params.title === "string" ? params.title : ""
  );
  const [author, setAuthor] = useState(
    typeof params.author === "string" ? params.author : ""
  );
  const [coverImage, setCoverImage] = useState(
    typeof params.coverImage === "string" ? params.coverImage : ""
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("エラー", "タイトルは必須です");
      return;
    }

    try {
      setLoading(true);

      // 既存の書籍データを取得
      const books = await BookStorageService.getAllBooks();
      const bookToUpdate = books.find((book) => book.id === params.id);

      if (!bookToUpdate) {
        Alert.alert("エラー", "書籍が見つかりませんでした");
        setLoading(false);
        return;
      }

      // 更新されたデータ
      const updatedBook = {
        ...bookToUpdate,
        title: title.trim(),
        author: author.trim(),
        coverImage: coverImage.trim(),
      };

      // 一度削除して再保存する (AsyncStorageには部分更新がないため)
      await BookStorageService.removeBook(params.id);
      await BookStorageService.saveBook(updatedBook);

      setLoading(false);

      // 成功メッセージ
      Alert.alert("保存完了", "書籍情報が更新されました", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      setLoading(false);
      console.error("Error updating book:", error);
      Alert.alert("エラー", "書籍の更新中にエラーが発生しました");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            testID="back-button"
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={[styles.headerTitle, { color: textColor }]}>
              書籍を編集
            </Text>
          </View>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
            testID="save-button"
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color={Colors[colorScheme].primary}
              />
            ) : (
              <Ionicons name="checkmark" size={24} color={textColor} />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>
                タイトル *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { color: textColor, borderColor: Colors[colorScheme].icon },
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="書籍のタイトル"
                placeholderTextColor={placeholderColor}
                testID="title-input"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>著者</Text>
              <TextInput
                style={[
                  styles.input,
                  { color: textColor, borderColor: Colors[colorScheme].icon },
                ]}
                value={author}
                onChangeText={setAuthor}
                placeholder="著者名"
                placeholderTextColor={placeholderColor}
                testID="author-input"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>
                表紙画像URL
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { color: textColor, borderColor: Colors[colorScheme].icon },
                ]}
                value={coverImage}
                onChangeText={setCoverImage}
                placeholder="https://example.com/cover.jpg"
                placeholderTextColor={placeholderColor}
                autoCapitalize="none"
                keyboardType="url"
                testID="cover-input"
              />
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backButton: {
    marginRight: 10,
    zIndex: 1,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  saveButton: {
    marginLeft: 10,
    padding: 5,
  },
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
});
