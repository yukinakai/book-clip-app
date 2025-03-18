import React from "react";
import { View, StyleSheet } from "react-native";
import { Redirect } from "expo-router";

// このファイルは中央ボタン用のダミータブであり、
// 実際の画面としては使用されません。
// タブバーの中央ボタンをタップした際は直接OCRカメラに遷移します。
export default function AddClipTabScreen() {
  // 安全のため、このページに直接アクセスした場合は
  // OCRカメラページにリダイレクトします
  return <Redirect href="/camera/ocr" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
