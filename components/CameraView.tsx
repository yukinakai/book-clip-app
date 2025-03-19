import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import {
  CameraView as ExpoCameraView,
  useCameraPermissions,
} from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import { Colors } from "../constants/Colors";
import { useColorScheme } from "../hooks/useColorScheme";

interface CameraViewProps {
  onCapture: (imageUri: string) => void;
  onClose: () => void;
}

export default function CameraView({ onCapture, onClose }: CameraViewProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [isTakingPicture, setIsTakingPicture] = useState(false);
  const cameraRef = useRef<any>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const colorScheme = useColorScheme() ?? "light";

  // カメラのパーミッション取得
  useEffect(() => {
    (async () => {
      try {
        // すでに許可されているか確認
        if (cameraPermission?.granted) {
          // すでに許可されている場合はメディアライブラリのみチェック
          const { status: mediaLibraryStatus } =
            await MediaLibrary.requestPermissionsAsync();
          setHasPermission(mediaLibraryStatus === "granted");
          return;
        }

        // カメラのパーミッションをリクエスト（まだ許可されていない場合のみ）
        const cameraResult = await requestCameraPermission();

        // メディアライブラリのパーミッションをリクエスト
        const { status: mediaLibraryStatus } =
          await MediaLibrary.requestPermissionsAsync();

        // 両方のパーミッションの状態を更新
        setHasPermission(
          cameraResult.granted && mediaLibraryStatus === "granted"
        );

        // パーミッションが拒否された場合のみアラート表示
        if (!cameraResult.granted) {
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
      } catch (error) {
        console.error("パーミッション取得エラー:", error);
        setHasPermission(false);
      }
    })();
  }, [cameraPermission?.granted, requestCameraPermission]);

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
        <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
        <Text style={[styles.text, { color: Colors[colorScheme].background }]}>
          カメラへのアクセスを確認中...
        </Text>
      </View>
    );
  }

  // パーミッションが拒否された場合
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={[styles.text, { color: Colors[colorScheme].background }]}>
          カメラへのアクセスが拒否されました
        </Text>
        <Text
          style={[
            styles.subText,
            { color: Colors[colorScheme].tabIconDefault },
          ]}
        >
          設定アプリからカメラのアクセスを許可してください
        </Text>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: Colors[colorScheme].primary },
          ]}
          onPress={onClose}
        >
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
            <Text style={[styles.headerText, { color: "white" }]}>
              テキスト撮影
            </Text>
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
                <ActivityIndicator
                  size="large"
                  color={Colors[colorScheme].background}
                />
              ) : (
                <View
                  style={[
                    styles.captureButtonInner,
                    { backgroundColor: Colors[colorScheme].background },
                  ]}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ExpoCameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
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
  },
  text: {
    fontSize: 18,
    marginVertical: 10,
    textAlign: "center",
  },
  subText: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
