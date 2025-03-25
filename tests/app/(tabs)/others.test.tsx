import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react-native";
import OthersScreen from "../../../app/(tabs)/others";

// AsyncStorageをモック
jest.mock("@react-native-async-storage/async-storage", () => ({
  removeItem: jest.fn().mockResolvedValue(null),
}));

// useColorSchemeフックをモック
jest.mock("../../../hooks/useColorScheme", () => ({
  useColorScheme: () => "light",
}));

// Ioniconsをモック - Jestモッキングのベストプラクティスに従う
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    Ionicons: (props) => {
      return React.createElement(View, {
        testID: `icon-${props.name}`,
        ...props,
      });
    },
  };
});

// DataMigrationProgressコンポーネントをモック
jest.mock("../../../components/DataMigrationProgress", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    DataMigrationProgress: (props) => {
      return React.createElement(View, {
        testID: "data-migration-progress",
        ...props,
      });
    },
  };
});

// useRouterをモック
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

// useAuthContextをモック
jest.mock("../../../contexts/AuthContext", () => ({
  useAuthContext: jest.fn(),
}));

// AuthContextの値を設定するヘルパー関数
const mockUseAuthContext = (isLoggedIn = false) => {
  const { useAuthContext } = require("../../../contexts/AuthContext");
  useAuthContext.mockReturnValue({
    user: isLoggedIn ? { id: "test-user-id", email: "test@example.com" } : null,
    isLoggedIn,
    signOut: jest.fn(),
    deleteAccount: jest.fn(),
    migrateLocalDataToSupabase: jest.fn(),
    migrationProgress: {
      total: 0,
      current: 0,
      status: "completed",
    },
    showMigrationProgress: false,
  });
};

// console.logをモック
const mockConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});

describe("OthersScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthContext(false); // デフォルトは未ログイン状態
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  it("コンポーネントが正しくレンダリングされること", () => {
    render(<OthersScreen />);
    expect(screen.getByText("その他")).toBeTruthy();
  });

  it("未ログイン時に正しいメニュー項目が表示されること", () => {
    mockUseAuthContext(false);
    render(<OthersScreen />);

    // 未ログイン時のメニュー項目
    expect(screen.getByText("会員登録")).toBeTruthy();
    expect(screen.getByText("ログイン")).toBeTruthy();
    expect(screen.getByText("利用規約")).toBeTruthy();
    expect(screen.getByText("プライバシーポリシー")).toBeTruthy();
    expect(screen.getByText("不具合報告・問い合わせ")).toBeTruthy();

    // ログイン済み時のみのメニュー項目は表示されないこと
    expect(screen.queryByText("ログアウト")).toBeNull();
    expect(screen.queryByText("退会")).toBeNull();

    // 開発用データ同期ボタンが表示されないこと
    expect(screen.queryByText("ローカルデータを同期（開発用）")).toBeNull();
  });

  it("ログイン済み時に正しいメニュー項目が表示されること", () => {
    mockUseAuthContext(true);
    render(<OthersScreen />);

    // ログイン済み時のメニュー項目
    expect(screen.getByText("ログアウト")).toBeTruthy();
    expect(screen.getByText("退会")).toBeTruthy();
    expect(screen.getByText("利用規約")).toBeTruthy();
    expect(screen.getByText("プライバシーポリシー")).toBeTruthy();
    expect(screen.getByText("不具合報告・問い合わせ")).toBeTruthy();

    // 未ログイン時のみのメニュー項目は表示されないこと
    expect(screen.queryByText("会員登録")).toBeNull();
    expect(screen.queryByText("ログイン")).toBeNull();
  });

  it("未ログイン時、メニュー項目をタップすると適切なハンドラ関数が呼び出されること", () => {
    mockUseAuthContext(false);
    render(<OthersScreen />);

    // 会員登録ボタンをタップ
    const registerButton = screen.getByText("会員登録");
    fireEvent.press(registerButton);
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "メニュー「register」が押されました"
    );
    expect(mockPush).toHaveBeenCalledWith(
      "/login?mode=register&returnTo=/(tabs)/others"
    );

    // ログインボタンをタップ
    const loginButton = screen.getByText("ログイン");
    fireEvent.press(loginButton);
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "メニュー「login」が押されました"
    );
    expect(mockPush).toHaveBeenCalledWith("/login?returnTo=/(tabs)/others");
  });

  it("ログイン済み時、メニュー項目をタップすると適切なハンドラ関数が呼び出されること", () => {
    mockUseAuthContext(true);
    const { useAuthContext } = require("../../../contexts/AuthContext");
    const mockSignOut = jest.fn();
    const mockDeleteAccount = jest.fn();
    useAuthContext.mockReturnValue({
      user: { id: "test-user-id", email: "test@example.com" },
      isLoggedIn: true,
      signOut: mockSignOut,
      deleteAccount: mockDeleteAccount,
      migrateLocalDataToSupabase: jest.fn(),
      migrationProgress: { total: 0, current: 0, status: "completed" },
      showMigrationProgress: false,
    });

    render(<OthersScreen />);

    const logoutButton = screen.getByText("ログアウト");
    fireEvent.press(logoutButton);
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "メニュー「logout」が押されました"
    );
    expect(mockSignOut).toHaveBeenCalled();

    const withdrawButton = screen.getByText("退会");
    fireEvent.press(withdrawButton);
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "メニュー「withdraw」が押されました"
    );
    // 退会ボタンを押すと退会確認ダイアログが表示されること
    expect(screen.getByText("退会の確認")).toBeTruthy();
  });

  it("共通メニュー項目（利用規約など）をタップすると適切なハンドラ関数が呼び出されること", () => {
    mockUseAuthContext(false);
    render(<OthersScreen />);

    const termsButton = screen.getByText("利用規約");
    fireEvent.press(termsButton);
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "メニュー「terms」が押されました"
    );

    const privacyButton = screen.getByText("プライバシーポリシー");
    fireEvent.press(privacyButton);
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "メニュー「privacy」が押されました"
    );

    const contactButton = screen.getByText("不具合報告・問い合わせ");
    fireEvent.press(contactButton);
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "メニュー「contact」が押されました"
    );
  });

  // 退会確認ダイアログのテスト
  it("退会確認ダイアログで「退会する」をタップすると退会処理が実行されること", async () => {
    mockUseAuthContext(true);
    const { useAuthContext } = require("../../../contexts/AuthContext");
    const mockDeleteAccount = jest.fn().mockResolvedValue(true);
    useAuthContext.mockReturnValue({
      user: { id: "test-user-id", email: "test@example.com" },
      isLoggedIn: true,
      signOut: jest.fn(),
      deleteAccount: mockDeleteAccount,
      migrateLocalDataToSupabase: jest.fn(),
      migrationProgress: { total: 0, current: 0, status: "completed" },
      showMigrationProgress: false,
    });

    render(<OthersScreen />);

    // 退会ボタンをタップして退会確認ダイアログを表示
    const withdrawButton = screen.getByText("退会");
    fireEvent.press(withdrawButton);

    // 退会確認ダイアログの「退会する」ボタンをタップ
    const confirmButton = screen.getByText("退会する");
    await act(async () => {
      fireEvent.press(confirmButton);
      // deleteAccountの完了を待つ
      await mockDeleteAccount();
    });

    // deleteAccountメソッドが呼ばれること
    expect(mockDeleteAccount).toHaveBeenCalled();
    // ホーム画面に遷移すること
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
  });

  it("退会成功時にAsyncStorageから認証情報が削除されること", async () => {
    const AsyncStorage = require("@react-native-async-storage/async-storage");
    mockUseAuthContext(true);
    const { useAuthContext } = require("../../../contexts/AuthContext");
    const mockDeleteAccount = jest.fn().mockResolvedValue(true);
    useAuthContext.mockReturnValue({
      user: { id: "test-user-id", email: "test@example.com" },
      isLoggedIn: true,
      signOut: jest.fn(),
      deleteAccount: mockDeleteAccount,
      migrateLocalDataToSupabase: jest.fn(),
      migrationProgress: { total: 0, current: 0, status: "completed" },
      showMigrationProgress: false,
    });

    render(<OthersScreen />);

    // 退会ボタンをタップして退会確認ダイアログを表示
    const withdrawButton = screen.getByText("退会");
    fireEvent.press(withdrawButton);

    // 退会確認ダイアログの「退会する」ボタンをタップ
    const confirmButton = screen.getByText("退会する");
    await act(async () => {
      fireEvent.press(confirmButton);
      // deleteAccountの完了を待つ
      await mockDeleteAccount();
    });

    // AsyncStorageのremoveItemが正しく呼ばれたことを確認
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("supabase.auth.token");
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
      "supabase.auth.refreshToken"
    );
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
  });

  it("退会処理が失敗した場合(falseが返却)、ホーム画面に遷移しないこと", async () => {
    mockUseAuthContext(true);
    const { useAuthContext } = require("../../../contexts/AuthContext");
    const mockDeleteAccount = jest.fn().mockResolvedValue(false);
    useAuthContext.mockReturnValue({
      user: { id: "test-user-id", email: "test@example.com" },
      isLoggedIn: true,
      signOut: jest.fn(),
      deleteAccount: mockDeleteAccount,
      migrateLocalDataToSupabase: jest.fn(),
      migrationProgress: { total: 0, current: 0, status: "completed" },
      showMigrationProgress: false,
    });

    const mockConsoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<OthersScreen />);

    // 退会ボタンをタップして退会確認ダイアログを表示
    const withdrawButton = screen.getByText("退会");
    fireEvent.press(withdrawButton);

    // 退会確認ダイアログの「退会する」ボタンをタップ
    const confirmButton = screen.getByText("退会する");

    await act(async () => {
      fireEvent.press(confirmButton);
      // deleteAccountの完了を待つ
      await mockDeleteAccount();
    });

    // エラーがログに出力されること
    expect(mockConsoleError).toHaveBeenCalledWith(
      "退会処理が失敗しました、ダイアログは閉じましたが退会は完了していません",
      expect.anything()
    );

    // AsyncStorageからの認証情報削除が呼び出されないこと
    const AsyncStorage = require("@react-native-async-storage/async-storage");
    expect(AsyncStorage.removeItem).not.toHaveBeenCalled();

    mockConsoleError.mockRestore();
  });

  it("退会処理中はローディング状態が表示されること", async () => {
    mockUseAuthContext(true);
    const { useAuthContext } = require("../../../contexts/AuthContext");
    // 退会処理を遅延させるためのモック
    const mockDeleteAccount = jest.fn().mockImplementation(() => {
      return new Promise((resolve) => setTimeout(resolve, 100));
    });
    useAuthContext.mockReturnValue({
      user: { id: "test-user-id", email: "test@example.com" },
      isLoggedIn: true,
      signOut: jest.fn(),
      deleteAccount: mockDeleteAccount,
      migrateLocalDataToSupabase: jest.fn(),
      migrationProgress: { total: 0, current: 0, status: "completed" },
      showMigrationProgress: false,
    });

    render(<OthersScreen />);

    // 退会ボタンをタップして退会確認ダイアログを表示
    const withdrawButton = screen.getByText("退会");
    fireEvent.press(withdrawButton);

    // 退会確認ダイアログの「退会する」ボタンをタップ
    const confirmButton = screen.getByText("退会する");
    fireEvent.press(confirmButton);

    // ローディング状態が表示されること
    expect(screen.getByTestId("withdraw-loading")).toBeTruthy();
  });

  it("退会処理が失敗した場合、エラーがログに出力されること", async () => {
    mockUseAuthContext(true);
    const { useAuthContext } = require("../../../contexts/AuthContext");
    const mockError = new Error("退会処理に失敗しました");
    const mockDeleteAccount = jest.fn().mockRejectedValue(mockError);
    useAuthContext.mockReturnValue({
      user: { id: "test-user-id", email: "test@example.com" },
      isLoggedIn: true,
      signOut: jest.fn(),
      deleteAccount: mockDeleteAccount,
      migrateLocalDataToSupabase: jest.fn(),
      migrationProgress: { total: 0, current: 0, status: "completed" },
      showMigrationProgress: false,
    });

    // console.errorをモック
    const mockConsoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<OthersScreen />);

    // 退会ボタンをタップして退会確認ダイアログを表示
    const withdrawButton = screen.getByText("退会");
    fireEvent.press(withdrawButton);

    // 退会確認ダイアログの「退会する」ボタンをタップ
    const confirmButton = screen.getByText("退会する");
    fireEvent.press(confirmButton);

    // エラーがログに出力されること
    await expect(mockDeleteAccount).rejects.toThrow("退会処理に失敗しました");
    expect(mockConsoleError).toHaveBeenCalledWith("退会処理エラー:", mockError);

    // クリーンアップ
    mockConsoleError.mockRestore();
  });

  it("退会確認ダイアログで「キャンセル」をタップするとダイアログが閉じること", () => {
    mockUseAuthContext(true);
    render(<OthersScreen />);

    // 退会ボタンをタップして退会確認ダイアログを表示
    const withdrawButton = screen.getByText("退会");
    fireEvent.press(withdrawButton);

    // 退会確認ダイアログの「キャンセル」ボタンをタップ
    const cancelButton = screen.getByText("キャンセル");
    fireEvent.press(cancelButton);

    // ダイアログが閉じること
    expect(screen.queryByText("退会の確認")).toBeNull();
  });

  // データ移行機能のテスト
  it("開発モードでログイン時、データ移行ボタンが表示されること", () => {
    // __DEV__フラグを一時的にtrueに設定
    const originalDev = global.__DEV__;
    global.__DEV__ = true;

    mockUseAuthContext(true);
    render(<OthersScreen />);

    // データ移行ボタンが表示されること
    expect(screen.getByText("ローカルデータを同期（開発用）")).toBeTruthy();

    // __DEV__フラグを元に戻す
    global.__DEV__ = originalDev;
  });

  it("データ移行ボタンをタップするとmigrateLocalDataToSupabaseが呼ばれること", () => {
    // __DEV__フラグを一時的にtrueに設定
    const originalDev = global.__DEV__;
    global.__DEV__ = true;

    mockUseAuthContext(true);
    const { useAuthContext } = require("../../../contexts/AuthContext");
    const mockMigrateLocalDataToSupabase = jest.fn();
    useAuthContext.mockReturnValue({
      user: { id: "test-user-id", email: "test@example.com" },
      isLoggedIn: true,
      signOut: jest.fn(),
      deleteAccount: jest.fn(),
      migrateLocalDataToSupabase: mockMigrateLocalDataToSupabase,
      migrationProgress: { total: 0, current: 0, status: "completed" },
      showMigrationProgress: false,
    });

    render(<OthersScreen />);

    // データ移行ボタンをタップ
    const migrateButton = screen.getByText("ローカルデータを同期（開発用）");
    fireEvent.press(migrateButton);

    // migrateLocalDataToSupabaseが呼ばれること
    expect(mockMigrateLocalDataToSupabase).toHaveBeenCalled();

    // __DEV__フラグを元に戻す
    global.__DEV__ = originalDev;
  });

  it("移行進捗ダイアログが表示されること", () => {
    mockUseAuthContext(true);
    const { useAuthContext } = require("../../../contexts/AuthContext");
    useAuthContext.mockReturnValue({
      user: { id: "test-user-id", email: "test@example.com" },
      isLoggedIn: true,
      signOut: jest.fn(),
      deleteAccount: jest.fn(),
      migrateLocalDataToSupabase: jest.fn(),
      migrationProgress: { total: 10, current: 5, status: "migrating" },
      showMigrationProgress: true,
    });

    render(<OthersScreen />);

    // 移行進捗ダイアログが表示されること
    expect(screen.getByTestId("data-migration-progress")).toBeTruthy();
  });
});
