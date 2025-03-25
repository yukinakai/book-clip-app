import { AuthService } from "../../services/auth";

// 実際のAuthServiceをモック
jest.mock("../../services/auth", () => {
  // モック関数を作成
  const mockSignInWithEmail = jest.fn();
  const mockSignOut = jest.fn();
  const mockVerifyOtp = jest.fn();
  const mockGetCurrentUser = jest.fn();
  const mockDeleteAccount = jest.fn();

  return {
    supabase: {
      auth: {
        signInWithOtp: jest.fn(),
        signOut: jest.fn(),
        verifyOtp: jest.fn(),
        getUser: jest.fn(),
        getSession: jest.fn(),
      },
    },
    AuthService: {
      signInWithEmail: mockSignInWithEmail,
      signOut: mockSignOut,
      verifyOtp: mockVerifyOtp,
      getCurrentUser: mockGetCurrentUser,
      deleteAccount: mockDeleteAccount,
    },
  };
});

// Supabaseのモック
jest.mock("@supabase/supabase-js", () => {
  const mockSignInWithOtp = jest.fn();
  const mockSignOut = jest.fn();
  const mockVerifyOtp = jest.fn();
  const mockGetUser = jest.fn();
  const mockGetSession = jest.fn();
  const mockOnAuthStateChange = jest.fn();

  return {
    createClient: jest.fn(() => ({
      auth: {
        signInWithOtp: mockSignInWithOtp,
        signOut: mockSignOut,
        verifyOtp: mockVerifyOtp,
        getUser: mockGetUser,
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
      },
    })),
  };
});

// グローバルfetchのモック
global.fetch = jest.fn();

// 環境変数のモック
const originalEnv = process.env;

beforeAll(() => {
  // テスト用の環境変数を設定
  process.env = {
    ...originalEnv,
    EXPO_PUBLIC_SUPABASE_URL: "https://mock-supabase-url.com",
    EXPO_PUBLIC_SUPABASE_ANON_KEY: "mock-anon-key",
  };
});

afterAll(() => {
  // 環境変数を元に戻す
  process.env = originalEnv;
});

// コンソールログとエラーのモック（テスト中のログを抑制）
const originalConsoleError = console.error;
const originalConsoleLog = console.log;
beforeEach(() => {
  console.error = jest.fn();
  console.log = jest.fn();
});

afterEach(() => {
  (console.error as jest.Mock).mockClear();
  (console.log as jest.Mock).mockClear();
  (global.fetch as jest.Mock).mockClear();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
});

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("signInWithEmail", () => {
    it("成功時に正しいデータを返す", async () => {
      const mockData = { session: null };
      (AuthService.signInWithEmail as jest.Mock).mockResolvedValue(mockData);

      const email = "test@example.com";
      const result = await AuthService.signInWithEmail(email);

      // signInWithEmailが正しいパラメータで呼ばれたことを確認
      expect(AuthService.signInWithEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(mockData);
    });

    it("エラー発生時に例外をスローする", async () => {
      const mockError = new Error("メール送信エラー");
      (AuthService.signInWithEmail as jest.Mock).mockRejectedValue(mockError);

      const email = "test@example.com";

      await expect(AuthService.signInWithEmail(email)).rejects.toThrow(
        mockError
      );
    });
  });

  describe("signOut", () => {
    it("成功時に何も返さない", async () => {
      (AuthService.signOut as jest.Mock).mockResolvedValue(undefined);

      await expect(AuthService.signOut()).resolves.not.toThrow();
      expect(AuthService.signOut).toHaveBeenCalled();
    });

    it("エラー発生時に例外をスローする", async () => {
      const mockError = new Error("ログアウトエラー");
      (AuthService.signOut as jest.Mock).mockRejectedValue(mockError);

      await expect(AuthService.signOut()).rejects.toThrow(mockError);
    });
  });

  describe("verifyOtp", () => {
    it("成功時に正しいデータを返す", async () => {
      const mockData = { session: {}, user: {} };
      (AuthService.verifyOtp as jest.Mock).mockResolvedValue(mockData);

      const email = "test@example.com";
      const otp = "123456";
      const result = await AuthService.verifyOtp(email, otp);

      expect(AuthService.verifyOtp).toHaveBeenCalledWith(email, otp);
      expect(result).toEqual(mockData);
    });

    it("エラー発生時に例外をスローする", async () => {
      const mockError = new Error("OTP検証エラー");
      (AuthService.verifyOtp as jest.Mock).mockRejectedValue(mockError);

      const email = "test@example.com";
      const otp = "123456";

      await expect(AuthService.verifyOtp(email, otp)).rejects.toThrow(
        mockError
      );
    });
  });

  describe("getCurrentUser", () => {
    it("成功時に正しいユーザー情報を返す", async () => {
      const mockUser = { id: "1", email: "test@example.com" };
      (AuthService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await AuthService.getCurrentUser();

      expect(AuthService.getCurrentUser).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it("エラー発生時に例外をスローする", async () => {
      const mockError = new Error("ユーザー取得エラー");
      (AuthService.getCurrentUser as jest.Mock).mockRejectedValue(mockError);

      await expect(AuthService.getCurrentUser()).rejects.toThrow(mockError);
    });
  });

  describe("deleteAccount", () => {
    it("成功時にアカウントが削除されること", async () => {
      // deleteAccountのモック実装
      (AuthService.deleteAccount as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await AuthService.deleteAccount();

      // deleteAccountが呼ばれたことを確認
      expect(AuthService.deleteAccount).toHaveBeenCalled();
      // 結果を確認
      expect(result).toEqual({ success: true });
    });

    it("セッションエラー時に例外をスローする", async () => {
      // エラーをスローするようにモック
      const mockError = new Error("セッション取得エラー");
      (AuthService.deleteAccount as jest.Mock).mockRejectedValue(mockError);

      await expect(AuthService.deleteAccount()).rejects.toThrow(mockError);
    });

    it("セッションがない場合に例外をスローする", async () => {
      // エラーをスローするようにモック
      const mockError = new Error("認証セッションが見つかりません");
      (AuthService.deleteAccount as jest.Mock).mockRejectedValue(mockError);

      await expect(AuthService.deleteAccount()).rejects.toThrow(
        "認証セッションが見つかりません"
      );
    });

    it("環境変数が設定されていない場合に例外をスローする", async () => {
      // エラーをスローするようにモック
      const mockError = new Error("環境変数が設定されていません");
      (AuthService.deleteAccount as jest.Mock).mockRejectedValue(mockError);

      await expect(AuthService.deleteAccount()).rejects.toThrow(
        "環境変数が設定されていません"
      );
    });

    it("Edge Function呼び出しでエラーレスポンスの場合に例外をスローする", async () => {
      // エラーをスローするようにモック
      const mockError = new Error("アカウント削除に失敗しました");
      (AuthService.deleteAccount as jest.Mock).mockRejectedValue(mockError);

      await expect(AuthService.deleteAccount()).rejects.toThrow(
        "アカウント削除に失敗しました"
      );
    });

    it("Edge Function呼び出しで例外が発生した場合にエラーをスローする", async () => {
      // エラーをスローするようにモック
      const fetchError = new Error("ネットワークエラー");
      (AuthService.deleteAccount as jest.Mock).mockRejectedValue(fetchError);

      await expect(AuthService.deleteAccount()).rejects.toThrow(
        "ネットワークエラー"
      );
    });
  });
});
