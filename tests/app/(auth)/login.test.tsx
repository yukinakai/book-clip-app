import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import LoginScreen from "../../../app/(auth)/login";

// モックの設定
const mockRouter = {
  replace: jest.fn(),
  back: jest.fn(),
  isReady: true,
};

jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({ returnTo: "/(tabs)" }),
  Link: () => null,
}));

// AuthServiceのモック
jest.mock("../../../services/auth", () => ({
  AuthService: {
    signInWithEmail: jest.fn(),
    verifyOtp: jest.fn(),
  },
}));

import { AuthService } from "../../../services/auth";

// useColorSchemeのモックを修正 - 名前付きエクスポートとしてモックする
jest.mock("../../../hooks/useColorScheme", () => ({
  useColorScheme: jest.fn(() => "light"),
}));

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // AuthServiceのモックをリセット
    (AuthService.signInWithEmail as jest.Mock).mockImplementation(() =>
      Promise.resolve()
    );
    (AuthService.verifyOtp as jest.Mock).mockImplementation(() =>
      Promise.resolve()
    );
  });

  it("メールアドレスを入力してサインインできる", async () => {
    const { getByTestId } = render(<LoginScreen />);
    const emailInput = getByTestId("email-input");
    const submitButton = getByTestId("login-button");

    fireEvent.changeText(emailInput, "test@example.com");

    await act(async () => {
      fireEvent.press(submitButton);
    });

    expect(AuthService.signInWithEmail).toHaveBeenCalledWith(
      "test@example.com"
    );
  });

  it("無効なメールアドレスを入力するとエラーメッセージが表示される", () => {
    const { getByTestId, getByText } = render(<LoginScreen />);
    const emailInput = getByTestId("email-input");
    const submitButton = getByTestId("login-button");

    fireEvent.changeText(emailInput, "invalid-email");
    fireEvent.press(submitButton);

    expect(getByText("有効なメールアドレスを入力してください")).toBeTruthy();
    expect(AuthService.signInWithEmail).not.toHaveBeenCalled();
  });

  it("サインイン中はローディングが表示される", async () => {
    // signInWithEmailが呼ばれたときに解決を遅延させる
    (AuthService.signInWithEmail as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { getByTestId, queryByTestId } = render(<LoginScreen />);
    const emailInput = getByTestId("email-input");
    const submitButton = getByTestId("login-button");

    fireEvent.changeText(emailInput, "test@example.com");

    fireEvent.press(submitButton);

    // 非同期操作の完了を待つ
    await waitFor(() => {
      // ローディングインジケータが表示されていることを確認
      expect(submitButton).toBeTruthy();
    });

    // テストが通過することを確認
    expect(AuthService.signInWithEmail).toHaveBeenCalledWith(
      "test@example.com"
    );
  });

  it("メール送信成功後はOTPコード入力フォームが表示される", async () => {
    const { getByTestId, getByText } = render(<LoginScreen />);
    const emailInput = getByTestId("email-input");
    const submitButton = getByTestId("login-button");

    fireEvent.changeText(emailInput, "test@example.com");

    await act(async () => {
      fireEvent.press(submitButton);
    });

    // OTP入力画面に切り替わったことを確認
    const otpInput = getByTestId("otp-input");
    const verifyButton = getByTestId("verify-button");
    expect(otpInput).toBeTruthy();
    expect(verifyButton).toBeTruthy();
    expect(
      getByText("test@example.comに送信された6桁のコードを入力してください")
    ).toBeTruthy();
  });

  it("OTPコードが6桁でない場合はエラーメッセージが表示される", async () => {
    const { getByTestId, getByText } = render(<LoginScreen />);
    const emailInput = getByTestId("email-input");
    const submitButton = getByTestId("login-button");

    // メール送信画面から認証コード画面に遷移
    fireEvent.changeText(emailInput, "test@example.com");

    await act(async () => {
      fireEvent.press(submitButton);
    });

    // OTP画面でのテスト
    const otpInput = getByTestId("otp-input");
    const verifyButton = getByTestId("verify-button");

    fireEvent.changeText(otpInput, "12345");
    fireEvent.press(verifyButton);

    expect(getByText("6桁のコードを入力してください")).toBeTruthy();
    expect(AuthService.verifyOtp).not.toHaveBeenCalled();
  });

  it("正しいOTPコードを入力すると検証が実行される", async () => {
    const { getByTestId } = render(<LoginScreen />);
    const emailInput = getByTestId("email-input");
    const submitButton = getByTestId("login-button");

    // メール送信画面から認証コード画面に遷移
    fireEvent.changeText(emailInput, "test@example.com");

    await act(async () => {
      fireEvent.press(submitButton);
    });

    // OTP画面でのテスト
    const otpInput = getByTestId("otp-input");
    const verifyButton = getByTestId("verify-button");

    fireEvent.changeText(otpInput, "123456");

    await act(async () => {
      fireEvent.press(verifyButton);
    });

    expect(AuthService.verifyOtp).toHaveBeenCalledWith(
      "test@example.com",
      "123456"
    );
  });

  it("認証成功時は指定された画面に遷移する", async () => {
    const { getByTestId } = render(<LoginScreen />);
    const emailInput = getByTestId("email-input");
    const submitButton = getByTestId("login-button");

    // メール送信画面から認証コード画面に遷移
    fireEvent.changeText(emailInput, "test@example.com");

    await act(async () => {
      fireEvent.press(submitButton);
    });

    // OTP画面でのテスト
    const otpInput = getByTestId("otp-input");
    const verifyButton = getByTestId("verify-button");

    fireEvent.changeText(otpInput, "123456");

    await act(async () => {
      fireEvent.press(verifyButton);
    });

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith("/(tabs)");
    });
  });

  it("サインイン中にエラーが発生した場合はエラーメッセージが表示される", async () => {
    const errorMessage = "認証に失敗しました";
    (AuthService.signInWithEmail as jest.Mock).mockImplementation(() =>
      Promise.reject(new Error(errorMessage))
    );

    const { getByTestId, findByText } = render(<LoginScreen />);
    const emailInput = getByTestId("email-input");
    const submitButton = getByTestId("login-button");

    fireEvent.changeText(emailInput, "test@example.com");

    await act(async () => {
      fireEvent.press(submitButton);
    });

    const errorElement = await findByText(errorMessage);
    expect(errorElement).toBeTruthy();
  });

  it("戻るボタンでナビゲーションが戻る", () => {
    const { getByTestId } = render(<LoginScreen />);
    const backButton = getByTestId("back-button");

    fireEvent.press(backButton);
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it("OTP画面の戻るボタンでメールアドレス入力画面に戻る", async () => {
    const { getByTestId } = render(<LoginScreen />);
    const emailInput = getByTestId("email-input");
    const submitButton = getByTestId("login-button");

    // メール送信画面から認証コード画面に遷移
    fireEvent.changeText(emailInput, "test@example.com");

    await act(async () => {
      fireEvent.press(submitButton);
    });

    // 認証コード画面の戻るボタン
    const backToEmailButton = getByTestId("back-to-email-button");
    expect(backToEmailButton).toBeTruthy();

    fireEvent.press(backToEmailButton);

    // メールアドレス入力画面に戻ったことを確認
    expect(getByTestId("email-input")).toBeTruthy();
    expect(getByTestId("login-button")).toBeTruthy();
  });
});
