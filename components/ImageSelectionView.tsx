import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "../hooks/useThemeColor";
import * as ImageManipulator from "expo-image-manipulator";

// ルーターシムのインターフェース
interface RouterShim {
  back: () => void;
}

// 選択領域の情報
export interface SelectionArea {
  x: number;
  y: number;
  width: number;
  height: number;
  imageWidth: number;
  imageHeight: number;
}

interface ImageSelectionViewProps {
  imageUri: string;
  onConfirm: (selectionArea: SelectionArea) => void;
  onCancel: () => void;
  router?: RouterShim;
}

export default function ImageSelectionView({
  imageUri,
  onConfirm,
  onCancel,
  router,
}: ImageSelectionViewProps) {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [imageLayout, setImageLayout] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
  const [isSelecting, setIsSelecting] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const [processing, setProcessing] = useState(false);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  // 画像読み込み完了時の処理
  const handleImageLoad = () => {
    // 画像のサイズを取得
    Image.getSize(
      imageUri,
      (width, height) => {
        setImageSize({ width, height });
      },
      (error) => console.error("画像サイズの取得に失敗しました:", error)
    );
  };

  // 画像コンテナのレイアウト取得
  const handleImageLayout = (event: any) => {
    const { width, height, x, y } = event.nativeEvent.layout;
    setImageLayout({ width, height, x, y });
  };

  // 選択を確定して次のステップへ
  const handleConfirmSelection = async () => {
    if (!hasSelection) return;

    setProcessing(true);

    try {
      // 選択範囲をソートして確実に左上と右下の座標にする
      const startX = Math.min(selectionStart.x, selectionEnd.x);
      const startY = Math.min(selectionStart.y, selectionEnd.y);
      const endX = Math.max(selectionStart.x, selectionEnd.x);
      const endY = Math.max(selectionStart.y, selectionEnd.y);

      // 選択範囲を元画像のスケールに変換
      const scaleX = imageSize.width / imageLayout.width;
      const scaleY = imageSize.height / imageLayout.height;

      const selectionArea: SelectionArea = {
        x: startX * scaleX,
        y: startY * scaleY,
        width: (endX - startX) * scaleX,
        height: (endY - startY) * scaleY,
        imageWidth: imageSize.width,
        imageHeight: imageSize.height,
      };

      // 選択した範囲の情報をコールバックで返す
      onConfirm(selectionArea);
    } catch (error) {
      console.error("選択範囲の処理中にエラーが発生しました:", error);
      Alert.alert("エラー", "画像の処理に失敗しました");
    } finally {
      setProcessing(false);
    }
  };

  // 全選択する
  const handleSelectAll = () => {
    setSelectionStart({ x: 0, y: 0 });
    setSelectionEnd({ x: imageLayout.width, y: imageLayout.height });
    setHasSelection(true);
  };

  // 選択をクリアする
  const clearSelection = () => {
    setSelectionStart({ x: 0, y: 0 });
    setSelectionEnd({ x: 0, y: 0 });
    setHasSelection(false);
  };

  // パンレスポンダーの設定
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event: GestureResponderEvent) => {
      // 選択開始
      const { locationX, locationY } = event.nativeEvent;
      setSelectionStart({ x: locationX, y: locationY });
      setSelectionEnd({ x: locationX, y: locationY });
      setIsSelecting(true);
      setHasSelection(false);
    },
    onPanResponderMove: (
      event: GestureResponderEvent,
      gestureState: PanResponderGestureState
    ) => {
      if (isSelecting) {
        // 移動中は選択範囲を更新
        const { locationX, locationY } = event.nativeEvent;

        // 画像の範囲内に制限
        const constrainedX = Math.max(
          0,
          Math.min(locationX, imageLayout.width)
        );
        const constrainedY = Math.max(
          0,
          Math.min(locationY, imageLayout.height)
        );

        setSelectionEnd({ x: constrainedX, y: constrainedY });
      }
    },
    onPanResponderRelease: () => {
      // 選択終了
      setIsSelecting(false);
      setHasSelection(true);
    },
  });

  // 選択範囲のスタイルを計算
  const getSelectionStyle = () => {
    if (!hasSelection && !isSelecting) return null;

    const startX = Math.min(selectionStart.x, selectionEnd.x);
    const startY = Math.min(selectionStart.y, selectionEnd.y);
    const width = Math.abs(selectionEnd.x - selectionStart.x);
    const height = Math.abs(selectionEnd.y - selectionStart.y);

    return {
      position: "absolute" as const,
      left: startX,
      top: startY,
      width,
      height,
      borderWidth: 2,
      borderColor: "#FF4757",
      backgroundColor: "rgba(255, 71, 87, 0.1)",
    };
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          テキスト範囲を選択
        </Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.instruction, { color: textColor }]}>
          OCRしたいテキスト部分をドラッグして選択してください
        </Text>

        <View style={styles.imageContainer} onLayout={handleImageLayout}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            onLoad={handleImageLoad}
            resizeMode="contain"
            {...panResponder.panHandlers}
          />
          {/* 選択範囲の表示 */}
          {(hasSelection || isSelecting) && (
            <View style={getSelectionStyle()} />
          )}
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.utilityButton}
            onPress={handleSelectAll}
          >
            <Ionicons name="scan-outline" size={20} color="#FF4757" />
            <Text style={styles.utilityButtonText}>全範囲選択</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.utilityButton}
            onPress={clearSelection}
          >
            <Ionicons name="trash-outline" size={20} color="#FF4757" />
            <Text style={styles.utilityButtonText}>クリア</Text>
          </TouchableOpacity>
        </View>

        {/* 確認・キャンセルボタン */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>キャンセル</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!hasSelection || processing) && styles.disabledButton,
            ]}
            onPress={handleConfirmSelection}
            disabled={!hasSelection || processing}
          >
            <Text style={styles.confirmButtonText}>
              {processing ? "処理中..." : "テキスト認識"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  spacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  instruction: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  imageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  utilityButton: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    padding: 8,
  },
  utilityButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#FF4757",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButton: {
    flex: 2,
    backgroundColor: "#4CAF50",
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
  disabledButton: {
    backgroundColor: "#A5D6A7",
    opacity: 0.7,
  },
});
