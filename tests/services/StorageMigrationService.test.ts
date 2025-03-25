import { StorageMigrationService } from "../../services/StorageMigrationService";
import { AuthService } from "../../services/auth";
import { BookStorageService } from "../../services/BookStorageService";
import { ClipStorageService } from "../../services/ClipStorageService";
import { LocalStorageService } from "../../services/LocalStorageService";
import { SupabaseStorageService } from "../../services/SupabaseStorageService";
import { Book, Clip } from "../../constants/MockData";
import { supabase } from "../../services/auth";

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
    auth: {
      getUser: jest.fn(),
    },
  },
}));
jest.mock("../../services/BookStorageService", () => ({
  BookStorageService: {
    setStorageBackend: jest.fn(),
    getAllBooks: jest.fn(),
  },
}));
jest.mock("../../services/ClipStorageService", () => ({
  ClipStorageService: {
    setStorageBackend: jest.fn(),
    getClipsByBookId: jest.fn(),
  },
}));
jest.mock("../../services/LocalStorageService", () => ({
  LocalStorageService: jest.fn().mockImplementation(() => ({
    getAllBooks: jest.fn().mockResolvedValue([]),
    getClipsByBookId: jest.fn().mockResolvedValue([]),
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
    // mockInitializeStorageを追加
    jest
      .spyOn(StorageMigrationService, "initializeStorage")
      .mockResolvedValue(undefined);
  });

  // テスト用データ
  const mockUser = { id: "test-user-id", email: "test@example.com" };
  const mockBooks: Book[] = [
    {
      id: "book1",
      title: "Book 1",
      author: "Author 1",
      coverImage: "cover1.jpg",
    },
    {
      id: "book2",
      title: "Book 2",
      author: "Author 2",
      coverImage: "cover2.jpg",
    },
  ];
  const mockClips: Clip[] = [
    {
      id: "clip1",
      bookId: "book1",
      text: "Clip 1",
      page: 10,
      createdAt: "2023-01-01T00:00:00Z",
    },
    {
      id: "clip2",
      bookId: "book1",
      text: "Clip 2",
      page: 20,
      createdAt: "2023-01-02T00:00:00Z",
    },
    {
      id: "clip3",
      bookId: "book2",
      text: "Clip 3",
      page: 30,
      createdAt: "2023-01-03T00:00:00Z",
    },
  ];

  describe("initializeStorage", () => {
    it("認証済みユーザーがいる場合、Supabaseストレージを使用するように初期化されること", async () => {
      // モックの設定
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      await StorageMigrationService.initializeStorage();

      // SupabaseStorageServiceが正しく作成されたか確認
      expect(SupabaseStorageService).toHaveBeenCalledWith(mockUser.id);

      // BookStorageServiceとClipStorageServiceの設定が正しく行われたか確認
      expect(BookStorageService.setStorageBackend).toHaveBeenCalled();
      expect(ClipStorageService.setStorageBackend).toHaveBeenCalled();
    });

    it("認証済みユーザーがいない場合、ローカルストレージを使用するように初期化されること", async () => {
      // ユーザーがいないケースをモック
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await StorageMigrationService.initializeStorage();

      // LocalStorageServiceが正しく作成されたか確認
      expect(LocalStorageService).toHaveBeenCalled();

      // BookStorageServiceとClipStorageServiceの設定が正しく行われたか確認
      expect(BookStorageService.setStorageBackend).toHaveBeenCalled();
      expect(ClipStorageService.setStorageBackend).toHaveBeenCalled();
    });

    it("認証チェック中にエラーが発生した場合、ローカルストレージにフォールバックすること", async () => {
      // エラーケースをモック
      const mockError = new Error("Authentication error");
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: mockError,
      });

      // コンソールエラーをモック
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await StorageMigrationService.initializeStorage();

      // エラーログが出力されたか確認
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to initialize storage:",
        mockError
      );

      // LocalStorageServiceが正しく作成されたか確認
      expect(LocalStorageService).toHaveBeenCalled();

      // BookStorageServiceとClipStorageServiceの設定が正しく行われたか確認
      expect(BookStorageService.setStorageBackend).toHaveBeenCalled();
      expect(ClipStorageService.setStorageBackend).toHaveBeenCalled();

      // モックを復元
      consoleSpy.mockRestore();
    });
  });

  describe("switchToSupabaseStorage", () => {
    it("SupabaseStorageに正しく切り替えられること", async () => {
      const userId = "test-user-id";

      await StorageMigrationService.switchToSupabaseStorage(userId);

      // SupabaseStorageServiceが正しく作成されたか確認
      expect(SupabaseStorageService).toHaveBeenCalledWith(userId);

      // BookStorageServiceとClipStorageServiceの設定が正しく行われたか確認
      expect(BookStorageService.setStorageBackend).toHaveBeenCalled();
      expect(ClipStorageService.setStorageBackend).toHaveBeenCalled();
      expect(BookStorageService.switchToSupabase).toHaveBeenCalled();
      expect(ClipStorageService.switchToSupabase).toHaveBeenCalled();
    });
  });

  describe("switchToLocalStorage", () => {
    it("ローカルストレージに正しく切り替えられること", async () => {
      await StorageMigrationService.switchToLocalStorage();

      // LocalStorageServiceが正しく作成されたか確認
      expect(LocalStorageService).toHaveBeenCalled();

      // BookStorageServiceとClipStorageServiceの設定が正しく行われたか確認
      expect(BookStorageService.setStorageBackend).toHaveBeenCalled();
      expect(ClipStorageService.setStorageBackend).toHaveBeenCalled();
      expect(BookStorageService.switchToLocal).toHaveBeenCalled();
      expect(ClipStorageService.switchToLocal).toHaveBeenCalled();
    });
  });

  describe("migrateLocalToSupabase", () => {
    it("ローカルデータがSupabaseに正しく移行されること", async () => {
      // モックデータ
      const mockBooks = [
        { id: "book1", title: "Book 1" },
        { id: "book2", title: "Book 2" },
      ];
      const mockClips = [
        { id: "clip1", bookId: "book1", text: "Clip 1" },
        { id: "clip2", bookId: "book1", text: "Clip 2" },
        { id: "clip3", bookId: "book2", text: "Clip 3" },
      ];

      // LocalStorageServiceとSupabaseStorageServiceのモック
      const mockLocalStorage = new LocalStorageService();
      const mockSupabaseStorage = new SupabaseStorageService("test-user");

      // getAllBooksとgetClipsByBookIdの戻り値を設定
      (mockLocalStorage.getAllBooks as jest.Mock).mockResolvedValue(mockBooks);
      (mockLocalStorage.getClipsByBookId as jest.Mock).mockImplementation(
        (bookId) => {
          return Promise.resolve(
            mockClips.filter((clip) => clip.bookId === bookId)
          );
        }
      );

      // 移行プロセスを実行
      const result = await StorageMigrationService.migrateLocalToSupabase(
        mockLocalStorage,
        mockSupabaseStorage,
        { onProgress: jest.fn() }
      );

      // 結果が正しいか確認
      expect(result).toEqual({
        total: mockBooks.length + mockClips.length,
        processed: mockBooks.length + mockClips.length,
        failed: 0,
      });

      // saveBookメソッドが正しい回数呼ばれたことを確認
      expect(mockSupabaseStorage.saveBook).toHaveBeenCalledTimes(
        mockBooks.length
      );

      // saveClipメソッドが正しい回数呼ばれたことを確認
      expect(mockSupabaseStorage.saveClip).toHaveBeenCalledTimes(
        mockClips.length
      );
    });

    it("一部のデータ移行に失敗した場合、結果に失敗数が反映されること", async () => {
      // モックデータ
      const mockBooks = [
        { id: "book1", title: "Book 1" },
        { id: "book2", title: "Book 2" },
      ];
      const mockClips = [
        { id: "clip1", bookId: "book1", text: "Clip 1" },
        { id: "clip2", bookId: "book1", text: "Clip 2" },
        { id: "clip3", bookId: "book2", text: "Clip 3" },
      ];

      // LocalStorageServiceとSupabaseStorageServiceのモック
      const mockLocalStorage = new LocalStorageService();
      const mockSupabaseStorage = new SupabaseStorageService("test-user");

      // getAllBooksとgetClipsByBookIdの戻り値を設定
      (mockLocalStorage.getAllBooks as jest.Mock).mockResolvedValue(mockBooks);
      (mockLocalStorage.getClipsByBookId as jest.Mock).mockImplementation(
        (bookId) => {
          return Promise.resolve(
            mockClips.filter((clip) => clip.bookId === bookId)
          );
        }
      );

      // 一部のsaveBookとsaveClip操作が失敗するようにモック
      (mockSupabaseStorage.saveBook as jest.Mock)
        .mockResolvedValueOnce(undefined) // 1回目は成功
        .mockRejectedValueOnce(new Error("Failed to save book")); // 2回目は失敗

      (mockSupabaseStorage.saveClip as jest.Mock)
        .mockResolvedValueOnce(undefined) // 1回目は成功
        .mockRejectedValueOnce(new Error("Failed to save clip")) // 2回目は失敗
        .mockResolvedValueOnce(undefined); // 3回目は成功

      // 移行プロセスを実行
      const result = await StorageMigrationService.migrateLocalToSupabase(
        mockLocalStorage,
        mockSupabaseStorage,
        { onProgress: jest.fn() }
      );

      // 結果が正しいか確認
      expect(result).toEqual({
        total: mockBooks.length + mockClips.length,
        processed: mockBooks.length + mockClips.length - 2,
        failed: 2,
      });
    });

    it("移行処理全体が失敗した場合、エラーがスローされプログレスが失敗状態になること", async () => {
      const userId = "test-user-id";
      const mockError = new Error("Failed to get data");

      // データ取得時のエラーをモック
      const mockLocalStorage = {
        getAllBooks: jest.fn().mockRejectedValue(mockError),
        getAllClips: jest.fn().mockResolvedValue([]),
      };

      (LocalStorageService as jest.Mock).mockImplementation(
        () => mockLocalStorage
      );

      // コンソールエラーをモック
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      // プログレスコールバックのモック
      const mockProgressCallback = jest.fn();

      // 移行実行とエラー確認
      await expect(
        StorageMigrationService.migrateLocalToSupabase(
          mockLocalStorage,
          new SupabaseStorageService(userId),
          { onProgress: mockProgressCallback }
        )
      ).rejects.toThrow(mockError);

      // エラーログが出力されたか確認
      expect(consoleSpy).toHaveBeenCalledWith("Migration failed:", mockError);

      // エラー状態のプログレスコールバックが呼ばれたか確認
      expect(mockProgressCallback).toHaveBeenCalledWith({
        total: 0,
        current: 0,
        status: "failed",
        error: mockError,
      });

      consoleSpy.mockRestore();
    });
  });

  describe("clearLocalData", () => {
    it("ローカルデータが正しくクリアされること", async () => {
      const mockLocalStorage = {
        clearAllData: jest.fn().mockResolvedValue(undefined),
      };

      (LocalStorageService as jest.Mock).mockImplementation(
        () => mockLocalStorage
      );

      await StorageMigrationService.clearLocalData();

      expect(mockLocalStorage.clearAllData).toHaveBeenCalled();
    });
  });
});
