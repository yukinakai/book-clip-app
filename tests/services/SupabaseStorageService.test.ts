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
    it("指定したIDの書籍が削除されること", async () => {
      // deleteメソッドのモックを設定
      const deleteMock = jest.fn().mockReturnThis();
      const eqMock = jest.fn().mockReturnThis();

      mockSupabase.from.mockReturnValue({
        delete: deleteMock,
        eq: eqMock,
        then: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      const bookId = "test-book-id";
      await service.removeBook(bookId);

      // fromとdeleteメソッドが正しく呼ばれたことを確認
      expect(mockSupabase.from).toHaveBeenCalledWith("books");
      expect(deleteMock).toHaveBeenCalled();
      expect(eqMock).toHaveBeenCalledWith("id", bookId);
    });

    it("削除中にエラーが発生した場合、エラーがスローされること", async () => {
      // エラーを返すモックを設定
      const deleteMock = jest.fn().mockReturnThis();
      const eqMock = jest.fn().mockReturnThis();

      mockSupabase.from.mockReturnValue({
        delete: deleteMock,
        eq: eqMock,
        then: jest.fn().mockResolvedValue({
          error: new Error("削除中にエラーが発生しました"),
        }),
      });

      const bookId = "test-book-id";
      await expect(service.removeBook(bookId)).rejects.toThrow();
    });
  });

  describe("saveClip", () => {
    it("クリップが正常に保存されること", async () => {
      // insert メソッドのモックチェーンを設定
      const insertMock = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({
          data: [mockDbClip],
          error: null,
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: insertMock,
      });

      // クリップを保存
      await service.saveClip(mockClip);

      // fromとinsertメソッドが正しく呼ばれたことを確認
      expect(mockSupabase.from).toHaveBeenCalledWith("clips");
      expect(insertMock).toHaveBeenCalledWith({
        id: mockClip.id,
        book_id: mockClip.bookId,
        text: mockClip.text,
        page: mockClip.page,
        created_at: mockClip.createdAt,
        user_id: mockUserId,
      });
    });

    it("保存中にエラーが発生した場合、エラーがスローされること", async () => {
      // エラーを返すモックを設定
      const insertMock = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({
          error: new Error("保存中にエラーが発生しました"),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: insertMock,
      });

      // エラーがスローされることを確認
      await expect(service.saveClip(mockClip)).rejects.toThrow();
    });
  });

  describe("getClipsByBookId", () => {
    it("指定した書籍のクリップを取得できること", async () => {
      // selectメソッドのモックチェーンを設定
      const selectMock = jest.fn().mockReturnThis();
      const eqMock = jest.fn().mockReturnThis();

      // クリップデータを含むレスポンスを用意
      const mockDbClips = [
        {
          id: "clip-1",
          book_id: "test-book-id",
          text: "クリップ1のテキスト",
          page: 42,
          created_at: new Date().toISOString(),
          user_id: mockUserId,
        },
        {
          id: "clip-2",
          book_id: "test-book-id",
          text: "クリップ2のテキスト",
          page: 100,
          created_at: new Date().toISOString(),
          user_id: mockUserId,
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: selectMock,
        eq: eqMock,
        then: jest.fn().mockResolvedValue({
          data: mockDbClips,
          error: null,
        }),
      });

      // クリップを取得
      const clips = await service.getClipsByBookId("test-book-id");

      // fromとselectメソッドが正しく呼ばれたことを確認
      expect(mockSupabase.from).toHaveBeenCalledWith("clips");
      expect(selectMock).toHaveBeenCalledWith("*");
      expect(eqMock).toHaveBeenCalledWith("book_id", "test-book-id");

      // 返されたデータが正しく変換されていることを確認
      expect(clips).toEqual([
        {
          id: "clip-1",
          bookId: "test-book-id",
          text: "クリップ1のテキスト",
          page: 42,
          createdAt: expect.any(String),
          userId: mockUserId,
        },
        {
          id: "clip-2",
          bookId: "test-book-id",
          text: "クリップ2のテキスト",
          page: 100,
          createdAt: expect.any(String),
          userId: mockUserId,
        },
      ]);
    });

    it("クリップが存在しない場合、空配列を返すこと", async () => {
      // 空のデータを返すモックを設定
      const selectMock = jest.fn().mockReturnThis();
      const eqMock = jest.fn().mockReturnThis();

      mockSupabase.from.mockReturnValue({
        select: selectMock,
        eq: eqMock,
        then: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      const result = await service.getClipsByBookId("test-book-id");
      expect(result).toEqual([]);
    });
  });

  describe("updateClip", () => {
    it("クリップが正常に更新されること", async () => {
      // update メソッドのモックチェーンを設定
      const updateMock = jest.fn().mockReturnThis();
      const eqMock = jest.fn().mockReturnThis();

      mockSupabase.from.mockReturnValue({
        update: updateMock,
        eq: eqMock,
        then: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      // 更新するクリップ
      const updatedClip = {
        ...mockClip,
        text: "更新されたテキスト",
      };

      // クリップを更新
      await service.updateClip(updatedClip);

      // fromとupdateメソッドが正しく呼ばれたことを確認
      expect(mockSupabase.from).toHaveBeenCalledWith("clips");
      expect(updateMock).toHaveBeenCalledWith({
        text: updatedClip.text,
        page: updatedClip.page,
        book_id: updatedClip.bookId,
      });
      expect(eqMock).toHaveBeenCalledWith("id", updatedClip.id);
    });

    it("更新中にエラーが発生した場合、エラーがスローされること", async () => {
      // エラーを返すモックを設定
      const updateMock = jest.fn().mockReturnThis();
      const eqMock = jest.fn().mockReturnThis();

      mockSupabase.from.mockReturnValue({
        update: updateMock,
        eq: eqMock,
        then: jest.fn().mockResolvedValue({
          error: new Error("更新中にエラーが発生しました"),
        }),
      });

      // エラーがスローされることを確認
      await expect(service.updateClip(mockClip)).rejects.toThrow();
    });
  });

  describe("clearAllData", () => {
    it("何も行わずにresolveすること", async () => {
      await expect(service.clearAllData()).resolves.toBeUndefined();
    });
  });
});
