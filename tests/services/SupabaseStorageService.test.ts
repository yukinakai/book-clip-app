import { SupabaseStorageService } from "../../services/SupabaseStorageService";
import { Book, Clip } from "../../constants/MockData";

// モックデータ
const userId = "test-user-id";
const bookId = "test-book-id";
const clipId = "test-clip-id";

const mockBook: Book = {
  id: bookId,
  title: "テスト書籍",
  author: "テスト作者",
  thumbnail: "thumbnail-url",
  isbn: "9784567890123",
};

const mockClip: Clip = {
  id: clipId,
  bookId: bookId,
  text: "テストクリップ",
  page: 1,
  createdAt: "2023-01-01T00:00:00.000Z",
};

// Jestモック設定
jest.mock("../../services/auth", () => {
  // モックの作成
  const mockSelectFn = jest.fn().mockReturnThis();
  const mockInsertFn = jest.fn();
  const mockDeleteFn = jest.fn().mockReturnThis();
  const mockUpdateFn = jest.fn().mockReturnThis();
  const mockEqFn = jest.fn().mockReturnThis();
  const mockOrderFn = jest.fn().mockReturnThis();
  const mockSingleFn = jest.fn().mockReturnThis();
  const mockFromFn = jest.fn().mockReturnValue({
    select: mockSelectFn,
    insert: mockInsertFn,
    delete: mockDeleteFn,
    update: mockUpdateFn,
  });

  // モックの連鎖を設定
  mockSelectFn.mockImplementation(() => ({
    eq: mockEqFn,
    order: mockOrderFn,
    single: mockSingleFn,
  }));

  // insertの戻り値にselectメソッドを追加
  const mockInsertReturn = {
    select: jest.fn().mockReturnValue({
      single: jest.fn().mockReturnValue({ data: null, error: null }),
    }),
  };
  mockInsertFn.mockReturnValue(mockInsertReturn);

  mockEqFn.mockImplementation(() => ({
    eq: mockEqFn,
    order: mockOrderFn,
    single: mockSingleFn,
  }));

  return {
    supabase: {
      from: mockFromFn,
    },
    mockFromFn,
    mockSelectFn,
    mockInsertFn,
    mockDeleteFn,
    mockUpdateFn,
    mockEqFn,
    mockOrderFn,
    mockSingleFn,
  };
});

// テスト用のレスポンスをセットアップする関数
function setupMockResponse(response: any) {
  // selectメソッドのモックチェーン
  require("../../services/auth").mockSelectFn.mockImplementation(() => ({
    eq: require("../../services/auth").mockEqFn,
    order: require("../../services/auth").mockOrderFn,
    single: require("../../services/auth").mockSingleFn,
  }));

  // eqメソッドのモックチェーン
  require("../../services/auth").mockEqFn.mockImplementation(() => ({
    eq: require("../../services/auth").mockEqFn,
    order: require("../../services/auth").mockOrderFn,
    single: require("../../services/auth").mockSingleFn,
    ...response,
  }));

  // insertメソッドのモック
  require("../../services/auth").mockInsertFn.mockReturnValue(response);

  // deleteメソッドのモックチェーン
  require("../../services/auth").mockDeleteFn.mockImplementation(() => ({
    eq: require("../../services/auth").mockEqFn,
  }));

  // updateメソッドのモックチェーン
  require("../../services/auth").mockUpdateFn.mockImplementation(() => ({
    eq: require("../../services/auth").mockEqFn,
  }));

  // orderメソッドのモック
  require("../../services/auth").mockOrderFn.mockReturnValue(response);

  // singleメソッドのモック
  require("../../services/auth").mockSingleFn.mockReturnValue(response);
}

describe("SupabaseStorageService", () => {
  let supabaseStorageService: SupabaseStorageService;

  // 各テスト前の準備
  beforeEach(() => {
    jest.clearAllMocks();
    supabaseStorageService = new SupabaseStorageService(userId);
  });

  describe("saveBook", () => {
    it("新規書籍が保存されること", async () => {
      // モックレスポンスの設定
      setupMockResponse({
        data: [],
        error: null,
      });

      await supabaseStorageService.saveBook(mockBook);

      // 正しいテーブルにアクセスしていることを検証
      const {
        mockFromFn,
        mockSelectFn,
        mockInsertFn,
        mockEqFn,
      } = require("../../services/auth");
      expect(mockFromFn).toHaveBeenCalledWith("books");
      expect(mockSelectFn).toHaveBeenCalledWith("id, isbn");
      expect(mockEqFn).toHaveBeenCalledWith("isbn", mockBook.isbn);
      expect(mockEqFn).toHaveBeenCalledWith("user_id", userId);
      expect(mockInsertFn).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockBook,
          user_id: userId,
          created_at: expect.any(String),
          updated_at: expect.any(String),
        })
      );
    });

    it("既存書籍は保存されないこと", async () => {
      // 既存書籍が存在するシナリオをセットアップ
      setupMockResponse({
        data: [{ id: bookId }],
        error: null,
      });

      await supabaseStorageService.saveBook(mockBook);

      // insertが呼ばれないことを検証
      const {
        mockFromFn,
        mockSelectFn,
        mockInsertFn,
        mockEqFn,
      } = require("../../services/auth");
      expect(mockFromFn).toHaveBeenCalledWith("books");
      expect(mockSelectFn).toHaveBeenCalledWith("id, isbn");
      expect(mockEqFn).toHaveBeenCalledWith("isbn", mockBook.isbn);
      expect(mockEqFn).toHaveBeenCalledWith("user_id", userId);
      expect(mockInsertFn).not.toHaveBeenCalled();
    });

    it("エラー発生時に例外がスローされること", async () => {
      // エラーシナリオをセットアップ
      setupMockResponse({
        data: null,
        error: new Error("テストエラー"),
      });

      await expect(supabaseStorageService.saveBook(mockBook)).rejects.toThrow();
    });
  });

  describe("getAllBooks", () => {
    it("すべての書籍を取得できること", async () => {
      // 書籍データを返すシナリオをセットアップ
      setupMockResponse({
        data: [mockBook],
        error: null,
      });

      const result = await supabaseStorageService.getAllBooks();

      // 正しいテーブルとクエリを検証
      const {
        mockFromFn,
        mockSelectFn,
        mockEqFn,
        mockOrderFn,
      } = require("../../services/auth");
      expect(mockFromFn).toHaveBeenCalledWith("books");
      expect(mockSelectFn).toHaveBeenCalledWith("*");
      expect(mockEqFn).toHaveBeenCalledWith("user_id", userId);
      expect(mockOrderFn).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      const expectedBook = {
        id: mockBook.id,
        title: mockBook.title,
        author: mockBook.author,
        isbn: mockBook.isbn,
        coverImage: mockBook.thumbnail,
      };
      expect(result).toEqual([expectedBook]);
    });

    it("エラー発生時に空配列を返すこと", async () => {
      // エラーシナリオをセットアップ
      setupMockResponse({
        data: null,
        error: new Error("テストエラー"),
      });

      const result = await supabaseStorageService.getAllBooks();
      expect(result).toEqual([]);
    });

    it("ユーザーIDがない場合は空配列を返すこと", async () => {
      // ユーザーIDがnullの場合をセットアップ
      const serviceWithNullUser = new SupabaseStorageService(null as any);
      const result = await serviceWithNullUser.getAllBooks();
      expect(result).toEqual([]);
    });
  });

  describe("removeBook", () => {
    it("指定した書籍を削除できること", async () => {
      // 成功シナリオをセットアップ
      setupMockResponse({
        error: null,
        data: null,
      });

      await supabaseStorageService.removeBook(bookId);

      // 正しいテーブルとクエリを検証
      const {
        mockFromFn,
        mockDeleteFn,
        mockEqFn,
      } = require("../../services/auth");
      expect(mockFromFn).toHaveBeenCalledWith("books");
      expect(mockDeleteFn).toHaveBeenCalled();
      expect(mockEqFn).toHaveBeenCalledWith("id", bookId);
      expect(mockEqFn).toHaveBeenCalledWith("user_id", userId);
    });

    it("エラー発生時に例外がスローされること", async () => {
      // エラーシナリオをセットアップ
      setupMockResponse({
        error: new Error("テストエラー"),
        data: null,
      });

      await expect(supabaseStorageService.removeBook(bookId)).rejects.toThrow();
    });
  });

  describe("saveClip", () => {
    it("クリップが保存され、最後に使用した書籍が更新されること", async () => {
      // 成功シナリオをセットアップ
      setupMockResponse({
        error: null,
        data: [mockBook],
      });

      await supabaseStorageService.saveClip(mockClip);

      // クリップ保存のテスト
      const { mockFromFn, mockInsertFn } = require("../../services/auth");
      expect(mockFromFn).toHaveBeenCalledWith("clips");
      expect(mockInsertFn).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          book_id: mockClip.bookId,
          text: mockClip.text,
          page: mockClip.page,
          created_at: expect.any(String),
          updated_at: expect.any(String),
        })
      );
    });

    it("エラー発生時に例外がスローされること", async () => {
      // エラーシナリオをセットアップ
      setupMockResponse({
        error: new Error("テストエラー"),
        data: null,
      });

      await expect(supabaseStorageService.saveClip(mockClip)).rejects.toThrow();
    });
  });

  describe("getClipsByBookId", () => {
    it("指定した書籍のクリップを取得できること", async () => {
      // 成功シナリオをセットアップ
      // データベースのフィールド名を使用したモックデータ
      const dbMockClip = {
        id: clipId,
        book_id: bookId, // snake_case
        text: "テストクリップ",
        page: 1,
        created_at: "2023-01-01T00:00:00.000Z",
      };

      setupMockResponse({
        data: [dbMockClip],
        error: null,
      });

      const result = await supabaseStorageService.getClipsByBookId(bookId);

      // 正しいテーブルとクエリを検証
      const {
        mockFromFn,
        mockSelectFn,
        mockEqFn,
        mockOrderFn,
      } = require("../../services/auth");
      expect(mockFromFn).toHaveBeenCalledWith("clips");
      expect(mockSelectFn).toHaveBeenCalledWith("*");
      expect(mockEqFn).toHaveBeenNthCalledWith(1, "user_id", userId);
      expect(mockEqFn).toHaveBeenNthCalledWith(2, "book_id", bookId);
      expect(mockOrderFn).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });

      // サービスから返される期待結果（フィールド名変換後）
      const expectedClip = {
        id: clipId,
        bookId: bookId, // camelCase
        text: "テストクリップ",
        page: 1,
        createdAt: "2023-01-01T00:00:00.000Z", // camelCase
      };
      expect(result).toEqual([expectedClip]);
    });

    it("エラー発生時に空配列を返すこと", async () => {
      // エラーシナリオをセットアップ
      setupMockResponse({
        data: null,
        error: new Error("テストエラー"),
      });

      const result = await supabaseStorageService.getClipsByBookId(bookId);
      expect(result).toEqual([]);
    });
  });

  describe("updateClip", () => {
    it("クリップが更新されること", async () => {
      // 成功シナリオをセットアップ
      setupMockResponse({
        error: null,
        data: null,
      });

      const updatedClip = { ...mockClip, text: "更新されたテキスト" };
      await supabaseStorageService.updateClip(updatedClip);

      // 正しいテーブルとクエリを検証
      const {
        mockFromFn,
        mockUpdateFn,
        mockEqFn,
      } = require("../../services/auth");
      expect(mockFromFn).toHaveBeenCalledWith("clips");
      expect(mockUpdateFn).toHaveBeenCalledWith(
        expect.objectContaining({
          book_id: updatedClip.bookId,
          text: updatedClip.text,
          page: updatedClip.page,
          updated_at: expect.any(String),
        })
      );
      expect(mockEqFn).toHaveBeenNthCalledWith(1, "id", clipId);
      expect(mockEqFn).toHaveBeenNthCalledWith(2, "user_id", userId);
    });

    it("エラー発生時に例外がスローされること", async () => {
      // エラーシナリオをセットアップ
      setupMockResponse({
        error: new Error("テストエラー"),
        data: null,
      });

      await expect(
        supabaseStorageService.updateClip(mockClip)
      ).rejects.toThrow();
    });
  });

  describe("clearAllData", () => {
    it("何も行わずにresolveすること", async () => {
      await expect(
        supabaseStorageService.clearAllData()
      ).resolves.toBeUndefined();
    });
  });
});
