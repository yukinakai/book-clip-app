import { RakutenBookService } from "../../services/RakutenBookService";
import { BookStorageService } from "../../services/BookStorageService";
import { Book } from "../../constants/MockData";

// グローバルfetchのモック
global.fetch = jest.fn();

// BookStorageServiceのモック
jest.mock("../../services/BookStorageService", () => ({
  BookStorageService: {
    getAllBooks: jest.fn(),
    saveBook: jest.fn(),
  },
}));

describe("RakutenBookService", () => {
  // テストの前にモックをリセット
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // テスト用のモックデータ
  const mockRakutenResponse = {
    Items: [
      {
        Item: {
          isbn: "9784000000000",
          title: "テスト書籍",
          author: "テスト著者",
          largeImageUrl: "https://example.com/cover.jpg",
        },
      },
    ],
  };

  const expectedBook: Book = {
    id: expect.any(String), // Date.now()を使用しているため、具体的な値は期待しない
    isbn: "9784000000000",
    title: "テスト書籍",
    author: "テスト著者",
    coverImage: "https://example.com/cover.jpg",
  };

  describe("searchByIsbn", () => {
    it("ISBNで書籍を正常に検索できること", async () => {
      // fetchのモックを設定
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockRakutenResponse),
      });

      const result = await RakutenBookService.searchByIsbn("9784000000000");

      expect(result).toMatchObject(expectedBook);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("9784000000000")
      );
    });

    it("書籍が見つからない場合、nullを返すこと", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ Items: [] }),
      });

      const result = await RakutenBookService.searchByIsbn("9784000000000");

      expect(result).toBeNull();
    });

    it("APIエラーの場合、エラーがスローされること", async () => {
      const error = new Error("API Error");
      (global.fetch as jest.Mock).mockRejectedValueOnce(error);

      await expect(
        RakutenBookService.searchByIsbn("9784000000000")
      ).rejects.toThrow();
    });
  });

  describe("searchAndSaveBook", () => {
    it("新規書籍を検索して保存できること", async () => {
      // fetchのモックを設定
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockRakutenResponse),
      });

      // BookStorageServiceのモックを設定
      (BookStorageService.getAllBooks as jest.Mock).mockResolvedValueOnce([]);
      (BookStorageService.saveBook as jest.Mock).mockResolvedValueOnce(
        undefined
      );

      const result = await RakutenBookService.searchAndSaveBook(
        "9784000000000"
      );

      expect(result).toEqual({
        book: expect.objectContaining(expectedBook),
        isExisting: false,
      });
      expect(BookStorageService.saveBook).toHaveBeenCalled();
    });

    it("既存の書籍の場合、保存せずに既存フラグを返すこと", async () => {
      // fetchのモックを設定
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockRakutenResponse),
      });

      // 既存の書籍が存在する状態をモック
      (BookStorageService.getAllBooks as jest.Mock).mockResolvedValueOnce([
        { ...expectedBook, id: "existing_id" },
      ]);

      const result = await RakutenBookService.searchAndSaveBook(
        "9784000000000"
      );

      expect(result).toEqual({
        book: expect.objectContaining(expectedBook),
        isExisting: true,
      });
      expect(BookStorageService.saveBook).not.toHaveBeenCalled();
    });

    it("書籍が見つからない場合、適切な結果を返すこと", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ Items: [] }),
      });

      const result = await RakutenBookService.searchAndSaveBook(
        "9784000000000"
      );

      expect(result).toEqual({
        book: null,
        isExisting: false,
      });
      expect(BookStorageService.saveBook).not.toHaveBeenCalled();
    });

    it("エラーが発生した場合、エラーがスローされること", async () => {
      const error = new Error("API Error");
      (global.fetch as jest.Mock).mockRejectedValueOnce(error);

      await expect(
        RakutenBookService.searchAndSaveBook("9784000000000")
      ).rejects.toThrow();
    });
  });
});
