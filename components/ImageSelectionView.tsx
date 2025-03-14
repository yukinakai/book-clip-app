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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "../hooks/useThemeColor";
import * as ImageManipulator from "expo-image-manipulator";
import { SafeAreaView as SafeAreaViewContext } from "react-native-safe-area-context";

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
  const [isLoading, setIsLoading] = useState(false);

  // 画像コンテナのref
  const imageContainerRef = useRef<View>(null);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  // テーマカラーの代わりに固定値を使用
  const borderColor = "#ddd";
  const buttonColor = "#f0f0f0";
  const selectionBorderColor = "#FF4757";
  const confirmButtonColor = "#4CAF50";

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

  // 現在の選択範囲を計算
  const currentSelection = {
    x: Math.min(selectionStart.x, selectionEnd.x),
    y: Math.min(selectionStart.y, selectionEnd.y),
    width: Math.abs(selectionEnd.x - selectionStart.x),
    height: Math.abs(selectionEnd.y - selectionStart.y),
  };

  const hasValidSelection =
    currentSelection.width > 0 && currentSelection.height > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          テキスト領域選択
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.imageContainer}>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={styles.loader}
          />
        ) : (
          <>
            <Text style={[styles.instructionText, { color: textColor }]}>
              テキストが含まれる領域を選択してください
            </Text>

            <View
              style={styles.imageWrapper}
              ref={imageContainerRef}
              onLayout={handleImageLayout}
              {...panResponder.panHandlers}
            >
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                resizeMode="contain"
                onLoad={handleImageLoad}
              />
              {(hasValidSelection || isSelecting) && (
                <View
                  style={[
                    styles.selectionBox,
                    {
                      left: currentSelection.x,
                      top: currentSelection.y,
                      width: currentSelection.width,
                      height: currentSelection.height,
                      borderColor: selectionBorderColor,
                    },
                  ]}
                />
              )}
            </View>

            <View style={styles.buttonsContainer}>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[
                    styles.utilityButton,
                    { backgroundColor: buttonColor },
                  ]}
                  onPress={handleSelectAll}
                >
                  <Ionicons name="scan-outline" size={20} color="#FF4757" />
                  <Text style={styles.utilityButtonText}>すべて選択</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.utilityButton,
                    { backgroundColor: buttonColor },
                  ]}
                  onPress={clearSelection}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={20}
                    color="#FF4757"
                  />
                  <Text style={styles.utilityButtonText}>選択解除</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  {
                    backgroundColor: confirmButtonColor,
                    opacity: hasValidSelection ? 1 : 0.5,
                  },
                ]}
                onPress={handleConfirmSelection}
                disabled={!hasValidSelection}
              >
                <Text style={styles.confirmButtonText}>選択を確定</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  instructionText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 8,
    fontWeight: "500",
  },
  imageContainer: {
    flex: 1,
    padding: 8,
    display: "flex",
    flexDirection: "column",
  },
  imageWrapper: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  buttonsContainer: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  utilityButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    flex: 0.48,
  },
  utilityButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#FF4757",
    fontWeight: "500",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  selectionBox: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#FF4757",
    backgroundColor: "rgba(255, 71, 87, 0.1)",
  },
});
