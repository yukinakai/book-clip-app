import React from "react";
import { render } from "@testing-library/react-native";
import { AuthWrapper } from "../../components/AuthWrapper";
import { useAuthContext } from "../../contexts/AuthContext";
import { View, Text } from "react-native";

// AuthContextのモック
jest.mock("../../contexts/AuthContext", () => ({
  useAuthContext: jest.fn(),
}));

// TestComponentを追加
const TestComponent = ({
  isLoggedIn,
  user,
}: {
  isLoggedIn?: boolean;
  user?: any;
}) => (
  <View testID="test-component">
    <Text>Test Content</Text>
    <Text testID="login-status">
      ログイン状態: {isLoggedIn ? "ログイン済み" : "未ログイン"}
    </Text>
    {user && <Text testID="user-email">ユーザーメール: {user.email}</Text>}
  </View>
);

describe("AuthWrapper", () => {
  const mockUser = { id: "1", email: "test@example.com" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ローディング中はActivityIndicatorを表示", () => {
    (useAuthContext as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
    });

    const { getByTestId } = render(
      <AuthWrapper>
        <TestComponent />
      </AuthWrapper>
    );

    expect(getByTestId("activity-indicator")).toBeTruthy();
  });

  it("ユーザーが未認証の場合はisLoggedIn=falseを渡す", () => {
    (useAuthContext as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });

    const { getByTestId } = render(
      <AuthWrapper>
        <TestComponent />
      </AuthWrapper>
    );

    expect(getByTestId("login-status").props.children[1]).toBe("未ログイン");
  });

  it("ユーザーが認証済みの場合はisLoggedIn=trueとuserを渡す", () => {
    (useAuthContext as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
    });

    const { getByTestId } = render(
      <AuthWrapper>
        <TestComponent />
      </AuthWrapper>
    );

    expect(getByTestId("login-status").props.children[1]).toBe("ログイン済み");
    expect(getByTestId("user-email").props.children[1]).toBe(mockUser.email);
  });
});
