import { LocalStorageService } from "../../services/LocalStorageService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Book } from "../../constants/MockData";

// AsyncStorageのモックをセットアップ
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe("LocalStorageService", () => {
  let localStorageService: LocalStorageService;

  // 各テストの前にモックをリセットし、LocalStorageServiceインスタンスを作成
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageService = new LocalStorageService();
  });

  // テスト用データ
  const mockBook: Book = {
    id: "test-id-1",
    title: "テスト書籍",
    author: "テスト著者",
    coverImage: "https://example.com/cover.jpg",
    isbn: "9784000000000",
  };

  describe("setLastClipBook", () => {
    it("最後に選択された書籍が正常に保存されること", async () => {
      // テスト用の書籍データ
      const book = { ...mockBook };

      // メソッド実行
      await localStorageService.setLastClipBook(book);

      // 正しく保存されたことを確認
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@last_clip_book",
        JSON.stringify(book)
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
        localStorageService.setLastClipBook(mockBook)
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

      // メソッド実行
      const book = await localStorageService.getLastClipBook();

      // 正しい書籍が返されることを確認
      expect(book).toEqual(mockBook);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("@last_clip_book");
    });

    it("保存されている書籍がない場合、nullを返すこと", async () => {
      // 保存データなしをモック
      AsyncStorage.getItem = jest.fn().mockResolvedValue(null);

      // メソッド実行
      const book = await localStorageService.getLastClipBook();

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

      // メソッド実行
      const book = await localStorageService.getLastClipBook();

      // nullが返され、エラーログが出力されることを確認
      expect(book).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error getting last clip book:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("clearAllData", () => {
    it("データが正常にクリアされること", async () => {
      // メソッド実行
      await localStorageService.clearAllData();

      // removeItemが正しいキーで呼ばれたことを確認
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("@last_clip_book");
    });

    it("クリア中にエラーが発生した場合、エラーがスローされること", async () => {
      // removeItemがエラーを投げるよう設定
      AsyncStorage.removeItem = jest
        .fn()
        .mockRejectedValue(new Error("クリアエラー"));

      // コンソールエラーをモック
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // エラーがスローされることを確認
      await expect(localStorageService.clearAllData()).rejects.toThrow();

      // エラーがコンソールに出力されることを確認
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error clearing data:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});
