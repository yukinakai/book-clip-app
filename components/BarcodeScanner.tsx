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
      const book = await RakutenBookService.searchAndSaveBook(data);
      if (book) {
        Alert.alert("保存完了", `「${book.title}」を本棚に追加しました。`, [
          { text: "OK", onPress: onClose },
        ]);
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
