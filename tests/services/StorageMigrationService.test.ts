import { StorageMigrationService } from "../../services/StorageMigrationService";
import { LocalStorageService } from "../../services/LocalStorageService";

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

// モックの設定
jest.mock("../../services/auth", () => ({
  AuthService: {
    getCurrentUser: jest.fn(),
  },
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    auth: {
      getUser: jest.fn(),
    },
  },
}));
jest.mock("../../services/BookStorageService", () => ({
  BookStorageService: {
    setStorageBackend: jest.fn(),
    getAllBooks: jest.fn(),
    switchToSupabase: jest.fn(),
    switchToLocal: jest.fn(),
    clearLocalData: jest.fn(),
  },
}));
jest.mock("../../services/ClipStorageService", () => ({
  ClipStorageService: {
    setStorageBackend: jest.fn(),
    getClipsByBookId: jest.fn(),
    switchToSupabase: jest.fn(),
    switchToLocal: jest.fn(),
  },
}));
jest.mock("../../services/LocalStorageService", () => ({
  LocalStorageService: jest.fn().mockImplementation(() => ({
    clearAllData: jest.fn().mockResolvedValue(undefined),
    getLastClipBook: jest.fn().mockResolvedValue(null),
    setLastClipBook: jest.fn().mockResolvedValue(undefined),
  })),
}));
jest.mock("../../services/SupabaseStorageService", () => ({
  SupabaseStorageService: jest.fn().mockImplementation(() => ({
    saveBook: jest.fn().mockResolvedValue(undefined),
    saveClip: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe("StorageMigrationService", () => {
  // テスト前の共通設定
  beforeEach(() => {
    jest.clearAllMocks();
    // DEVフラグをモック
    global.__DEV__ = true;
  });

  // テスト用データ
  const mockUser = { id: "test-user-id", email: "test@example.com" };

  describe("initializeStorage", () => {
    it("認証済みユーザーがいる場合、ログに出力すること", async () => {
      // モックの設定 - AuthService.getCurrentUserに正しいモックを提供
      const { AuthService } = require("../../services/auth");
      AuthService.getCurrentUser.mockResolvedValueOnce(mockUser);

      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      await StorageMigrationService.initializeStorage();

      // ログが出力されたことを確認
      expect(consoleSpy).toHaveBeenCalledWith(
        "ユーザーが認証済みです - ユーザーID:",
        mockUser.id
      );

      // クリーンアップ
      consoleSpy.mockRestore();
    });

    it("未認証の場合、ログに出力すること", async () => {
      // ユーザーがいないケースをモック
      const { AuthService } = require("../../services/auth");
      AuthService.getCurrentUser.mockResolvedValueOnce(null);

      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      await StorageMigrationService.initializeStorage();

      // ログが出力されたことを確認
      expect(consoleSpy).toHaveBeenCalledWith(
        "未認証状態です、匿名認証が行われるまで待機します"
      );

      // クリーンアップ
      consoleSpy.mockRestore();
    });

    it("認証チェック中にエラーが発生した場合、エラーログを出力すること", async () => {
      // エラーケースをモック
      const mockError = new Error("Authentication error");
      const { AuthService } = require("../../services/auth");
      AuthService.getCurrentUser.mockRejectedValueOnce(mockError);

      // コンソールエラーをモック
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await StorageMigrationService.initializeStorage();

      // エラーログが出力されたか確認
      expect(consoleSpy).toHaveBeenCalledWith(
        "ストレージの初期化に失敗しました:",
        mockError
      );

      // クリーンアップ
      consoleSpy.mockRestore();
    });
  });

  describe("switchToSupabaseStorage", () => {
    it("ログ出力のみ行うこと", async () => {
      const userId = "test-user-id";
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      await StorageMigrationService.switchToSupabaseStorage(userId);

      // ログが出力されたことを確認
      expect(consoleSpy).toHaveBeenCalledWith(
        "Supabaseストレージを使用します - ユーザーID:",
        userId
      );

      // クリーンアップ
      consoleSpy.mockRestore();
    });
  });

  describe("switchToLocalStorage", () => {
    it("ログ出力のみ行うこと", async () => {
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      await StorageMigrationService.switchToLocalStorage();

      // ログが出力されたことを確認
      expect(consoleSpy).toHaveBeenCalledWith(
        "ログアウト時のストレージ切り替え（匿名認証環境では操作なし）"
      );

      // クリーンアップ
      consoleSpy.mockRestore();
    });
  });

  describe("clearLocalData", () => {
    it("LocalStorageService.clearAllDataが呼ばれること", async () => {
      // localStorageServiceのフィールドをモック
      const mockClearAllData = jest.fn().mockResolvedValue(undefined);
      const originalService = StorageMigrationService["localStorageService"];

      try {
        // 元のserviceを退避して、モック版に差し替え
        StorageMigrationService["localStorageService"] = {
          clearAllData: mockClearAllData,
        } as any;

        const consoleSpy = jest
          .spyOn(console, "log")
          .mockImplementation(() => {});

        await StorageMigrationService.clearLocalData();

        // clearAllDataが呼ばれることを確認
        expect(mockClearAllData).toHaveBeenCalled();
        // ログが出力されたことを確認
        expect(consoleSpy).toHaveBeenCalledWith(
          "最後に選択した書籍情報をクリアしました"
        );

        // クリーンアップ
        consoleSpy.mockRestore();
      } finally {
        // 元のserviceに戻す
        StorageMigrationService["localStorageService"] = originalService;
      }
    });

    it("エラーが発生した場合、エラーログを出力しエラーを再スローすること", async () => {
      const mockError = new Error("Clear data failed");
      const mockClearAllData = jest.fn().mockRejectedValue(mockError);
      const originalService = StorageMigrationService["localStorageService"];

      try {
        // 元のserviceを退避して、モック版に差し替え
        StorageMigrationService["localStorageService"] = {
          clearAllData: mockClearAllData,
        } as any;

        const consoleSpy = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});

        await expect(StorageMigrationService.clearLocalData()).rejects.toThrow(
          mockError
        );

        // エラーログが出力されたことを確認
        expect(consoleSpy).toHaveBeenCalledWith(
          "ローカルデータのクリアに失敗しました:",
          mockError
        );

        // クリーンアップ
        consoleSpy.mockRestore();
      } finally {
        // 元のserviceに戻す
        StorageMigrationService["localStorageService"] = originalService;
      }
    });
  });

  describe("migrateLocalToSupabase", () => {
    it("警告ログを出力し成功結果を返すこと", async () => {
      const consoleSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});
      const mockProgressCallback = jest.fn();

      const result = await StorageMigrationService.migrateLocalToSupabase(
        "test-user-id",
        mockProgressCallback
      );

      // 警告ログが出力されたことを確認
      expect(consoleSpy).toHaveBeenCalledWith(
        "匿名認証環境では、データ移行は不要です。すべて成功として返します。"
      );

      // 結果が適切であることを確認
      expect(result).toEqual({
        total: 0,
        processed: 0,
        failed: 0,
      });

      // コールバックは呼ばれないことを確認
      expect(mockProgressCallback).not.toHaveBeenCalled();

      // クリーンアップ
      consoleSpy.mockRestore();
    });
  });

  describe("migrateLocalDataToSupabase", () => {
    it("常にtrueを返すこと", async () => {
      const mockProgressCallback = jest.fn();
      // migrateLocalToSupabaseのスパイ
      const migrateLocalToSupabaseSpy = jest
        .spyOn(StorageMigrationService, "migrateLocalToSupabase")
        .mockResolvedValue({
          total: 0,
          processed: 0,
          failed: 0,
        });

      const result = await StorageMigrationService.migrateLocalDataToSupabase(
        "test-user-id",
        mockProgressCallback
      );

      // migrateLocalToSupabaseが呼ばれたことを確認
      expect(migrateLocalToSupabaseSpy).toHaveBeenCalledWith(
        "test-user-id",
        mockProgressCallback
      );

      // trueが返されることを確認
      expect(result).toBe(true);

      // モックの復元
      migrateLocalToSupabaseSpy.mockRestore();
    });
  });
});
