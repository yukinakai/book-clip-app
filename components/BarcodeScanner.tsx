import React, { useState } from "react";
import { StyleSheet, View, Alert } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { RakutenBookService } from "../services/RakutenBookService";

interface BarcodeScannerProps {
  onClose: () => void;
}

export default function BarcodeScanner({ onClose }: BarcodeScannerProps) {
  const [hasScanned, setHasScanned] = useState(false);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (hasScanned) return;
    setHasScanned(true);

    try {
      const result = await RakutenBookService.searchAndSaveBook(data);
      if (result.book) {
        if (result.isExisting) {
          Alert.alert(
            "登録済みの本",
            `「${result.book.title}」は既に本棚に登録されています。`,
            [{ text: "OK", onPress: () => setHasScanned(false) }]
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
          { text: "OK", onPress: () => setHasScanned(false) },
        ]);
      }
    } catch (error) {
      console.error("Error handling barcode scan:", error);
      Alert.alert("エラー", "本の検索中にエラーが発生しました。", [
        { text: "OK", onPress: () => setHasScanned(false) },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
