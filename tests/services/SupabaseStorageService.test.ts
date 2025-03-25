import { SupabaseStorageService } from "../../services/SupabaseStorageService";
import { Book, Clip } from "../../constants/MockData";
import { SupabaseService } from "../../services/SupabaseService";

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
  let mockSupabase: any;
  let service: SupabaseStorageService;

  // モックブックとクリップデータ
  const mockUserId = "test-user-id";
  const mockBook = {
    id: "test-book-id",
    title: "テスト書籍",
    author: "テスト著者",
    publishedDate: "2023-01-01",
    thumbnailUrl: "http://example.com/thumbnail.jpg",
  };

  // この形式はデータベースに保存される形式
  const mockDbBook = {
    id: "test-book-id",
    title: "テスト書籍",
    author: "テスト著者",
    published_date: "2023-01-01",
    cover_image: "http://example.com/thumbnail.jpg",
    user_id: mockUserId,
  };

  // サービスから返される形式（camelCase）
  const mockResponseBook = {
    id: "test-book-id",
    title: "テスト書籍",
    author: "テスト著者",
    publishedDate: "2023-01-01",
    coverImage: "http://example.com/thumbnail.jpg",
    userId: mockUserId,
  };

  // クリップのテスト用データ
  const mockClip = {
    id: "test-clip-id",
    bookId: "test-book-id",
    text: "テストクリップのテキスト",
    page: 42,
    createdAt: new Date().toISOString(),
  };

  // この形式はデータベースに保存される形式
  const mockDbClip = {
    id: "test-clip-id",
    book_id: "test-book-id",
    text: "テストクリップのテキスト",
    page: 42,
    created_at: new Date().toISOString(),
    user_id: mockUserId,
  };

  // サービスから返される形式（camelCase）
  const mockResponseClip = {
    id: "test-clip-id",
    bookId: "test-book-id",
    text: "テストクリップのテキスト",
    page: 42,
    createdAt: new Date().toISOString(),
    userId: mockUserId,
  };

  beforeEach(() => {
    // Supabaseクライアントのモックを作成
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      match: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      data: null,
      error: null,
    };

    // モックとしてgetCurrentUserを設定
    jest.spyOn(SupabaseService, "getCurrentUser").mockResolvedValue({
      id: mockUserId,
      email: "test@example.com",
    });

    // サービスのインスタンスを作成
    service = new SupabaseStorageService();
    (service as any).supabase = mockSupabase;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("saveBook", () => {
    it("書籍データが保存されること", async () => {
      // selectメソッドのモックチェーンを設定
      const selectMock = jest.fn().mockReturnThis();
      const eqMock = jest.fn().mockReturnThis();
      const dataMock = { data: [] };

      mockSupabase.from.mockReturnValue({
        select: selectMock,
        eq: eqMock,
        then: jest.fn().mockResolvedValue(dataMock),
      });

      // insertメソッドのモックを設定
      mockSupabase.from.mockReturnValueOnce({
        select: selectMock,
        eq: eqMock,
        then: jest.fn().mockResolvedValue(dataMock),
      });

      const insertMock = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({
          data: [mockDbBook],
          error: null,
        }),
      });

      mockSupabase.from.mockReturnValueOnce({
        insert: insertMock,
      });

      // 書籍を保存
      await service.saveBook(mockBook);

      // fromメソッドが正しく呼ばれたことを確認
      expect(mockSupabase.from).toHaveBeenCalledWith("books");

      // insertメソッドが正しいデータで呼ばれたことを確認
      expect(insertMock).toHaveBeenCalledWith({
        id: mockBook.id,
        title: mockBook.title,
        author: mockBook.author,
        published_date: mockBook.publishedDate,
        cover_image: mockBook.thumbnailUrl,
        user_id: mockUserId,
      });
    });

    it("既存書籍は保存されないこと", async () => {
      // 既存書籍が存在するシナリオをセットアップ
      setupMockResponse({
        data: [{ id: bookId }],
        error: null,
      });

      await service.saveBook(mockBook);

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

      await expect(service.saveBook(mockBook)).rejects.toThrow();
    });
  });

  describe("getAllBooks", () => {
    it("ユーザーの全書籍を取得できること", async () => {
      // selectメソッドのモックチェーンを設定
      const selectMock = jest.fn().mockReturnThis();
      const eqMock = jest.fn().mockReturnThis();

      // 書籍データを含むレスポンスを用意
      const mockBooks = [
        {
          id: "book-1",
          title: "書籍1",
          author: "著者1",
          published_date: "2023-01-01",
          cover_image: "http://example.com/cover1.jpg",
          user_id: mockUserId,
        },
        {
          id: "book-2",
          title: "書籍2",
          author: "著者2",
          published_date: "2023-02-01",
          cover_image: "http://example.com/cover2.jpg",
          user_id: mockUserId,
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: selectMock,
        eq: eqMock,
        then: jest.fn().mockResolvedValue({
          data: mockBooks,
          error: null,
        }),
      });

      // 書籍を取得
      const books = await service.getAllBooks();

      // fromとselectメソッドが正しく呼ばれたことを確認
      expect(mockSupabase.from).toHaveBeenCalledWith("books");
      expect(selectMock).toHaveBeenCalledWith("*");
      expect(eqMock).toHaveBeenCalledWith("user_id", mockUserId);

      // 返されたデータが正しく変換されていることを確認
      expect(books).toEqual([
        {
          id: "book-1",
          title: "書籍1",
          author: "著者1",
          publishedDate: "2023-01-01",
          coverImage: "http://example.com/cover1.jpg",
          userId: mockUserId,
        },
        {
          id: "book-2",
          title: "書籍2",
          author: "著者2",
          publishedDate: "2023-02-01",
          coverImage: "http://example.com/cover2.jpg",
          userId: mockUserId,
        },
      ]);
    });

    it("エラー発生時に空配列を返すこと", async () => {
      // エラーシナリオをセットアップ
      setupMockResponse({
        data: null,
        error: new Error("テストエラー"),
      });

      const result = await service.getAllBooks();
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

      await service.removeBook(bookId);

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

      await expect(service.removeBook(bookId)).rejects.toThrow();
    });
  });

  describe("saveClip", () => {
    it("クリップが保存され、最後に使用した書籍が更新されること", async () => {
      // 成功シナリオをセットアップ
      setupMockResponse({
        error: null,
        data: [mockBook],
      });

      await service.saveClip(mockClip);

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

      await expect(service.saveClip(mockClip)).rejects.toThrow();
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

      const result = await service.getClipsByBookId(bookId);

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

      const result = await service.getClipsByBookId(bookId);
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
      await service.updateClip(updatedClip);

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

      await expect(service.updateClip(mockClip)).rejects.toThrow();
    });
  });

  describe("clearAllData", () => {
    it("何も行わずにresolveすること", async () => {
      await expect(service.clearAllData()).resolves.toBeUndefined();
    });
  });
});
