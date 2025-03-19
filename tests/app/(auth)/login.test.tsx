import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginScreen from "../../../app/(auth)/login";
import { useAuthContext } from "../../../contexts/AuthContext";

// AuthContextのモック
jest.mock("../../../contexts/AuthContext", () => ({
  useAuthContext: jest.fn(),
}));

describe("LoginScreen", () => {
  const mockSignInWithEmail = jest.fn();

  beforeEach(() => {
    (useAuthContext as jest.Mock).mockReturnValue({
      signInWithEmail: mockSignInWithEmail,
      loading: false,
      error: null,
      emailSent: false,
    });
  });

  it("メールアドレスを入力してボタンをクリックするとsignInWithEmailが呼ばれる", async () => {
    const { getByText, getByLabelText } = render(<LoginScreen />);
    const emailInput = getByLabelText("メールアドレス");
    const submitButton = getByText("ログインリンクを送信");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockSignInWithEmail).toHaveBeenCalledWith("test@example.com");
    });
  });

  it("メールアドレスが無効の場合、エラーメッセージが表示される", () => {
    const { getByText, getByLabelText } = render(<LoginScreen />);
    const emailInput = getByLabelText("メールアドレス");
    const submitButton = getByText("ログインリンクを送信");

    fireEvent.changeText(emailInput, "invalid-email");
    fireEvent.press(submitButton);

    expect(getByText("有効なメールアドレスを入力してください")).toBeTruthy();
    expect(mockSignInWithEmail).not.toHaveBeenCalled();
  });

  it("ローディング中はボタンが無効化される", () => {
    (useAuthContext as jest.Mock).mockReturnValue({
      signInWithEmail: mockSignInWithEmail,
      loading: true,
      error: null,
      emailSent: false,
    });

    const { getByText } = render(<LoginScreen />);
    const submitButton = getByText("ログインリンクを送信");

    expect(submitButton.props.disabled).toBe(true);
  });

  it("メール送信成功後は成功メッセージが表示される", () => {
    (useAuthContext as jest.Mock).mockReturnValue({
      signInWithEmail: mockSignInWithEmail,
      loading: false,
      error: null,
      emailSent: true,
    });

    const { getByText } = render(<LoginScreen />);
    expect(getByText(/にログインリンクを送信しました。/)).toBeTruthy();
    expect(getByText("戻る")).toBeTruthy();
  });

  it("エラーが発生した場合、エラーメッセージが表示される", () => {
    const errorMessage = "認証エラーが発生しました";
    (useAuthContext as jest.Mock).mockReturnValue({
      signInWithEmail: mockSignInWithEmail,
      loading: false,
      error: new Error(errorMessage),
      emailSent: false,
    });

    const { getByText } = render(<LoginScreen />);
    expect(getByText(errorMessage)).toBeTruthy();
  });
});
