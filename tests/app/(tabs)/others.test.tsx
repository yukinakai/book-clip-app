import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import OthersScreen from "../../../app/(tabs)/others";

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

// useRouterをモック
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
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
    render(<OthersScreen />);

    const logoutButton = screen.getByText("ログアウト");
    fireEvent.press(logoutButton);
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "メニュー「logout」が押されました"
    );

    const withdrawButton = screen.getByText("退会");
    fireEvent.press(withdrawButton);
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "メニュー「withdraw」が押されました"
    );
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
});
