import { SupabaseStorageService } from "../../services/SupabaseStorageService";

// モックデータ
const userId = "test-user-id";
const bookId = "test-book-id";
const clipId = "test-clip-id";

// モックのセットアップ
jest.mock("../../services/auth", () => {
  const mockSupabaseSelect = jest.fn();
  const mockSupabaseInsert = jest.fn();
  const mockSupabaseDelete = jest.fn();
  const mockSupabaseUpdate = jest.fn();
  const mockSupabaseEq = jest.fn();
  const mockSupabaseOrder = jest.fn();
  const mockSupabaseSingle = jest.fn();

  // チェーン構造を作成
  mockSupabaseSelect.mockReturnValue({
    eq: mockSupabaseEq,
    order: mockSupabaseOrder,
    single: mockSupabaseSingle,
  });

  mockSupabaseEq.mockReturnValue({
    eq: mockSupabaseEq,
    order: mockSupabaseOrder,
    data: null,
    error: null,
  });

  mockSupabaseOrder.mockReturnValue({
    data: null,
    error: null,
  });

  mockSupabaseInsert.mockReturnValue({
    select: mockSupabaseSelect,
    data: null,
    error: null,
  });

  mockSupabaseDelete.mockReturnValue({
    eq: mockSupabaseEq,
  });

  mockSupabaseUpdate.mockReturnValue({
    eq: mockSupabaseEq,
  });

  mockSupabaseSingle.mockReturnValue({
    data: null,
    error: null,
  });

  const mockSupabase = {
    from: jest.fn().mockReturnValue({
      select: mockSupabaseSelect,
      insert: mockSupabaseInsert,
      delete: mockSupabaseDelete,
      update: mockSupabaseUpdate,
    }),
  };

  return {
    supabase: mockSupabase,
    mockSupabaseSelect,
    mockSupabaseInsert,
    mockSupabaseDelete,
    mockSupabaseUpdate,
    mockSupabaseEq,
    mockSupabaseOrder,
    mockSupabaseSingle,
  };
});

describe("SupabaseStorageService", () => {
  let service: SupabaseStorageService;
  let mockSupabase: any;
  let mockSupabaseSelect: jest.Mock;
  let mockSupabaseInsert: jest.Mock;
  let mockSupabaseDelete: jest.Mock;
  let mockSupabaseUpdate: jest.Mock;
  let mockSupabaseEq: jest.Mock;
  let mockSupabaseOrder: jest.Mock;
  let mockSupabaseSingle: jest.Mock;

  // モックブックとクリップデータ
  const mockBook = {
    id: "test-book-id",
    title: "テスト書籍",
    author: "テスト著者",
    coverImage: "http://example.com/thumbnail.jpg",
    isbn: "9784567890123",
  };

  // この形式はデータベースに保存される形式
  const mockDbBook = {
    id: "test-book-id",
    title: "テスト書籍",
    author: "テスト著者",
    cover_image: "http://example.com/thumbnail.jpg",
    isbn: "9784567890123",
    user_id: userId,
  };

  // クリップのテスト用データ
  const mockClip = {
    id: "test-clip-id",
    bookId: "test-book-id",
    text: "テストクリップのテキスト",
    page: 42,
    createdAt: "2023-01-01T00:00:00.000Z",
  };

  // この形式はデータベースに保存される形式
  const mockDbClip = {
    id: "test-clip-id",
    book_id: "test-book-id",
    text: "テストクリップのテキスト",
    page: 42,
    created_at: "2023-01-01T00:00:00.000Z",
    user_id: userId,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // サービスのインスタンスを作成（userId付き）
    service = new SupabaseStorageService(userId);

    // supabaseのモックを取得
    const authModule = require("../../services/auth");
    mockSupabase = authModule.supabase;
    mockSupabaseSelect = authModule.mockSupabaseSelect;
    mockSupabaseInsert = authModule.mockSupabaseInsert;
    mockSupabaseDelete = authModule.mockSupabaseDelete;
    mockSupabaseUpdate = authModule.mockSupabaseUpdate;
    mockSupabaseEq = authModule.mockSupabaseEq;
    mockSupabaseOrder = authModule.mockSupabaseOrder;
    mockSupabaseSingle = authModule.mockSupabaseSingle;
  });

  describe("saveBook", () => {
    it("書籍データが保存されること", async () => {
      // 書籍が存在しないことを示すレスポンス
      mockSupabaseEq.mockReturnValueOnce({
        data: [],
        error: null,
      });

      // 書籍挿入成功を示すレスポンス
      mockSupabaseSingle.mockReturnValueOnce({
        data: { ...mockDbBook },
        error: null,
      });

      await service.saveBook(mockBook);

      // 正しいテーブルと呼び出しを検証
      expect(mockSupabase.from).toHaveBeenCalledWith("books");
      expect(mockSupabaseSelect).toHaveBeenCalledWith("id, isbn");
      expect(mockSupabaseEq).toHaveBeenCalledWith("isbn", mockBook.isbn);
      expect(mockSupabaseEq).toHaveBeenCalledWith("user_id", userId);

      // insertが呼ばれたことを確認
      expect(mockSupabaseInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          isbn: mockBook.isbn,
          title: mockBook.title,
          author: mockBook.author,
          cover_image: mockBook.coverImage,
          created_at: expect.any(String),
          updated_at: expect.any(String),
        })
      );
    });

    it("既存書籍は保存されないこと", async () => {
      // 書籍が存在することを示すレスポンス
      mockSupabaseEq.mockReturnValueOnce({
        data: [{ id: bookId }],
        error: null,
      });

      await service.saveBook(mockBook);

      // insertが呼ばれないことを確認
      expect(mockSupabase.from).toHaveBeenCalledWith("books");
      expect(mockSupabaseSelect).toHaveBeenCalledWith("id, isbn");
      expect(mockSupabaseEq).toHaveBeenCalledWith("isbn", mockBook.isbn);
      expect(mockSupabaseInsert).not.toHaveBeenCalled();
    });

    it("エラー発生時に例外がスローされること", async () => {
      // エラーレスポンスを設定
      mockSupabaseEq.mockReturnValueOnce({
        data: null,
        error: new Error("テストエラー"),
      });

      await expect(service.saveBook(mockBook)).rejects.toThrow("テストエラー");
    });
  });

  describe("getAllBooks", () => {
    it("すべての書籍を取得できること", async () => {
      // 書籍データを返すレスポンス
      mockSupabaseOrder.mockReturnValueOnce({
        data: [
          {
            id: "book-1",
            title: "書籍1",
            author: "著者1",
            cover_image: "http://example.com/cover1.jpg",
            isbn: "1234567890123",
          },
          {
            id: "book-2",
            title: "書籍2",
            author: "著者2",
            cover_image: "http://example.com/cover2.jpg",
            isbn: "2345678901234",
          },
        ],
        error: null,
      });

      const result = await service.getAllBooks();

      // 正しいテーブルとクエリを検証
      expect(mockSupabase.from).toHaveBeenCalledWith("books");
      expect(mockSupabaseSelect).toHaveBeenCalledWith("*");
      expect(mockSupabaseEq).toHaveBeenCalledWith("user_id", userId);
      expect(mockSupabaseOrder).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });

      // データ変換を検証
      expect(result).toEqual([
        {
          id: "book-1",
          title: "書籍1",
          author: "著者1",
          coverImage: "http://example.com/cover1.jpg",
          isbn: "1234567890123",
        },
        {
          id: "book-2",
          title: "書籍2",
          author: "著者2",
          coverImage: "http://example.com/cover2.jpg",
          isbn: "2345678901234",
        },
      ]);
    });

    it("エラー発生時に空配列を返すこと", async () => {
      // エラーレスポンスを設定
      mockSupabaseOrder.mockReturnValueOnce({
        data: null,
        error: new Error("テストエラー"),
      });

      const result = await service.getAllBooks();
      expect(result).toEqual([]);
    });

    it("ユーザーIDがない場合は空配列を返すこと", async () => {
      // ユーザーIDがnullの場合をテスト
      const serviceWithNullUser = new SupabaseStorageService(null as any);
      const result = await serviceWithNullUser.getAllBooks();
      expect(result).toEqual([]);
    });
  });

  describe("removeBook", () => {
    it("指定した書籍を削除できること", async () => {
      // 削除成功レスポンスをセット
      mockSupabaseEq.mockReturnValueOnce({
        error: null,
      });

      // 関連クリップ削除のモック
      mockSupabaseEq.mockReturnValueOnce({
        error: null,
      });

      await service.removeBook(bookId);

      // 正しいテーブルとクエリを検証
      expect(mockSupabase.from).toHaveBeenCalledWith("books");
      expect(mockSupabaseDelete).toHaveBeenCalled();
      expect(mockSupabaseEq).toHaveBeenCalledWith("id", bookId);
      expect(mockSupabaseEq).toHaveBeenCalledWith("user_id", userId);
    });

    it("エラー発生時に例外がスローされること", async () => {
      // エラーレスポンスをセット
      mockSupabaseEq.mockReturnValueOnce({
        error: new Error("テストエラー"),
      });

      await expect(service.removeBook(bookId)).rejects.toThrow("テストエラー");
    });
  });

  describe("saveClip", () => {
    it("クリップが保存されること", async () => {
      // 保存成功レスポンスをセット
      mockSupabaseInsert.mockReturnValueOnce({
        error: null,
      });

      await service.saveClip(mockClip);

      // クリップ保存のテスト
      expect(mockSupabase.from).toHaveBeenCalledWith("clips");
      expect(mockSupabaseInsert).toHaveBeenCalledWith(
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
      // エラーレスポンスをセット
      mockSupabaseInsert.mockReturnValueOnce({
        error: new Error("テストエラー"),
      });

      await expect(service.saveClip(mockClip)).rejects.toThrow("テストエラー");
    });
  });

  describe("getClipsByBookId", () => {
    it("指定した書籍のクリップを取得できること", async () => {
      // クリップデータを返すレスポンス
      mockSupabaseOrder.mockReturnValueOnce({
        data: [
          {
            id: "clip-1",
            book_id: bookId,
            text: "クリップ1のテキスト",
            page: 42,
            created_at: "2023-01-01T00:00:00.000Z",
          },
          {
            id: "clip-2",
            book_id: bookId,
            text: "クリップ2のテキスト",
            page: 100,
            created_at: "2023-01-02T00:00:00.000Z",
          },
        ],
        error: null,
      });

      const result = await service.getClipsByBookId(bookId);

      // 正しいテーブルとクエリを検証
      expect(mockSupabase.from).toHaveBeenCalledWith("clips");
      expect(mockSupabaseSelect).toHaveBeenCalledWith("*");
      expect(mockSupabaseEq).toHaveBeenCalledWith("user_id", userId);
      expect(mockSupabaseEq).toHaveBeenCalledWith("book_id", bookId);
      expect(mockSupabaseOrder).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });

      // データ変換を検証
      expect(result).toEqual([
        {
          id: "clip-1",
          bookId: bookId,
          text: "クリップ1のテキスト",
          page: 42,
          createdAt: "2023-01-01T00:00:00.000Z",
        },
        {
          id: "clip-2",
          bookId: bookId,
          text: "クリップ2のテキスト",
          page: 100,
          createdAt: "2023-01-02T00:00:00.000Z",
        },
      ]);
    });

    it("エラー発生時に空配列を返すこと", async () => {
      // エラーレスポンスをセット
      mockSupabaseOrder.mockReturnValueOnce({
        data: null,
        error: new Error("テストエラー"),
      });

      const result = await service.getClipsByBookId(bookId);
      expect(result).toEqual([]);
    });
  });

  describe("updateClip", () => {
    it("クリップが更新されること", async () => {
      // 更新成功レスポンスをセット
      mockSupabaseEq.mockReturnValueOnce({
        error: null,
      });

      const updatedClip = { ...mockClip, text: "更新されたテキスト" };
      await service.updateClip(updatedClip);

      // 正しいテーブルとクエリを検証
      expect(mockSupabase.from).toHaveBeenCalledWith("clips");
      expect(mockSupabaseUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          book_id: updatedClip.bookId,
          text: updatedClip.text,
          page: updatedClip.page,
          updated_at: expect.any(String),
        })
      );
      expect(mockSupabaseEq).toHaveBeenCalledWith("id", updatedClip.id);
      expect(mockSupabaseEq).toHaveBeenCalledWith("user_id", userId);
    });

    it("エラー発生時に例外がスローされること", async () => {
      // エラーレスポンスをセット
      mockSupabaseEq.mockReturnValueOnce({
        error: new Error("テストエラー"),
      });

      await expect(service.updateClip(mockClip)).rejects.toThrow(
        "テストエラー"
      );
    });
  });

  describe("clearAllData", () => {
    it("何も行わずにresolveすること", async () => {
      await expect(service.clearAllData()).resolves.toBeUndefined();
    });
  });
});
