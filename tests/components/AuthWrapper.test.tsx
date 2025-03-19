import React from "react";
import { render } from "@testing-library/react-native";
import { AuthWrapper } from "../../components/AuthWrapper";
import { useAuthContext } from "../../contexts/AuthContext";

// AuthContextのモック
jest.mock("../../contexts/AuthContext", () => ({
  useAuthContext: jest.fn(),
}));

// expo-routerのモック
jest.mock("expo-router", () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
  })),
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
  })),
  Redirect: jest.fn().mockImplementation(({ href }) => (
    <div testID="redirect" data-href={href}>
      Redirecting to {href}
    </div>
  )),
}));

// TestWrapperコンポーネント追加
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return children;
};

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
      <TestWrapper>
        <AuthWrapper>
          <React.Fragment>Test Content</React.Fragment>
        </AuthWrapper>
      </TestWrapper>
    );

    expect(getByTestId("activity-indicator")).toBeTruthy();
  });

  it("ユーザーが未認証の場合はログイン画面にリダイレクト", () => {
    (useAuthContext as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });

    const { getByTestId } = render(
      <TestWrapper>
        <AuthWrapper>
          <React.Fragment>Test Content</React.Fragment>
        </AuthWrapper>
      </TestWrapper>
    );

    expect(getByTestId("redirect")).toBeTruthy();
  });

  it("ユーザーが認証済みの場合は子コンポーネントを表示", () => {
    (useAuthContext as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
    });

    const { getByText } = render(
      <TestWrapper>
        <AuthWrapper>
          <React.Fragment>Test Content</React.Fragment>
        </AuthWrapper>
      </TestWrapper>
    );

    expect(getByText("Test Content")).toBeTruthy();
  });
});
