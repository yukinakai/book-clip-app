import { StorageMigrationService } from "../../services/StorageMigrationService";
import { AuthService } from "../../services/auth";
import { BookStorageService } from "../../services/BookStorageService";
import { ClipStorageService } from "../../services/ClipStorageService";
import { LocalStorageService } from "../../services/LocalStorageService";
import { SupabaseStorageService } from "../../services/SupabaseStorageService";
import { Book, Clip } from "../../constants/MockData";

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
jest.mock("../../services/auth");
jest.mock("../../services/BookStorageService");
jest.mock("../../services/ClipStorageService");
jest.mock("../../services/LocalStorageService");
jest.mock("../../services/SupabaseStorageService");

describe("StorageMigrationService", () => {
  // テスト前の共通設定
  beforeEach(() => {
    jest.clearAllMocks();
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
      // AuthServiceのモック設定
      (AuthService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      // SupabaseStorageServiceのコンストラクタモック
      (SupabaseStorageService as jest.Mock).mockImplementation(() => {
        return {
          /* モックインスタンス */
        };
      });

      await StorageMigrationService.initializeStorage();

      // SupabaseStorageServiceが正しく作成されたか確認
      expect(SupabaseStorageService).toHaveBeenCalledWith(mockUser.id);

      // BookStorageServiceとClipStorageServiceの設定が正しく行われたか確認
      expect(BookStorageService.setStorageBackend).toHaveBeenCalled();
      expect(ClipStorageService.setStorageBackend).toHaveBeenCalled();
      expect(BookStorageService.switchToSupabase).toHaveBeenCalled();
      expect(ClipStorageService.switchToSupabase).toHaveBeenCalled();
    });

    it("認証済みユーザーがいない場合、ローカルストレージを使用するように初期化されること", async () => {
      // 未認証状態をモック
      (AuthService.getCurrentUser as jest.Mock).mockResolvedValue(null);

      await StorageMigrationService.initializeStorage();

      // LocalStorageServiceが正しく作成されたか確認
      expect(LocalStorageService).toHaveBeenCalled();

      // BookStorageServiceとClipStorageServiceの設定が正しく行われたか確認
      expect(BookStorageService.setStorageBackend).toHaveBeenCalled();
      expect(ClipStorageService.setStorageBackend).toHaveBeenCalled();
      expect(BookStorageService.switchToLocal).toHaveBeenCalled();
      expect(ClipStorageService.switchToLocal).toHaveBeenCalled();
    });

    it("認証チェック中にエラーが発生した場合、ローカルストレージにフォールバックすること", async () => {
      // 認証エラーをモック
      const mockError = new Error("Authentication error");
      (AuthService.getCurrentUser as jest.Mock).mockRejectedValue(mockError);

      // コンソールエラーをモック
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await StorageMigrationService.initializeStorage();

      // エラーログが出力されたか確認
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to initialize storage:",
        mockError
      );

      // ローカルストレージにフォールバックしたか確認
      expect(LocalStorageService).toHaveBeenCalled();
      expect(BookStorageService.setStorageBackend).toHaveBeenCalled();
      expect(ClipStorageService.setStorageBackend).toHaveBeenCalled();
      expect(BookStorageService.switchToLocal).toHaveBeenCalled();
      expect(ClipStorageService.switchToLocal).toHaveBeenCalled();

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
      const userId = "test-user-id";

      // ローカルストレージにデータがある状態をモック
      const mockLocalStorage = {
        getAllBooks: jest.fn().mockResolvedValue(mockBooks),
        getAllClips: jest.fn().mockResolvedValue(mockClips),
      };

      // 各ブックIDに対して呼び出し履歴を記録するモックの作成
      const savedBooks: Book[] = [];
      const savedClips: Clip[] = [];

      const mockSupabaseStorage = {
        saveBook: jest.fn().mockImplementation((book: Book) => {
          savedBooks.push(book);
          return Promise.resolve();
        }),
        saveClip: jest.fn().mockImplementation((clip: Clip) => {
          savedClips.push(clip);
          return Promise.resolve();
        }),
      };

      (LocalStorageService as jest.Mock).mockImplementation(
        () => mockLocalStorage
      );
      (SupabaseStorageService as jest.Mock).mockImplementation(
        () => mockSupabaseStorage
      );

      // プログレスコールバックのモック
      const mockProgressCallback = jest.fn();

      // 移行実行
      const result = await StorageMigrationService.migrateLocalToSupabase(
        userId,
        mockProgressCallback
      );

      // データ取得メソッドが呼び出されたか確認
      expect(mockLocalStorage.getAllBooks).toHaveBeenCalled();
      expect(mockLocalStorage.getAllClips).toHaveBeenCalled();

      // saveBookメソッドが正しい回数呼ばれたことを確認
      expect(mockSupabaseStorage.saveBook).toHaveBeenCalledTimes(
        mockBooks.length
      );

      // 各書籍が保存されたことを確認
      expect(savedBooks).toContainEqual(mockBooks[0]);
      expect(savedBooks).toContainEqual(mockBooks[1]);

      // saveClipメソッドが正しい回数呼ばれたことを確認
      expect(mockSupabaseStorage.saveClip).toHaveBeenCalledTimes(
        mockClips.length
      );

      // 各クリップが保存されたことを確認
      expect(savedClips).toContainEqual(mockClips[0]);
      expect(savedClips).toContainEqual(mockClips[1]);
      expect(savedClips).toContainEqual(mockClips[2]);

      // 移行結果が正しいか確認
      expect(result).toEqual({
        total: mockBooks.length + mockClips.length,
        processed: mockBooks.length + mockClips.length,
        failed: 0,
      });

      // プログレスコールバックが適切に呼び出されたか確認
      expect(mockProgressCallback).toHaveBeenCalledTimes(
        mockBooks.length + mockClips.length + 2
      ); // 初期 + 各アイテム + 完了

      // 初期プログレス
      expect(mockProgressCallback).toHaveBeenNthCalledWith(1, {
        total: mockBooks.length + mockClips.length,
        current: 0,
        status: "migrating",
      });

      // 完了プログレス
      expect(mockProgressCallback).toHaveBeenLastCalledWith({
        total: mockBooks.length + mockClips.length,
        current: mockBooks.length + mockClips.length,
        status: "completed",
      });
    });

    it("一部のデータ移行に失敗した場合、結果に失敗数が反映されること", async () => {
      const userId = "test-user-id";

      // ローカルストレージにデータがある状態をモック
      const mockLocalStorage = {
        getAllBooks: jest.fn().mockResolvedValue(mockBooks),
        getAllClips: jest.fn().mockResolvedValue(mockClips),
      };

      // エラーメッセージの保存用
      const errors: Error[] = [];

      const mockSupabaseStorage = {
        saveBook: jest.fn().mockImplementation((book) => {
          // book1の保存に失敗する想定
          if (book.id === "book1") {
            const error = new Error("Failed to save book1");
            errors.push(error);
            return Promise.reject(error);
          }
          return Promise.resolve();
        }),
        saveClip: jest.fn().mockImplementation((clip) => {
          // clip2の保存に失敗する想定
          if (clip.id === "clip2") {
            const error = new Error("Failed to save clip2");
            errors.push(error);
            return Promise.reject(error);
          }
          return Promise.resolve();
        }),
      };

      (LocalStorageService as jest.Mock).mockImplementation(
        () => mockLocalStorage
      );
      (SupabaseStorageService as jest.Mock).mockImplementation(
        () => mockSupabaseStorage
      );

      // コンソールエラーをモック
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      // プログレスコールバックのモック
      const mockProgressCallback = jest.fn();

      // 移行実行
      const result = await StorageMigrationService.migrateLocalToSupabase(
        userId,
        mockProgressCallback
      );

      // エラーが発生したことを確認
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to migrate book"),
        expect.any(Error)
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to migrate clip"),
        expect.any(Error)
      );

      // 移行結果が正しいか確認
      expect(result).toEqual({
        total: mockBooks.length + mockClips.length,
        processed: mockBooks.length + mockClips.length - 2,
        failed: 2,
      });

      consoleSpy.mockRestore();
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
          userId,
          mockProgressCallback
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
