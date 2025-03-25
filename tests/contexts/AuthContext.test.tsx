import React from "react";
import {
  render,
  renderHook,
  act,
  waitFor,
} from "@testing-library/react-native";
import { Text } from "react-native";
import { AuthProvider, useAuthContext } from "../../contexts/AuthContext";

// useAuthフックをモック
jest.mock("../../hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

// StorageMigrationServiceをモック
jest.mock("../../services/StorageMigrationService", () => ({
  StorageMigrationService: {
    initializeStorage: jest.fn().mockResolvedValue(undefined),
  },
  MigrationProgress: {},
}));

// テスト用のコンシューマーコンポーネント
const AuthConsumer = () => {
  const { user, loading, error, migrationProgress, showMigrationProgress } =
    useAuthContext();
  return (
    <>
      <Text testID="user-data">{user ? user.email : "ユーザーなし"}</Text>
      <Text testID="loading-state">{loading ? "ロード中" : "ロード完了"}</Text>
      {error && <Text testID="error-message">{error.message}</Text>}
      <Text testID="migration-status">{migrationProgress.status}</Text>
      <Text testID="migration-visible">
        {showMigrationProgress ? "表示中" : "非表示"}
      </Text>
    </>
  );
};

describe("AuthContext", () => {
  // テスト前にモックをリセット
  beforeEach(() => {
    jest.clearAllMocks();

    // デフォルトのuseAuthモック値を設定
    const mockUseAuth = require("../../hooks/useAuth").useAuth;
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      emailSent: false,
      migrationProgress: { total: 0, current: 0, status: "completed" },
      showMigrationProgress: false,
      signInWithEmail: jest.fn(),
      signOut: jest.fn(),
      deleteAccount: jest.fn(),
      migrateLocalDataToSupabase: jest.fn(),
    });

    // StorageMigrationService.initializeStorageをリセット
    const mockInitializeStorage =
      require("../../services/StorageMigrationService").StorageMigrationService
        .initializeStorage;
    mockInitializeStorage.mockClear();
  });

  it("初期化時にStorageMigrationService.initializeStorageが呼ばれること", async () => {
    const mockInitializeStorage =
      require("../../services/StorageMigrationService").StorageMigrationService
        .initializeStorage;

    // テスト前は呼ばれていないことを確認
    expect(mockInitializeStorage).not.toHaveBeenCalled();

    // コンポーネントをレンダリング
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    // 非同期で呼ばれるため、待機する
    await waitFor(() => {
      expect(mockInitializeStorage).toHaveBeenCalled();
    });
  });

  it("AuthProviderが子コンポーネントに適切な値を提供する", async () => {
    // useAuthフックのモック値を設定
    const mockUser = { id: "1", email: "test@example.com" };
    const mockUseAuth = require("../../hooks/useAuth").useAuth;
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      emailSent: false,
      migrationProgress: { total: 10, current: 5, status: "migrating" },
      showMigrationProgress: true,
      signInWithEmail: jest.fn(),
      signOut: jest.fn(),
      deleteAccount: jest.fn(),
      migrateLocalDataToSupabase: jest.fn(),
    });

    // コンポーネントをレンダリング
    const { getByTestId } = render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    // initializeStorageが呼ばれることを確認
    const mockInitializeStorage =
      require("../../services/StorageMigrationService").StorageMigrationService
        .initializeStorage;

    // 非同期で呼ばれるため、待機する
    await waitFor(() => {
      expect(mockInitializeStorage).toHaveBeenCalled();
    });

    // 適切な値が子コンポーネントに渡されていることを確認
    expect(getByTestId("user-data").props.children).toBe(mockUser.email);
    expect(getByTestId("loading-state").props.children).toBe("ロード完了");
    expect(getByTestId("migration-status").props.children).toBe("migrating");
    expect(getByTestId("migration-visible").props.children).toBe("表示中");
  });

  it("AuthProviderの値が変更された場合、子コンポーネントに反映される", () => {
    // 初期状態
    const mockUseAuth = require("../../hooks/useAuth").useAuth;
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      emailSent: false,
      migrationProgress: { total: 0, current: 0, status: "completed" },
      showMigrationProgress: false,
      signInWithEmail: jest.fn(),
      signOut: jest.fn(),
      deleteAccount: jest.fn(),
      migrateLocalDataToSupabase: jest.fn(),
    });

    // コンポーネントをレンダリング
    const { getByTestId, rerender } = render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    // 初期状態を確認
    expect(getByTestId("user-data").props.children).toBe("ユーザーなし");
    expect(getByTestId("loading-state").props.children).toBe("ロード中");
    expect(getByTestId("migration-status").props.children).toBe("completed");
    expect(getByTestId("migration-visible").props.children).toBe("非表示");

    // モックの状態を変更
    const mockUser = { id: "1", email: "test@example.com" };
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      emailSent: false,
      migrationProgress: { total: 10, current: 5, status: "migrating" },
      showMigrationProgress: true,
      signInWithEmail: jest.fn(),
      signOut: jest.fn(),
      deleteAccount: jest.fn(),
      migrateLocalDataToSupabase: jest.fn(),
    });

    // 再レンダリング
    rerender(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    // 更新された値が反映されていることを確認
    expect(getByTestId("user-data").props.children).toBe(mockUser.email);
    expect(getByTestId("loading-state").props.children).toBe("ロード完了");
    expect(getByTestId("migration-status").props.children).toBe("migrating");
    expect(getByTestId("migration-visible").props.children).toBe("表示中");
  });

  it("エラー状態が子コンポーネントに正しく反映される", () => {
    // エラー状態を設定
    const mockError = new Error("認証エラーが発生しました");
    const mockUseAuth = require("../../hooks/useAuth").useAuth;
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: mockError,
      emailSent: false,
      migrationProgress: {
        total: 0,
        current: 0,
        status: "failed",
        error: mockError,
      },
      showMigrationProgress: true,
      signInWithEmail: jest.fn(),
      signOut: jest.fn(),
      deleteAccount: jest.fn(),
      migrateLocalDataToSupabase: jest.fn(),
    });

    // コンポーネントをレンダリング
    const { getByTestId } = render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    // エラーメッセージが表示されていることを確認
    expect(getByTestId("error-message").props.children).toBe(mockError.message);
    expect(getByTestId("migration-status").props.children).toBe("failed");
    expect(getByTestId("migration-visible").props.children).toBe("表示中");
  });

  it("useAuthContextがAuthProviderの外で使用された場合にエラーをスローする", () => {
    // コンソールエラーを抑制（テスト中のエラーメッセージを表示しないため）
    const originalConsoleError = console.error;
    console.error = jest.fn();

    // renderHookを使用してフックをレンダリング（Providerなし）
    expect(() => {
      renderHook(() => useAuthContext());
    }).toThrow("useAuthContext must be used within an AuthProvider");

    // コンソールエラーを元に戻す
    console.error = originalConsoleError;
  });
});
