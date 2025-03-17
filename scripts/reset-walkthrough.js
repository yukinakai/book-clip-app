#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

// ESMでの__dirname取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// app/_clear.tsxファイルを作成
const resetFilePath = path.join(__dirname, "..", "app", "_clear.tsx");

const resetCode = `import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function ClearStorageScreen() {
  useEffect(() => {
    const clearStorage = async () => {
      try {
        // ウォークスルーの完了フラグを削除
        await AsyncStorage.removeItem('@bookclip:onboarding_complete');
        console.log('AsyncStorage cleared successfully');
        
        // リダイレクト（少し遅延を入れる）
        setTimeout(() => {
          router.replace('/');
        }, 1000);
      } catch (error) {
        console.error('Failed to clear storage:', error);
      }
    };

    clearStorage();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ActivityIndicator size="large" color="#4169E1" style={styles.loader} />
      <Text style={styles.text}>ウォークスルーをリセットしています...</Text>
      <Text style={styles.subText}>自動的にホーム画面に戻ります</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loader: {
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
`;

try {
  // _clear.tsxファイルを作成または上書き
  fs.writeFileSync(resetFilePath, resetCode, "utf8");
  console.log("🔄 リセット画面を作成しました");

  console.log("🔍 リセットするにはアプリ起動後に/_clearにアクセスしてください");
  console.log("🚀 アプリを起動します...");

  // npmコマンドを同期的に実行
  execSync("expo start", { stdio: "inherit" });
} catch (err) {
  console.error("エラー:", err);
}
