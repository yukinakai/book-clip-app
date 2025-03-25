import { BookStorageService } from "../../services/BookStorageService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Book } from "../../constants/MockData";

// AsyncStorageのモックをセットアップ
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe("BookStorageService", () => {
  // 各テストの前にモックをリセット
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // テスト用データ
  const mockBook: Book = {
    id: "test-id-1",
    title: "テスト書籍",
    author: "テスト著者",
    coverImage: "https://example.com/cover.jpg",
  };

  const mockBooks: Book[] = [
    mockBook,
    {
      id: "test-id-2",
      title: "テスト書籍2",
      author: "テスト著者2",
      coverImage: "https://example.com/cover2.jpg",
    },
    {
      id: "test-id-3",
      title: "テスト書籍3",
      author: "テスト著者3",
      coverImage: null,
    },
  ];

  describe("saveBook", () => {
    it("書籍が正常に保存されること", async () => {
      // AsyncStorage.getItemが空の配列を返すようにモック
      AsyncStorage.getItem = jest.fn().mockResolvedValue(null);

      await BookStorageService.saveBook(mockBook);

      // setItemが正しいキーと値で呼ばれたことを確認
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@books",
        JSON.stringify([mockBook])
      );
    });

    it("既存の書籍がある場合、追加して保存されること", async () => {
      // 既存の書籍がある状態をモック
      const existingBooks = [
        {
          id: "existing-id",
          title: "既存の書籍",
          author: "既存の著者",
          coverImage: "https://example.com/existing.jpg",
        },
      ];
      AsyncStorage.getItem = jest
        .fn()
        .mockResolvedValue(JSON.stringify(existingBooks));

      await BookStorageService.saveBook(mockBook);

      // 既存の書籍と新しい書籍が結合されたことを確認
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@books",
        JSON.stringify([...existingBooks, mockBook])
      );
    });

    it("IDが重複する書籍は追加されないこと", async () => {
      // 既存の書籍がある状態をモック
      const existingBooks = [
        {
          id: "test-id-1", // 新しく追加する書籍と同じID
          title: "既存の書籍",
          author: "既存の著者",
          coverImage: "https://example.com/existing.jpg",
        },
      ];
      AsyncStorage.getItem = jest
        .fn()
        .mockResolvedValue(JSON.stringify(existingBooks));

      await BookStorageService.saveBook(mockBook);

      // setItemが呼ばれないことを確認（重複書籍のため）
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it("保存中にエラーが発生した場合、エラーがスローされること", async () => {
      // AsyncStorage.getItemがエラーをスローするようにモック
      const errorMessage = "保存中にエラーが発生しました";
      AsyncStorage.getItem = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      // コンソールエラーをモック
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await expect(BookStorageService.saveBook(mockBook)).rejects.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error saving book:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("getAllBooks", () => {
    it("保存されているすべての書籍を取得できること", async () => {
      // モックデータがAsyncStorageから返されるようにセット
      AsyncStorage.getItem = jest
        .fn()
        .mockResolvedValue(JSON.stringify(mockBooks));

      const books = await BookStorageService.getAllBooks();

      // getAllBooksがモックデータと同じ結果を返すことを確認
      expect(books).toEqual(mockBooks);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("@books");
    });

    it("保存されている書籍がない場合、空の配列を返すこと", async () => {
      AsyncStorage.getItem = jest.fn().mockResolvedValue(null);

      const books = await BookStorageService.getAllBooks();

      expect(books).toEqual([]);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("@books");
    });

    it("取得中にエラーが発生した場合、空の配列を返し、エラーをログ出力すること", async () => {
      // AsyncStorage.getItemがエラーをスローするようにモック
      const errorMessage = "取得中にエラーが発生しました";
      AsyncStorage.getItem = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      // コンソールエラーをモック
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const books = await BookStorageService.getAllBooks();

      expect(books).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error getting books:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("removeBook", () => {
    it("指定したIDの書籍が削除されること", async () => {
      // モックデータがAsyncStorageから返されるようにセット
      AsyncStorage.getItem = jest
        .fn()
        .mockResolvedValue(JSON.stringify(mockBooks));

      const bookIdToRemove = "test-id-1";
      await BookStorageService.removeBook(bookIdToRemove);

      // 削除後の書籍リストを確認
      const expectedBooks = mockBooks.filter(
        (book) => book.id !== bookIdToRemove
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@books",
        JSON.stringify(expectedBooks)
      );
    });

    it("削除中にエラーが発生した場合、エラーがスローされること", async () => {
      // AsyncStorage.getItemがエラーをスローするようにモック
      const errorMessage = "削除中にエラーが発生しました";
      AsyncStorage.getItem = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      // コンソールエラーをモック
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await expect(BookStorageService.removeBook("test-id")).rejects.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error removing book:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("deleteBook", () => {
    it("deleteBookはremoveBookのエイリアスとして機能すること", async () => {
      // AsyncStorageのモックをリセット
      AsyncStorage.getItem = jest
        .fn()
        .mockResolvedValue(JSON.stringify(mockBooks));

      // removeBookメソッドをスパイ
      const removeBookSpy = jest.spyOn(BookStorageService, "removeBook");

      const bookId = "test-id-1";
      await BookStorageService.deleteBook(bookId);

      // removeBookが同じ引数で呼ばれたことを確認
      expect(removeBookSpy).toHaveBeenCalledWith(bookId);

      removeBookSpy.mockRestore();
    });
  });

  describe("setLastClipBook", () => {
    it("最後に使用した書籍が正常に保存されること", async () => {
      await BookStorageService.setLastClipBook(mockBook);

      // setItemが正しいキーと値で呼ばれたことを確認
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@last_clip_book",
        JSON.stringify(mockBook)
      );
    });

    it("保存中にエラーが発生した場合、エラーがスローされること", async () => {
      // AsyncStorage.setItemがエラーをスローするようにモック
      const errorMessage = "保存中にエラーが発生しました";
      AsyncStorage.setItem = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      // コンソールエラーをモック
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await expect(
        BookStorageService.setLastClipBook(mockBook)
      ).rejects.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error setting last clip book:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("getLastClipBook", () => {
    it("最後に使用した書籍を取得できること", async () => {
      // モックデータがAsyncStorageから返されるようにセット
      AsyncStorage.getItem = jest
        .fn()
        .mockResolvedValue(JSON.stringify(mockBook));

      const book = await BookStorageService.getLastClipBook();

      // getLastClipBookがモックデータと同じ結果を返すことを確認
      expect(book).toEqual(mockBook);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("@last_clip_book");
    });

    it("保存されている書籍がない場合、nullを返すこと", async () => {
      AsyncStorage.getItem = jest.fn().mockResolvedValue(null);

      const book = await BookStorageService.getLastClipBook();

      expect(book).toBeNull();
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("@last_clip_book");
    });

    it("取得中にエラーが発生した場合、nullを返し、エラーをログ出力すること", async () => {
      // AsyncStorage.getItemがエラーをスローするようにモック
      const errorMessage = "取得中にエラーが発生しました";
      AsyncStorage.getItem = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      // コンソールエラーをモック
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const book = await BookStorageService.getLastClipBook();

      expect(book).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error getting last clip book:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});
