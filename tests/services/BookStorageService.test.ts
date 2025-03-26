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
    isbn: "9784000000000",
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

  describe("匿名認証環境向けメソッド", () => {
    it("saveBookは警告を出力して何も行わないこと", async () => {
      const consoleSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      await BookStorageService.saveBook(mockBook);

      expect(consoleSpy).toHaveBeenCalledWith(
        "匿名認証環境では書籍の保存はSupabaseに直接行われます"
      );
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("getAllBooksは警告を出力して空配列を返すこと", async () => {
      const consoleSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const result = await BookStorageService.getAllBooks();

      expect(consoleSpy).toHaveBeenCalledWith(
        "匿名認証環境では書籍の取得はSupabaseから直接行われます"
      );
      expect(result).toEqual([]);
      expect(AsyncStorage.getItem).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("getBookByIdは警告を出力してnullを返すこと", async () => {
      const consoleSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const result = await BookStorageService.getBookById("test-id");

      expect(consoleSpy).toHaveBeenCalledWith(
        "匿名認証環境では書籍の取得はSupabaseから直接行われます"
      );
      expect(result).toBeNull();
      expect(AsyncStorage.getItem).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("updateBookは警告を出力して何も行わないこと", async () => {
      const consoleSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      await BookStorageService.updateBook(mockBook);

      expect(consoleSpy).toHaveBeenCalledWith(
        "匿名認証環境では書籍の更新はSupabaseで直接行われます"
      );
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("removeBookは警告を出力して何も行わないこと", async () => {
      const consoleSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      await BookStorageService.removeBook("test-id");

      expect(consoleSpy).toHaveBeenCalledWith(
        "匿名認証環境では書籍の削除はSupabaseで直接行われます"
      );
      expect(AsyncStorage.removeItem).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("deleteBookは警告を出力して何も行わないこと", async () => {
      const consoleSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      await BookStorageService.deleteBook("test-id");

      expect(consoleSpy).toHaveBeenCalledWith(
        "匿名認証環境では書籍の削除はSupabaseで直接行われます"
      );
      expect(AsyncStorage.removeItem).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("setLastClipBook", () => {
    it("最後に選択された書籍が正常に保存されること", async () => {
      await BookStorageService.setLastClipBook(mockBook);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@last_clip_book",
        JSON.stringify(mockBook)
      );
    });

    it("保存中にエラーが発生した場合もエラーをスローせず、コンソールに出力すること", async () => {
      // setItemがエラーを投げるよう設定
      AsyncStorage.setItem = jest
        .fn()
        .mockRejectedValue(new Error("保存エラー"));

      // コンソールエラーをモック
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // エラーがスローされないことを確認
      await expect(
        BookStorageService.setLastClipBook(mockBook)
      ).resolves.not.toThrow();

      // エラーがコンソールに出力されることを確認
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error saving last clip book:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("getLastClipBook", () => {
    it("保存されている最後のクリップ書籍を取得できること", async () => {
      // 保存されている書籍データをモック
      AsyncStorage.getItem = jest
        .fn()
        .mockResolvedValue(JSON.stringify(mockBook));

      const book = await BookStorageService.getLastClipBook();

      // 正しい書籍が返されることを確認
      expect(book).toEqual(mockBook);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("@last_clip_book");
    });

    it("保存されている書籍がない場合、nullを返すこと", async () => {
      // 保存データなしをモック
      AsyncStorage.getItem = jest.fn().mockResolvedValue(null);

      const book = await BookStorageService.getLastClipBook();

      // nullが返されることを確認
      expect(book).toBeNull();
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("@last_clip_book");
    });

    it("取得中にエラーが発生した場合、nullを返し、エラーをログ出力すること", async () => {
      // getItemがエラーを投げるよう設定
      AsyncStorage.getItem = jest
        .fn()
        .mockRejectedValue(new Error("取得エラー"));

      // コンソールエラーをモック
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const book = await BookStorageService.getLastClipBook();

      // nullが返され、エラーログが出力されることを確認
      expect(book).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error getting last clip book:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});
