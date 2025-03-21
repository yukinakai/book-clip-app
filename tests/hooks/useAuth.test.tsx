import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useAuth } from "../../hooks/useAuth";
import { AuthService, supabase } from "../../services/auth";

// AuthServiceとsupabaseのモック
jest.mock("../../services/auth", () => {
  const mockSubscription = {
    unsubscribe: jest.fn(),
  };

  const mockSupabase = {
    auth: {
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: mockSubscription },
      })),
    },
  };

  return {
    AuthService: {
      getCurrentUser: jest.fn(),
      signInWithEmail: jest.fn(),
      verifyOtp: jest.fn(),
      signOut: jest.fn(),
      deleteAccount: jest.fn(),
    },
    supabase: mockSupabase,
  };
});

describe("useAuth", () => {
  // テスト前にモックをリセット
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("初期状態でloading=trueになっている", async () => {
    // getCurrentUserが解決する前の状態をテスト
    (AuthService.getCurrentUser as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // 永遠に解決しないPromise
    );

    const { result } = renderHook(() => useAuth());

    // 初期状態ではloadingがtrueになっていることを確認
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.emailSent).toBe(false);
  });

  it("認証済みユーザーが存在する場合、正しくユーザー情報がセットされる", async () => {
    const mockUser = { id: "1", email: "user@example.com" };
    (AuthService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toEqual(mockUser);
  });

  it("認証情報取得時にエラーが発生した場合、エラー状態がセットされる", async () => {
    const mockError = new Error("認証エラー");
    (AuthService.getCurrentUser as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toEqual(mockError);
  });

  it("無視すべきエラーメッセージの場合、エラー状態にセットされない", async () => {
    const ignoredError = new Error("Auth session missing");
    (AuthService.getCurrentUser as jest.Mock).mockRejectedValue(ignoredError);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
  });

  it("signInWithEmail成功時、emailSent=trueになる", async () => {
    (AuthService.getCurrentUser as jest.Mock).mockResolvedValue(null);
    (AuthService.signInWithEmail as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // 初期状態を確認
    expect(result.current.emailSent).toBe(false);

    // signInWithEmailを実行
    act(() => {
      result.current.signInWithEmail("test@example.com");
    });

    // loading=trueになっていることを確認
    expect(result.current.loading).toBe(true);

    // 状態の更新を待つ
    await waitFor(() => expect(result.current.loading).toBe(false));

    // 正しくemailSent=trueになっていることを確認
    expect(result.current.emailSent).toBe(true);
    expect(AuthService.signInWithEmail).toHaveBeenCalledWith(
      "test@example.com"
    );
  });

  it("signInWithEmailエラー時、error状態がセットされる", async () => {
    const mockError = new Error("メール送信エラー");
    (AuthService.getCurrentUser as jest.Mock).mockResolvedValue(null);
    (AuthService.signInWithEmail as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // signInWithEmailを実行
    act(() => {
      result.current.signInWithEmail("test@example.com");
    });

    // 状態の更新を待つ
    await waitFor(() => expect(result.current.loading).toBe(false));

    // エラーがセットされていることを確認
    expect(result.current.error).toEqual(mockError);
    expect(result.current.emailSent).toBe(false);
  });

  it("verifyOtp成功時、verificationSuccess=trueになる", async () => {
    (AuthService.getCurrentUser as jest.Mock).mockResolvedValue(null);
    (AuthService.verifyOtp as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // verifyOtpを実行
    act(() => {
      result.current.verifyOtp("123456");
    });

    // 状態の更新を待つ
    await waitFor(() => expect(result.current.loading).toBe(false));

    // verificationSuccessがtrueになっていることを確認
    expect(result.current.verificationSuccess).toBe(true);
    expect(AuthService.verifyOtp).toHaveBeenCalledWith("123456");
  });

  it("verifyOtpエラー時、error状態がセットされる", async () => {
    const mockError = new Error("OTP検証エラー");
    (AuthService.getCurrentUser as jest.Mock).mockResolvedValue(null);
    (AuthService.verifyOtp as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // verifyOtpを実行
    act(() => {
      result.current.verifyOtp("123456");
    });

    // 状態の更新を待つ
    await waitFor(() => expect(result.current.loading).toBe(false));

    // エラーがセットされていることを確認
    expect(result.current.error).toEqual(mockError);
  });

  it("signOut成功時、ユーザー情報がクリアされる", async () => {
    const mockUser = { id: "1", email: "user@example.com" };
    (AuthService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    (AuthService.signOut as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // 初期状態でユーザーが設定されていることを確認
    expect(result.current.user).toEqual(mockUser);

    // signOutを実行
    act(() => {
      result.current.signOut();
    });

    // 状態の更新を待つ
    await waitFor(() => expect(result.current.loading).toBe(false));

    // ユーザー情報がクリアされていることを確認
    expect(result.current.user).toBeNull();
    expect(result.current.verificationSuccess).toBe(false);
    expect(AuthService.signOut).toHaveBeenCalled();
  });

  it("signOutエラー時、error状態がセットされる", async () => {
    const mockError = new Error("サインアウトエラー");
    const mockUser = { id: "1", email: "user@example.com" };
    (AuthService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    (AuthService.signOut as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // signOutを実行
    act(() => {
      result.current.signOut();
    });

    // 状態の更新を待つ
    await waitFor(() => expect(result.current.loading).toBe(false));

    // エラーがセットされていることを確認
    expect(result.current.error).toEqual(mockError);
    // ユーザー情報は変更されないことを確認
    expect(result.current.user).toEqual(mockUser);
  });

  it("onAuthStateChangeイベントが発生した場合、ユーザー状態が更新される", async () => {
    const mockUser = { id: "1", email: "user@example.com" };
    (AuthService.getCurrentUser as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // 初期状態でユーザーがnullであることを確認
    expect(result.current.user).toBeNull();

    // onAuthStateChangeのコールバックを取得
    const onAuthStateChange = supabase.auth.onAuthStateChange as jest.Mock;
    const callback = onAuthStateChange.mock.calls[0][0];

    // コールバックを実行して状態の変更をシミュレート
    act(() => {
      callback("SIGNED_IN", { user: mockUser });
    });

    // ユーザー状態が更新されていることを確認
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.verificationSuccess).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it("コンポーネントのアンマウント時にsubscriptionがアンサブスクライブされる", async () => {
    (AuthService.getCurrentUser as jest.Mock).mockResolvedValue(null);

    const { result, unmount } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // コンポーネントをアンマウント
    unmount();

    // unsubscribeが呼ばれていることを確認
    const subscription = supabase.auth.onAuthStateChange().data.subscription;
    expect(subscription.unsubscribe).toHaveBeenCalled();
  });

  describe("deleteAccount", () => {
    it("アカウント削除が成功した場合、ユーザー状態がリセットされること", async () => {
      const { result } = renderHook(() => useAuth());

      // 初期状態でユーザーをセット
      act(() => {
        result.current.user = {
          id: "test-user",
          email: "test@example.com",
        } as any;
      });

      // アカウント削除を実行
      await act(async () => {
        await result.current.deleteAccount();
      });

      expect(AuthService.deleteAccount).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("アカウント削除でエラーが発生した場合、エラー状態が設定されること", async () => {
      const mockError = new Error("アカウント削除エラー");
      (AuthService.deleteAccount as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.deleteAccount();
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.loading).toBe(false);
      expect(result.current.user).not.toBeNull(); // ユーザー状態は変更されない
    });
  });
});
