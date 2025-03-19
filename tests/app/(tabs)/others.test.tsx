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

// console.logをモック
const mockConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});

describe("OthersScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  it("コンポーネントが正しくレンダリングされること", () => {
    render(<OthersScreen />);
    expect(screen.getByText("その他")).toBeTruthy();
  });

  it("正しいタイトルが表示されること", () => {
    render(<OthersScreen />);
    const title = screen.getByText("その他");
    expect(title).toBeTruthy();
  });

  it("全てのメニュー項目が表示されること", () => {
    render(<OthersScreen />);
    expect(screen.getByText("会員登録")).toBeTruthy();
    expect(screen.getByText("ログイン")).toBeTruthy();
    expect(screen.getByText("退会")).toBeTruthy();
    expect(screen.getByText("利用規約")).toBeTruthy();
    expect(screen.getByText("プライバシーポリシー")).toBeTruthy();
    expect(screen.getByText("不具合報告・問い合わせ")).toBeTruthy();
  });

  it("メニュー項目をタップすると対応するハンドラ関数が呼び出されること", () => {
    render(<OthersScreen />);

    const registerButton = screen.getByText("会員登録");
    fireEvent.press(registerButton);
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "メニュー「register」が押されました"
    );

    const loginButton = screen.getByText("ログイン");
    fireEvent.press(loginButton);
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "メニュー「login」が押されました"
    );

    const withdrawButton = screen.getByText("退会");
    fireEvent.press(withdrawButton);
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "メニュー「withdraw」が押されました"
    );
  });
});
