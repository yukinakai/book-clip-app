const { exec } = require("child_process");

// デバイスにテスト用コードを注入してAsyncStorageをリセット
const command = `
npx react-native start --reset-cache & 
sleep 5 && 
echo "
import AsyncStorage from '@react-native-async-storage/async-storage';
async function resetOnboarding() {
  try {
    await AsyncStorage.removeItem('@bookclip:onboarding_complete');
    console.log('オンボーディング状態をリセットしました');
  } catch (e) {
    console.error('リセット失敗:', e);
  }
}
resetOnboarding();" | npx react-native log-android
`;

console.log("オンボーディング状態をリセットしています...");
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`エラー: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`エラー出力: ${stderr}`);
    return;
  }
  console.log(stdout);
});
