import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";

// オンボーディング完了のフラグをAsyncStorageに保存するキー
const ONBOARDING_COMPLETE_KEY = "@bookclip:onboarding_complete";

export default function ResetScreen() {
  const resetStorage = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
      console.log("ウォークスルーがリセットされました");
      // ホーム画面にリダイレクト
      router.replace("/");
    } catch (error) {
      console.error("リセットに失敗しました:", error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>ウォークスルーリセット</Text>

      <Text style={styles.description}>
        アプリを初回起動時の状態に戻し、ウォークスルー画面を表示します。
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={resetStorage}
        testID="reset-button"
      >
        <Text style={styles.buttonText}>リセットして再起動</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.cancelButton]}
        onPress={() => router.back()}
        testID="cancel-button"
      >
        <Text style={styles.cancelButtonText}>キャンセル</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#4169E1",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 15,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#999",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
  },
});
