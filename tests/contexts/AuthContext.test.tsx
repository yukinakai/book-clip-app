import React from "react";
import { render, renderHook } from "@testing-library/react-native";
import { Text } from "react-native";
import { AuthProvider, useAuthContext } from "../../contexts/AuthContext";

// useAuthフックをモック
jest.mock("../../hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

// テスト用のコンシューマーコンポーネント
const AuthConsumer = () => {
  const { user, loading, error } = useAuthContext();
  return (
    <>
      <Text testID="user-data">{user ? user.email : "ユーザーなし"}</Text>
      <Text testID="loading-state">{loading ? "ロード中" : "ロード完了"}</Text>
      {error && <Text testID="error-message">{error.message}</Text>}
    </>
  );
};

describe("AuthContext", () => {
  // テスト前にモックをリセット
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("AuthProviderが子コンポーネントに適切な値を提供する", () => {
    // useAuthフックのモック値を設定
    const mockUser = { id: "1", email: "test@example.com" };
    const mockUseAuth = require("../../hooks/useAuth").useAuth;
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      emailSent: false,
      signInWithEmail: jest.fn(),
      signOut: jest.fn(),
      deleteAccount: jest.fn(),
    });

    // コンポーネントをレンダリング
    const { getByTestId } = render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    // 適切な値が子コンポーネントに渡されていることを確認
    expect(getByTestId("user-data").props.children).toBe(mockUser.email);
    expect(getByTestId("loading-state").props.children).toBe("ロード完了");
  });

  it("AuthProviderの値が変更された場合、子コンポーネントに反映される", () => {
    // 初期状態
    const mockUseAuth = require("../../hooks/useAuth").useAuth;
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      emailSent: false,
      signInWithEmail: jest.fn(),
      signOut: jest.fn(),
      deleteAccount: jest.fn(),
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

    // モックの状態を変更
    const mockUser = { id: "1", email: "test@example.com" };
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      emailSent: false,
      signInWithEmail: jest.fn(),
      signOut: jest.fn(),
      deleteAccount: jest.fn(),
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
      signInWithEmail: jest.fn(),
      signOut: jest.fn(),
      deleteAccount: jest.fn(),
    });

    // コンポーネントをレンダリング
    const { getByTestId } = render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    // エラーメッセージが表示されていることを確認
    expect(getByTestId("error-message").props.children).toBe(mockError.message);
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
