import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import {
  CameraView as ExpoCameraView,
  useCameraPermissions,
} from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";

// ルーターシムのインターフェース
interface RouterShim {
  back: () => void;
}

interface CameraViewProps {
  onCapture: (imageUri: string) => void;
  onClose: () => void;
  router?: RouterShim; // オプショナルなので既存のコードを壊さない
}

export default function CameraView({
  onCapture,
  onClose,
  router,
}: CameraViewProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [isTakingPicture, setIsTakingPicture] = useState(false);
  const cameraRef = useRef<any>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  // カメラのパーミッション取得
  useEffect(() => {
    (async () => {
      // カメラのパーミッションをリクエスト
      if (!cameraPermission?.granted) {
        await requestCameraPermission();
      }

      // メディアライブラリのパーミッションをリクエスト
      const { status: mediaLibraryStatus } =
        await MediaLibrary.requestPermissionsAsync();

      setHasPermission(
        cameraPermission?.granted === true && mediaLibraryStatus === "granted"
      );

      if (!cameraPermission?.granted) {
        Alert.alert(
          "カメラのアクセス許可が必要です",
          "テキスト抽出機能を使用するにはカメラへのアクセス許可が必要です。"
        );
      }

      if (mediaLibraryStatus !== "granted") {
        Alert.alert(
          "メディアライブラリへのアクセス許可が必要です",
          "撮影した写真を保存するには許可が必要です。"
        );
      }
    })();
  }, [cameraPermission, requestCameraPermission]);

  // 写真撮影
  const takePicture = async () => {
    if (!cameraRef.current || isTakingPicture) return;

    try {
      setIsTakingPicture(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: Platform.OS === "android", // Androidの場合はスキップ
      });

      // メディアライブラリに保存（オプション）
      await MediaLibrary.saveToLibraryAsync(photo.uri);

      // 親コンポーネントに画像URIを渡す
      onCapture(photo.uri);
    } catch (error) {
      console.error("写真撮影エラー:", error);
      Alert.alert("エラー", "写真の撮影に失敗しました。再度お試しください。");
    } finally {
      setIsTakingPicture(false);
    }
  };

  // カメラ切り替え（前面/背面）
  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  // パーミッションがまだ決定していない場合
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF4757" />
        <Text style={styles.text}>カメラへのアクセスを確認中...</Text>
      </View>
    );
  }

  // パーミッションが拒否された場合
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>カメラへのアクセスが拒否されました</Text>
        <Text style={styles.subText}>
          設定アプリからカメラのアクセスを許可してください
        </Text>
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>閉じる</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // カメラ表示
  return (
    <View style={styles.container}>
      <ExpoCameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        ratio="16:9"
      >
        <View style={styles.cameraContent}>
          {/* 上部のヘッダー */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerText}>テキスト撮影</Text>
            <TouchableOpacity
              onPress={toggleCameraFacing}
              style={styles.flipButton}
            >
              <Ionicons name="camera-reverse" size={30} color="white" />
            </TouchableOpacity>
          </View>

          {/* 下部のコントロール */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={takePicture}
              style={styles.captureButton}
              disabled={isTakingPicture}
            >
              {isTakingPicture ? (
                <ActivityIndicator size="large" color="white" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>
          </View>

          {/* ガイドライン（オプション） */}
          <View style={styles.guideContainer}>
            <View style={styles.guideBox} />
            <Text style={styles.guideText}>
              テキストが枠内に収まるようにしてください
            </Text>
          </View>
        </View>
      </ExpoCameraView>
    </View>
  );
}

const { width } = Dimensions.get("window");
const guideBoxWidth = width * 0.8;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  cameraContent: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
  },
  closeButton: {
    padding: 8,
  },
  headerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  flipButton: {
    padding: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 20,
    paddingBottom: 40,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
  },
  text: {
    color: "white",
    fontSize: 18,
    marginVertical: 10,
    textAlign: "center",
  },
  subText: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#FF4757",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  guideContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  guideBox: {
    width: guideBoxWidth,
    height: guideBoxWidth * 0.6,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  guideText: {
    color: "white",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
});
