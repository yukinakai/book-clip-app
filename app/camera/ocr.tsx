import React, { useState } from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import CameraView from "../../components/CameraView";

export default function OCRCameraScreen() {
  const router = useRouter();
  const [isOcrCameraOpen, setIsOcrCameraOpen] = useState(true);

  // OCRカメラでの画像キャプチャ処理
  const handleOcrImageCaptured = (imageUri: string) => {
    console.log("OCR用画像が選択されました:", imageUri);
    // クリップ登録画面に遷移（OCR処理用として）
    router.push(
      `/book/add-clip?imageUri=${encodeURIComponent(imageUri)}&isOcr=true`
    );
    setIsOcrCameraOpen(false);
  };

  // OCRカメラを閉じる
  const handleOcrCameraClose = () => {
    setIsOcrCameraOpen(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {isOcrCameraOpen && (
        <CameraView
          onCapture={handleOcrImageCaptured}
          onClose={handleOcrCameraClose}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
});
