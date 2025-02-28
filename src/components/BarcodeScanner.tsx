import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Camera, BarcodeScanningResult } from "expo-camera";

// Camera を React コンポーネントとしてキャスト
const ExpoCamera = Camera as unknown as React.ComponentType<any>;

// CameraType は型のみなので、値としては文字列リテラルを利用する
const BACK_CAMERA: "back" = "back";

interface BarcodeScannerViewProps {
  onScan: (isbn: string) => void;
}

export const BarcodeScannerView: React.FC<BarcodeScannerViewProps> = ({ onScan }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  // カメラパーミッションの取得
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getCameraPermissions();
  }, []);

  // バーコードをスキャンした時のハンドラ
  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    if (scanned) return;

    setScanned(true);
    onScan(result.data);
  };

  if (hasPermission === null) {
    return <Text>カメラのアクセス許可を確認中...</Text>;
  }

  if (hasPermission === false) {
    return <Text testID="permission-denied">カメラの使用を許可してください</Text>;
  }

  return (
    <View style={styles.container}>
      <ExpoCamera
        testID="barcode-scanner"
        type={BACK_CAMERA}
        // すでにスキャン済みの場合はハンドラを無効化
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
        // 必要に応じて読み取りたいバーコードの種類を指定
        // ean13 だけを認識したい場合:
        barCodeScannerSettings={{
          barCodeTypes: ["ean13"],
        }}
      />
      {scanned && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>スキャンが完了しました</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});