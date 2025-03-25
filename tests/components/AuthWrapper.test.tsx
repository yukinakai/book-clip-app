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
  testID = "test-component",
}: {
  isLoggedIn?: boolean;
  user?: any;
  testID?: string;
}) => (
  <View testID={testID}>
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

  it("ローディング中はActivityIndicatorを表示し、子コンポーネントを表示しない", () => {
    (useAuthContext as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
      migrationProgress: { total: 0, current: 0, status: "completed" },
      showMigrationProgress: false,
      showMigrationConfirm: false,
      hasLocalData: false,
      cancelMigration: jest.fn(),
      migrateLocalDataToSupabase: jest.fn(),
    });

    const { getByTestId, queryByTestId } = render(
      <AuthWrapper>
        <TestComponent />
      </AuthWrapper>
    );

    // ActivityIndicatorが表示される
    expect(getByTestId("activity-indicator")).toBeTruthy();

    // 子コンポーネントは表示されない
    expect(queryByTestId("test-component")).toBeNull();
    expect(queryByTestId("login-status")).toBeNull();
  });

  it("ユーザーが未認証の場合は子コンポーネントにisLoggedIn=falseを渡す", () => {
    (useAuthContext as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      migrationProgress: { total: 0, current: 0, status: "completed" },
      showMigrationProgress: false,
      showMigrationConfirm: false,
      hasLocalData: false,
      cancelMigration: jest.fn(),
      migrateLocalDataToSupabase: jest.fn(),
    });

    const { getByTestId, queryByTestId } = render(
      <AuthWrapper>
        <TestComponent />
      </AuthWrapper>
    );

    expect(getByTestId("login-status").props.children[1]).toBe("未ログイン");
    // user情報は渡されないので、user-emailは存在しない
    expect(queryByTestId("user-email")).toBeNull();
  });

  it("ユーザーが認証済みの場合は子コンポーネントにisLoggedIn=trueとuserを渡す", () => {
    (useAuthContext as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
      migrationProgress: { total: 0, current: 0, status: "completed" },
      showMigrationProgress: false,
      showMigrationConfirm: false,
      hasLocalData: false,
      cancelMigration: jest.fn(),
      migrateLocalDataToSupabase: jest.fn(),
    });

    const { getByTestId } = render(
      <AuthWrapper>
        <TestComponent />
      </AuthWrapper>
    );

    expect(getByTestId("login-status").props.children[1]).toBe("ログイン済み");
    expect(getByTestId("user-email").props.children[1]).toBe(mockUser.email);
  });

  it("複数の子コンポーネントがある場合、すべての子にプロパティを渡す", () => {
    (useAuthContext as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
      migrationProgress: { total: 0, current: 0, status: "completed" },
      showMigrationProgress: false,
      showMigrationConfirm: false,
      hasLocalData: false,
      cancelMigration: jest.fn(),
      migrateLocalDataToSupabase: jest.fn(),
    });

    const { getByTestId } = render(
      <AuthWrapper>
        <TestComponent testID="first-component" />
        <TestComponent testID="second-component" />
      </AuthWrapper>
    );

    // 両方のコンポーネントが表示されている
    expect(getByTestId("first-component")).toBeTruthy();
    expect(getByTestId("second-component")).toBeTruthy();

    // 両方のコンポーネントに正しいログイン状態が渡されている
    expect(
      getByTestId("first-component").findByProps({ testID: "login-status" })
        .props.children[1]
    ).toBe("ログイン済み");
    expect(
      getByTestId("second-component").findByProps({ testID: "login-status" })
        .props.children[1]
    ).toBe("ログイン済み");
  });

  it("テキストノードなどの非Reactエレメントの子要素は表示されない", () => {
    (useAuthContext as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      migrationProgress: { total: 0, current: 0, status: "completed" },
      showMigrationProgress: false,
      showMigrationConfirm: false,
      hasLocalData: false,
      cancelMigration: jest.fn(),
      migrateLocalDataToSupabase: jest.fn(),
    });

    const { queryByText, getByTestId } = render(
      <AuthWrapper>
        テキストノード
        <TestComponent />
      </AuthWrapper>
    );

    // テキストノードは表示されない（React.isValidElementのチェックで弾かれる）
    expect(queryByText("テキストノード")).toBeNull();

    // Reactコンポーネントは表示される
    expect(getByTestId("test-component")).toBeTruthy();
  });
});
