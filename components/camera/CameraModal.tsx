// components/camera/CameraModal.tsx
import React, { useState } from "react";
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import BarcodeScanner from "./BarcodeScanner";
import ImagePreview from "./ImagePreview";
import PermissionRequest from "./PermissionRequest";
import { useBookScanner } from "@/hooks/useBookScanner";

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
  const [error, setError] = useState<string | null>(null);

  const { handleBarcodeScanned, isLoading, resetScanner } = useBookScanner({
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

    return <BarcodeScanner onBarcodeScanned={handleBarcodeScanned} />;
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
