// テスト環境のセットアップ
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
  mergeItem: jest.fn(() => Promise.resolve()),
}));

// Expo関連のモック
jest.mock("@expo/vector-icons", () => {
  const { View } = require("react-native");
  return {
    Ionicons: () => <View />,
    MaterialIcons: () => <View />,
    FontAwesome: () => <View />,
    // 他のアイコンライブラリも必要に応じて追加
  };
});

// Expoモジュールのモック
jest.mock("expo-constants", () => ({
  manifest: {
    extra: {
      RAKUTEN_APP_ID: "test-app-id",
    },
  },
}));

// プロセス環境変数のモック
process.env = Object.assign(process.env, { EXPO_OS: "ios" });

// 他のモックやグローバル設定をここに追加
