import React, { useState } from "react";
import { StyleSheet, View, Alert, TouchableOpacity, Text } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { RakutenBookService } from "../services/RakutenBookService";
import { Colors } from "../constants/Colors";
import { useColorScheme } from "../hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";

interface BarcodeScannerProps {
  onClose: () => void;
}

export default function BarcodeScanner({ onClose }: BarcodeScannerProps) {
  const [hasScanned, setHasScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const colorScheme = useColorScheme() ?? "light";

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (hasScanned || isProcessing) return;
    setHasScanned(true);
    setIsProcessing(true);

    try {
      const result = await RakutenBookService.searchAndSaveBook(data);
      if (result.book) {
        if (result.isExisting) {
          Alert.alert(
            "登録済みの本",
            `「${result.book.title}」は既に本棚に登録されています。`,
            [
              {
                text: "OK",
                onPress: () => {
                  setHasScanned(false);
                  setIsProcessing(false);
                },
              },
            ]
          );
        } else {
          Alert.alert(
            "保存完了",
            `「${result.book.title}」を本棚に追加しました。`,
            [{ text: "OK", onPress: onClose }]
          );
        }
      } else {
        Alert.alert("エラー", "本が見つかりませんでした。", [
          {
            text: "OK",
            onPress: () => {
              setHasScanned(false);
              setIsProcessing(false);
            },
          },
        ]);
      }
    } catch (error) {
      console.error("Error handling barcode scan:", error);
      Alert.alert("エラー", "本の検索中にエラーが発生しました。", [
        {
          text: "OK",
          onPress: () => {
            setHasScanned(false);
            setIsProcessing(false);
          },
        },
      ]);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <BarCodeScanner
        onBarCodeScanned={hasScanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />

      {/* スキャンエリアを示すオーバーレイ */}
      <View style={styles.overlay}>
        <View style={styles.unfocusedArea} />
        <View style={styles.middleRow}>
          <View style={styles.unfocusedArea} />
          <View
            style={[
              styles.scanArea,
              { borderColor: Colors[colorScheme].primary },
            ]}
          />
          <View style={styles.unfocusedArea} />
        </View>
        <View style={styles.unfocusedArea} />
      </View>

      {/* スキャンステータスの表示 */}
      {isProcessing && (
        <View
          style={[
            styles.processingContainer,
            { backgroundColor: Colors[colorScheme].background },
          ]}
        >
          <Text style={{ color: Colors[colorScheme].text }}>
            書籍を検索中...
          </Text>
        </View>
      )}

      {/* 閉じるボタン */}
      <TouchableOpacity
        style={[
          styles.closeButton,
          { backgroundColor: Colors[colorScheme].background },
        ]}
        onPress={onClose}
      >
        <Ionicons name="close" size={24} color={Colors[colorScheme].text} />
      </TouchableOpacity>

      {/* スキャン案内テキスト */}
      <View style={styles.instructionContainer}>
        <Text
          style={[
            styles.instructionText,
            { color: Colors[colorScheme].background },
          ]}
        >
          書籍のバーコードを枠内に合わせてください
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  unfocusedArea: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  middleRow: {
    flexDirection: "row",
    flex: 1,
  },
  scanArea: {
    width: 250,
    aspectRatio: 1.5,
    borderWidth: 3,
    borderRadius: 12,
    borderStyle: "dashed",
  },
  processingContainer: {
    position: "absolute",
    padding: 16,
    borderRadius: 8,
    top: "50%",
    left: "50%",
    marginLeft: -100,
    marginTop: -25,
    width: 200,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  instructionContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  instructionText: {
    fontSize: 16,
    fontWeight: "600",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
});
