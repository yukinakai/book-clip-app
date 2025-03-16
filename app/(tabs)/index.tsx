// app/(tabs)/index.tsx
import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  Text,
  SafeAreaView,
} from "react-native";
import { Book } from "../../constants/MockData";
import { Colors } from "../../constants/Colors";
import BookshelfView from "../../components/BookshelfView";
import { Ionicons } from "@expo/vector-icons";
import CameraModal from "../../components/camera/CameraModal";
import { useColorScheme } from "../../hooks/useColorScheme";

export default function HomeScreen() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const colorScheme = useColorScheme() ?? "light";

  const handleBookSelect = (book: Book) => {
    console.log("Selected book:", book.title);
  };

  const handleBookAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleImageCaptured = (imageUri: string) => {
    console.log("画像が選択されました:", imageUri);
    Alert.alert(
      "画像キャプチャ",
      "写真の処理が完了しました。この後、OCRやバーコードスキャンなどの処理を追加できます。"
    );
  };

  const handleClose = () => {
    setIsCameraOpen(false);
    handleBookAdded();
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <View
        style={[
          styles.headerContainer,
          { backgroundColor: Colors[colorScheme].background },
        ]}
      >
        <View style={styles.titleContainer}>
          <Text
            style={[styles.headerTitle, { color: Colors[colorScheme].text }]}
          >
            マイライブラリ
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: Colors[colorScheme].primary },
          ]}
          activeOpacity={0.8}
          onPress={() => setIsCameraOpen(true)}
          testID="add-book-button"
        >
          <Ionicons name="book-outline" size={18} color="white" />
          <Text style={styles.buttonText}>書籍を追加</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bookshelfContainer}>
        <BookshelfView
          onSelectBook={handleBookSelect}
          headerTitle=""
          refreshTrigger={refreshTrigger}
        />
      </View>

      <CameraModal
        isVisible={isCameraOpen}
        onClose={handleClose}
        onImageCaptured={handleImageCaptured}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E0D1", // Vintage Beige
    position: "relative",
  },
  titleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  bookshelfContainer: {
    flex: 1,
    width: "100%",
    marginTop: 0, // ヘッダーとコンテンツの間のスペースを削除
  },
  addButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
});
