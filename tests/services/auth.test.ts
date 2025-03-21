import { supabase, AuthService } from "../../services/auth";

// Supabaseのモック
jest.mock("@supabase/supabase-js", () => {
  const mockSignInWithOtp = jest.fn();
  const mockSignOut = jest.fn();
  const mockVerifyOtp = jest.fn();
  const mockGetUser = jest.fn();
  const mockOnAuthStateChange = jest.fn();

  return {
    createClient: jest.fn(() => ({
      auth: {
        signInWithOtp: mockSignInWithOtp,
        signOut: mockSignOut,
        verifyOtp: mockVerifyOtp,
        getUser: mockGetUser,
        onAuthStateChange: mockOnAuthStateChange,
      },
    })),
  };
});

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

// コンソールエラーのモック（テスト中のエラーログを抑制）
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("signInWithEmail", () => {
    it("成功時に正しいデータを返す", async () => {
      const mockResponse = { data: { session: null }, error: null };
      (supabase.auth.signInWithOtp as jest.Mock).mockResolvedValue(
        mockResponse
      );

      const email = "test@example.com";
      const result = await AuthService.signInWithEmail(email);

      expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
        email,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("エラー発生時に例外をスローする", async () => {
      const mockError = new Error("メール送信エラー");
      (supabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const email = "test@example.com";

      await expect(AuthService.signInWithEmail(email)).rejects.toThrow(
        mockError
      );
      expect(console.error).toHaveBeenCalledWith(
        "メール認証リンク送信エラー:",
        mockError
      );
    });
  });

  describe("signOut", () => {
    it("成功時に何も返さない", async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      await expect(AuthService.signOut()).resolves.not.toThrow();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it("エラー発生時に例外をスローする", async () => {
      const mockError = new Error("ログアウトエラー");
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: mockError,
      });

      await expect(AuthService.signOut()).rejects.toThrow(mockError);
      expect(console.error).toHaveBeenCalledWith(
        "ログアウトエラー:",
        mockError
      );
    });
  });

  describe("verifyOtp", () => {
    it("成功時に正しいデータを返す", async () => {
      const mockResponse = {
        data: { session: {}, user: {} },
        error: null,
      };
      (supabase.auth.verifyOtp as jest.Mock).mockResolvedValue(mockResponse);

      const email = "test@example.com";
      const otp = "123456";
      const result = await AuthService.verifyOtp(email, otp);

      expect(supabase.auth.verifyOtp).toHaveBeenCalledWith({
        email,
        type: "email",
        token: otp,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("エラー発生時に例外をスローする", async () => {
      const mockError = new Error("OTP検証エラー");
      (supabase.auth.verifyOtp as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const email = "test@example.com";
      const otp = "123456";

      await expect(AuthService.verifyOtp(email, otp)).rejects.toThrow(
        mockError
      );
      expect(console.error).toHaveBeenCalledWith("OTP検証エラー:", mockError);
    });
  });

  describe("getCurrentUser", () => {
    it("成功時に正しいユーザー情報を返す", async () => {
      const mockUser = { id: "1", email: "test@example.com" };
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await AuthService.getCurrentUser();

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it("エラー発生時に例外をスローする", async () => {
      const mockError = new Error("ユーザー取得エラー");
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: mockError,
      });

      await expect(AuthService.getCurrentUser()).rejects.toThrow(mockError);
      expect(console.error).toHaveBeenCalledWith(
        "ユーザー取得エラー:",
        mockError
      );
    });
  });

  describe("deleteAccount", () => {
    it("成功時にアカウントが削除されること", async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        error: null,
      });

      await expect(AuthService.deleteAccount()).resolves.not.toThrow();
      expect(supabase.functions.invoke).toHaveBeenCalledWith("delete-account", {
        method: "POST",
      });
    });

    it("エラー発生時に例外をスローする", async () => {
      const mockError = new Error("アカウント削除エラー");
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        error: mockError,
      });

      await expect(AuthService.deleteAccount()).rejects.toThrow(mockError);
      expect(console.error).toHaveBeenCalledWith(
        "アカウント削除エラー:",
        mockError
      );
    });
  });
});
