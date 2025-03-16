// components/camera/CameraModal.tsx
import React, { useState } from "react";
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import BarcodeScanner from "./BarcodeScanner";
import ImagePreview from "./ImagePreview";
import PermissionRequest from "./PermissionRequest";
import { useBookScanner } from "@/hooks/useBookScanner";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

interface CameraModalProps {
  isVisible: boolean;
  onClose: () => void;
  onImageCaptured: (imageUri: string) => void;
}

// ManualEntryForm用のPropsインターフェースを追加
interface ManualEntryFormProps {
  bookTitle: string;
  setBookTitle: (text: string) => void;
  bookAuthor: string;
  setBookAuthor: (text: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

// 手動入力フォームコンポーネント
const ManualEntryForm: React.FC<ManualEntryFormProps> = ({
  bookTitle,
  setBookTitle,
  bookAuthor,
  setBookAuthor,
  onCancel,
  onSave,
}) => {
  const colorScheme = useColorScheme() ?? "light";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.manualEntryContainer}
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
            onPress={onCancel}
          >
            <Text style={styles.buttonText}>キャンセル</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.saveButton,
              { backgroundColor: Colors[colorScheme].primary },
            ]}
            onPress={onSave}
          >
            <Text style={styles.buttonText}>登録する</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const CameraModal: React.FC<CameraModalProps> = ({
  isVisible,
  onClose,
  onImageCaptured,
}) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState<string | null>(null);

  const {
    handleBarcodeScanned,
    isLoading,
    resetScanner,
    // 手動入力関連の機能を取得
    showManualEntryForm,
    showManualForm,
    hideManualForm,
    bookTitle,
    setBookTitle,
    bookAuthor,
    setBookAuthor,
    handleManualSave,
  } = useBookScanner({
    onClose,
  });

  const handleClose = () => {
    setCapturedImage(null);
    setError(null);
    resetScanner();
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

    // 手動入力フォームが表示されている場合
    if (showManualEntryForm) {
      return (
        <ManualEntryForm
          bookTitle={bookTitle}
          setBookTitle={setBookTitle}
          bookAuthor={bookAuthor}
          setBookAuthor={setBookAuthor}
          onCancel={hideManualForm}
          onSave={handleManualSave}
        />
      );
    }

    // バーコードスキャナーを表示
    return (
      <View style={{ flex: 1 }}>
        <BarcodeScanner onBarcodeScanned={handleBarcodeScanned} />

        {/* 手動入力ボタンを追加 */}
        <TouchableOpacity
          style={styles.manualEntryButton}
          onPress={showManualForm}
        >
          <Ionicons
            name="create-outline"
            size={20}
            color="white"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.buttonText}>手動で入力</Text>
        </TouchableOpacity>
      </View>
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
            {capturedImage
              ? "プレビュー"
              : showManualEntryForm
              ? "書籍情報の手動入力"
              : "バーコードスキャン"}
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
  // 手動入力フォーム用スタイル
  manualEntryContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 16,
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
  // 手動入力ボタン
  manualEntryButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default CameraModal;
