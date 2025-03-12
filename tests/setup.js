// テスト環境のセットアップ
jest.mock("@react-native-async-storage/async-storage", () =>
  require("./__mocks__/@react-native-async-storage/async-storage")
);

// 他のモックやグローバル設定をここに追加
