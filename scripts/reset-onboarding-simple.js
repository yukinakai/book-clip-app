import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ESMでの__dirname取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ステップ1: コードを生成
const resetCode = `import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function ResetOnboarding() {
  useEffect(() => {
    const resetStorage = async () => {
      try {
        await AsyncStorage.removeItem('@bookclip:onboarding_complete');
        console.log('ウォークスルーがリセットされました');
        // 少し待ってからリダイレクト
        setTimeout(() => {
          router.replace('/');
        }, 1500);
      } catch (error) {
        console.error('リセットに失敗しました:', error);
      }
    };
    
    resetStorage();
  }, []);
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>ウォークスルーをリセットしています...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
});
`;

// ステップ2: ファイルをapp/reset.jsに書き込み
const resetFilePath = path.join(__dirname, "..", "app", "reset.tsx");

try {
  fs.writeFileSync(resetFilePath, resetCode, "utf8");
  console.log("リセット画面が作成されました。");
  console.log(
    "アプリを起動し、/resetにアクセスしてください。例: http://localhost:8081/reset"
  );
} catch (err) {
  console.error("エラー:", err);
}
