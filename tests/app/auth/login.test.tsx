import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { useAuthContext } from "../../../contexts/AuthContext";
import LoginScreen from "../../../app/(auth)/login";

// モックの設定
const mockRouter = {
  replace: jest.fn(),
  isReady: true,
};

jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  Link: () => null,
}));

jest.mock("../../../contexts/AuthContext", () => ({
  useAuthContext: jest.fn(),
}));

describe("LoginScreen", () => {
  const mockSignInWithEmail = jest.fn();
  const mockVerifyOtp = jest.fn();
  const mockVerificationSuccess = false;
  const mockLoading = false;
  const mockError = null;

  beforeEach(() => {
    (useAuthContext as jest.Mock).mockReturnValue({
      signInWithEmail: mockSignInWithEmail,
      verifyOtp: mockVerifyOtp,
      verificationSuccess: mockVerificationSuccess,
      loading: mockLoading,
      error: mockError,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("メールアドレスを入力してサインインできる", async () => {
    const { getByTestId } = render(<LoginScreen />);
    const emailInput = getByTestId("email-input");
    const submitButton = getByTestId("login-button");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.press(submitButton);

    expect(mockSignInWithEmail).toHaveBeenCalledWith("test@example.com");
  });

  it("無効なメールアドレスを入力するとエラーメッセージが表示される", () => {
    const { getByTestId, getByText } = render(<LoginScreen />);
    const emailInput = getByTestId("email-input");
    const submitButton = getByTestId("login-button");

    fireEvent.changeText(emailInput, "invalid-email");
    fireEvent.press(submitButton);

    expect(getByText("有効なメールアドレスを入力してください")).toBeTruthy();
    expect(mockSignInWithEmail).not.toHaveBeenCalled();
  });

  it("ローディング中はボタンが無効化される", () => {
    (useAuthContext as jest.Mock).mockReturnValue({
      signInWithEmail: mockSignInWithEmail,
      verifyOtp: mockVerifyOtp,
      verificationSuccess: mockVerificationSuccess,
      loading: true,
      error: mockError,
    });

    const { getByTestId } = render(<LoginScreen />);
    const submitButton = getByTestId("login-button");

    expect(submitButton.props.accessibilityState.disabled).toBe(true);
  });

  it("メール送信成功後はOTPコード入力フォームが表示される", async () => {
    (useAuthContext as jest.Mock).mockReturnValue({
      signInWithEmail: mockSignInWithEmail,
      verifyOtp: mockVerifyOtp,
      verificationSuccess: mockVerificationSuccess,
      loading: false,
      error: null,
      emailSent: true,
    });

    const { getByTestId } = render(<LoginScreen />);
    const otpInput = getByTestId("otp-input");
    const verifyButton = getByTestId("verify-button");

    expect(otpInput).toBeTruthy();
    expect(verifyButton).toBeTruthy();
  });

  it("OTPコードが6桁でない場合はエラーメッセージが表示される", async () => {
    (useAuthContext as jest.Mock).mockReturnValue({
      signInWithEmail: mockSignInWithEmail,
      verifyOtp: mockVerifyOtp,
      verificationSuccess: mockVerificationSuccess,
      loading: false,
      error: null,
      emailSent: true,
    });

    const { getByTestId, getByText } = render(<LoginScreen />);
    const otpInput = getByTestId("otp-input");
    const verifyButton = getByTestId("verify-button");

    fireEvent.changeText(otpInput, "12345");
    fireEvent.press(verifyButton);

    expect(getByText("6桁のコードを入力してください")).toBeTruthy();
    expect(mockVerifyOtp).not.toHaveBeenCalled();
  });

  it("正しいOTPコードを入力すると検証が実行される", async () => {
    (useAuthContext as jest.Mock).mockReturnValue({
      signInWithEmail: mockSignInWithEmail,
      verifyOtp: mockVerifyOtp,
      verificationSuccess: mockVerificationSuccess,
      loading: false,
      error: null,
      emailSent: true,
    });

    const { getByTestId } = render(<LoginScreen />);
    const otpInput = getByTestId("otp-input");
    const verifyButton = getByTestId("verify-button");

    fireEvent.changeText(otpInput, "123456");
    fireEvent.press(verifyButton);

    expect(mockVerifyOtp).toHaveBeenCalledWith("123456");
  });

  it("認証成功時はホーム画面に遷移する", async () => {
    (useAuthContext as jest.Mock).mockReturnValue({
      signInWithEmail: mockSignInWithEmail,
      verifyOtp: mockVerifyOtp,
      verificationSuccess: true,
      loading: false,
      error: null,
      emailSent: true,
    });

    render(<LoginScreen />);

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith("/(tabs)");
    });
  });

  it("エラーが発生した場合はエラーメッセージが表示される", () => {
    const errorMessage = "認証に失敗しました";
    (useAuthContext as jest.Mock).mockReturnValue({
      signInWithEmail: mockSignInWithEmail,
      verifyOtp: mockVerifyOtp,
      verificationSuccess: mockVerificationSuccess,
      loading: false,
      error: errorMessage,
    });

    const { getByTestId } = render(<LoginScreen />);
    expect(getByTestId("error-message")).toBeTruthy();
  });
});
