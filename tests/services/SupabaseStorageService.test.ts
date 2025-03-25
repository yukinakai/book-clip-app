import { SupabaseStorageService } from "../../services/SupabaseStorageService";

// モックデータ
const userId = "test-user-id";
const bookId = "test-book-id";
const clipId = "test-clip-id";

// モックのセットアップ
jest.mock("../../services/auth", () => {
  // 結果を保持する変数
  let mockResponse = {
    data: null,
    error: null,
  };

  // モック関数
  const mockFrom = jest.fn();
  const mockSelect = jest.fn();
  const mockInsert = jest.fn();
  const mockDelete = jest.fn();
  const mockUpdate = jest.fn();
  const mockEq = jest.fn();
  const mockOrder = jest.fn();
  const mockSingle = jest.fn();

  // チェーン構造と結果設定
  mockSelect.mockImplementation(() => {
    return {
      eq: mockEq,
      single: mockSingle,
    };
  });

  mockEq.mockImplementation(() => {
    return {
      eq: mockEq,
      order: mockOrder,
      single: mockSingle,
      data: mockResponse.data,
      error: mockResponse.error,
    };
  });

  mockOrder.mockImplementation(() => mockResponse);
  mockSingle.mockImplementation(() => mockResponse);

  mockInsert.mockImplementation(() => {
    return {
      select: mockSelect,
      ...mockResponse,
    };
  });

  mockDelete.mockImplementation(() => {
    return {
      eq: mockEq,
    };
  });

  mockUpdate.mockImplementation(() => {
    return {
      eq: mockEq,
    };
  });

  mockFrom.mockImplementation(() => {
    return {
      select: mockSelect,
      insert: mockInsert,
      delete: mockDelete,
      update: mockUpdate,
    };
  });

  const mockSupabase = {
    from: mockFrom,
  };

  // レスポンスをセットする関数
  const setMockResponse = (data = null, error = null) => {
    mockResponse = { data, error };
  };

  return {
    supabase: mockSupabase,
    setMockResponse,
    mockFrom,
    mockSelect,
    mockInsert,
    mockDelete,
    mockUpdate,
    mockEq,
    mockOrder,
    mockSingle,
  };
});

describe("SupabaseStorageService", () => {
  let service: SupabaseStorageService;
  let mockFrom: jest.Mock;
  let mockSelect: jest.Mock;
  let mockInsert: jest.Mock;
  let mockDelete: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockEq: jest.Mock;
  let mockOrder: jest.Mock;
  let mockSingle: jest.Mock;
  let setMockResponse: (data?: any, error?: any) => void;

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
    setMockResponse = authModule.setMockResponse;
    mockFrom = authModule.mockFrom;
    mockSelect = authModule.mockSelect;
    mockInsert = authModule.mockInsert;
    mockDelete = authModule.mockDelete;
    mockUpdate = authModule.mockUpdate;
    mockEq = authModule.mockEq;
    mockOrder = authModule.mockOrder;
    mockSingle = authModule.mockSingle;
  });

  describe("saveBook", () => {
    it("書籍データが保存されること", async () => {
      // まずは書籍が存在しないことを示すレスポンスを設定
      setMockResponse([], null);

      // 次にinsertメソッドが呼ばれる前に、mockInsertが正しく動作するようにsetUp
      mockInsert.mockImplementationOnce(() => {
        return {
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockReturnValue({
              data: mockDbBook,
              error: null,
            }),
          }),
        };
      });

      await service.saveBook(mockBook);

      // 正しいテーブルと呼び出しを検証
      expect(mockFrom).toHaveBeenCalledWith("books");
      expect(mockSelect).toHaveBeenCalledWith("id, isbn");
      expect(mockEq).toHaveBeenCalledWith("isbn", mockBook.isbn);
      expect(mockEq).toHaveBeenCalledWith("user_id", userId);

      // insertが呼ばれたことを確認
      expect(mockInsert).toHaveBeenCalledWith(
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
      setMockResponse([{ id: bookId }]);

      await service.saveBook(mockBook);

      // insertが呼ばれないことを確認
      expect(mockFrom).toHaveBeenCalledWith("books");
      expect(mockSelect).toHaveBeenCalledWith("id, isbn");
      expect(mockEq).toHaveBeenCalledWith("isbn", mockBook.isbn);
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it("エラー発生時に例外がスローされること", async () => {
      // エラーレスポンスを設定
      setMockResponse(null, new Error("テストエラー"));

      await expect(service.saveBook(mockBook)).rejects.toThrow("テストエラー");
    });
  });

  describe("getAllBooks", () => {
    it("すべての書籍を取得できること", async () => {
      // 書籍データを返すレスポンス
      setMockResponse([
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
      ]);

      const result = await service.getAllBooks();

      // 正しいテーブルとクエリを検証
      expect(mockFrom).toHaveBeenCalledWith("books");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("user_id", userId);
      expect(mockOrder).toHaveBeenCalledWith("created_at", {
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
      setMockResponse(null, new Error("テストエラー"));

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
      setMockResponse(null, null);

      // 関連クリップ削除のモック
      setMockResponse(null, null);

      await service.removeBook(bookId);

      // 正しいテーブルとクエリを検証
      expect(mockFrom).toHaveBeenCalledWith("books");
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("id", bookId);
      expect(mockEq).toHaveBeenCalledWith("user_id", userId);
    });

    it("エラー発生時に例外がスローされること", async () => {
      // エラーレスポンスをセット
      setMockResponse(null, new Error("テストエラー"));

      await expect(service.removeBook(bookId)).rejects.toThrow("テストエラー");
    });
  });

  describe("saveClip", () => {
    it("クリップが保存されること", async () => {
      // 保存成功レスポンスをセット
      setMockResponse(null, null);

      await service.saveClip(mockClip);

      // クリップ保存のテスト
      expect(mockFrom).toHaveBeenCalledWith("clips");
      expect(mockInsert).toHaveBeenCalledWith(
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
      setMockResponse(null, new Error("テストエラー"));

      await expect(service.saveClip(mockClip)).rejects.toThrow("テストエラー");
    });
  });

  describe("getClipsByBookId", () => {
    it("指定した書籍のクリップを取得できること", async () => {
      // クリップデータを返すレスポンス
      setMockResponse([
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
      ]);

      const result = await service.getClipsByBookId(bookId);

      // 正しいテーブルとクエリを検証
      expect(mockFrom).toHaveBeenCalledWith("clips");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("user_id", userId);
      expect(mockEq).toHaveBeenCalledWith("book_id", bookId);
      expect(mockOrder).toHaveBeenCalledWith("created_at", {
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
      setMockResponse(null, new Error("テストエラー"));

      const result = await service.getClipsByBookId(bookId);
      expect(result).toEqual([]);
    });
  });

  describe("updateClip", () => {
    it("クリップが更新されること", async () => {
      // 更新成功レスポンスをセット
      setMockResponse(null, null);

      const updatedClip = { ...mockClip, text: "更新されたテキスト" };
      await service.updateClip(updatedClip);

      // 正しいテーブルとクエリを検証
      expect(mockFrom).toHaveBeenCalledWith("clips");
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          book_id: updatedClip.bookId,
          text: updatedClip.text,
          page: updatedClip.page,
          updated_at: expect.any(String),
        })
      );
      expect(mockEq).toHaveBeenCalledWith("id", updatedClip.id);
      expect(mockEq).toHaveBeenCalledWith("user_id", userId);
    });

    it("エラー発生時に例外がスローされること", async () => {
      // エラーレスポンスをセット
      setMockResponse(null, new Error("テストエラー"));

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
