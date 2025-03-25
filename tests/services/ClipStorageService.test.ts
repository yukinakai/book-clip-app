import { ClipStorageService } from "../../services/ClipStorageService";
import { Clip } from "../../constants/MockData";
import { BookStorageService } from "../../services/BookStorageService";

// AsyncStorageのモックをセットアップ
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// BookStorageServiceをモック
jest.mock("../../services/BookStorageService", () => ({
  BookStorageService: {
    getAllBooks: jest.fn(),
    setLastClipBook: jest.fn(),
  },
}));

describe("ClipStorageService", () => {
  // 各テストの前にモックをリセット
  beforeEach(() => {
    jest.clearAllMocks();
    // テスト実行ごとにモック関数をリセット
    (BookStorageService.getAllBooks as jest.Mock).mockReset();
    (BookStorageService.setLastClipBook as jest.Mock).mockReset();

    // モックのLocalStorageServiceを作成して設定
    ClipStorageService.setStorageBackend({
      saveClip: jest.fn().mockResolvedValue(undefined),
      getAllClips: jest.fn().mockResolvedValue([]),
      getClipsByBookId: jest.fn().mockResolvedValue([]),
      getClipById: jest.fn().mockResolvedValue(null),
      removeClip: jest.fn().mockResolvedValue(undefined),
      updateClip: jest.fn().mockResolvedValue(undefined),
      deleteClipsByBookId: jest.fn().mockResolvedValue(undefined),
      saveBook: jest.fn().mockResolvedValue(undefined),
      getAllBooks: jest.fn().mockResolvedValue([]),
      getBookById: jest.fn().mockResolvedValue(null),
      removeBook: jest.fn().mockResolvedValue(undefined),
      clearAllData: jest.fn().mockResolvedValue(undefined),
    });
  });

  // テスト用データ
  const mockClip: Clip = {
    id: "test-id-1",
    bookId: "book-1",
    text: "テストクリップです",
    page: 42,
    createdAt: "2023-06-15T10:30:00Z",
  };

  const mockClips: Clip[] = [
    mockClip,
    {
      id: "test-id-2",
      bookId: "book-1",
      text: "2つ目のテストクリップです",
      page: 100,
      createdAt: "2023-06-16T10:30:00Z",
    },
    {
      id: "test-id-3",
      bookId: "book-2",
      text: "別の書籍のクリップです",
      page: 55,
      createdAt: "2023-06-17T10:30:00Z",
    },
  ];

  describe("saveClip", () => {
    it("クリップが正常に保存されること", async () => {
      // ストレージバックエンドのメソッドをスパイ
      const saveClipSpy = jest
        .spyOn(ClipStorageService["storageBackend"], "saveClip")
        .mockResolvedValue(undefined);

      await ClipStorageService.saveClip(mockClip);

      // saveClipメソッドが呼ばれたことを確認
      expect(saveClipSpy).toHaveBeenCalledWith(mockClip);
    });

    it("既存のクリップがある場合、追加して保存されること", async () => {
      // ストレージバックエンドのメソッドをスパイ
      const saveClipSpy = jest
        .spyOn(ClipStorageService["storageBackend"], "saveClip")
        .mockResolvedValue(undefined);

      await ClipStorageService.saveClip(mockClip);

      // saveClipメソッドが呼ばれたことを確認
      expect(saveClipSpy).toHaveBeenCalledWith(mockClip);
    });

    it("書籍が見つからない場合、setLastClipBookは呼ばれないこと", async () => {
      // ストレージバックエンドのメソッドをスパイ
      const saveClipSpy = jest
        .spyOn(ClipStorageService["storageBackend"], "saveClip")
        .mockResolvedValue(undefined);

      await ClipStorageService.saveClip({
        ...mockClip,
        bookId: "non-existing-book",
      });

      // saveClipメソッドが呼ばれたことを確認
      expect(saveClipSpy).toHaveBeenCalledWith({
        ...mockClip,
        bookId: "non-existing-book",
      });
    });

    it("保存中にエラーが発生した場合、エラーがスローされること", async () => {
      // ストレージバックエンドのsaveClipがエラーをスローするようにスパイ
      const errorMessage = "保存中にエラーが発生しました";
      jest
        .spyOn(ClipStorageService["storageBackend"], "saveClip")
        .mockRejectedValue(new Error(errorMessage));

      // コンソールエラーをモック
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await expect(ClipStorageService.saveClip(mockClip)).rejects.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe("getAllClips", () => {
    it("保存されているすべてのクリップを取得できること", async () => {
      // モックデータがstorageBackendから返されるようにセット
      jest
        .spyOn(ClipStorageService["storageBackend"], "getAllClips")
        .mockResolvedValue(mockClips);

      const clips = await ClipStorageService.getAllClips();

      // getAllClipsがモックデータと同じ結果を返すことを確認
      expect(clips).toEqual(mockClips);
      expect(
        ClipStorageService["storageBackend"].getAllClips
      ).toHaveBeenCalled();
    });

    it("保存されているクリップがない場合、空の配列を返すこと", async () => {
      jest
        .spyOn(ClipStorageService["storageBackend"], "getAllClips")
        .mockResolvedValue([]);

      const clips = await ClipStorageService.getAllClips();

      expect(clips).toEqual([]);
      expect(
        ClipStorageService["storageBackend"].getAllClips
      ).toHaveBeenCalled();
    });
  });

  describe("getClipsByBookId", () => {
    it("指定した書籍IDに関連するクリップのみを取得できること", async () => {
      // book-1に関連するクリップのみ
      const expectedClips = mockClips.filter(
        (clip) => clip.bookId === "book-1"
      );
      jest
        .spyOn(ClipStorageService["storageBackend"], "getClipsByBookId")
        .mockResolvedValue(expectedClips);

      const bookId = "book-1";
      const clips = await ClipStorageService.getClipsByBookId(bookId);

      // book-1に関連するクリップのみが返されることを確認
      expect(clips).toEqual(expectedClips);
      expect(clips.length).toBe(2);
      expect(
        ClipStorageService["storageBackend"].getClipsByBookId
      ).toHaveBeenCalledWith(bookId);
    });

    it("指定した書籍IDに関連するクリップがない場合、空の配列を返すこと", async () => {
      jest
        .spyOn(ClipStorageService["storageBackend"], "getClipsByBookId")
        .mockResolvedValue([]);

      const nonExistingBookId = "non-existing-book";
      const clips = await ClipStorageService.getClipsByBookId(
        nonExistingBookId
      );

      expect(clips).toEqual([]);
      expect(
        ClipStorageService["storageBackend"].getClipsByBookId
      ).toHaveBeenCalledWith(nonExistingBookId);
    });
  });

  describe("removeClip", () => {
    it("指定したIDのクリップが削除されること", async () => {
      const removeClipSpy = jest
        .spyOn(ClipStorageService["storageBackend"], "removeClip")
        .mockResolvedValue(undefined);

      const clipIdToRemove = "test-id-1";
      await ClipStorageService.removeClip(clipIdToRemove);

      // removeClipが呼ばれたことを確認
      expect(removeClipSpy).toHaveBeenCalledWith(clipIdToRemove);
    });
  });

  describe("updateClip", () => {
    it("指定したIDのクリップが更新されること", async () => {
      const updateClipSpy = jest
        .spyOn(ClipStorageService["storageBackend"], "updateClip")
        .mockResolvedValue(undefined);

      // 更新するクリップデータ
      const updatedClip: Clip = {
        ...mockClip,
        text: "更新されたテキスト",
        page: 99,
      };

      await ClipStorageService.updateClip(updatedClip);

      // updateClipが呼ばれたことを確認
      expect(updateClipSpy).toHaveBeenCalledWith(updatedClip);
    });

    it("更新中にエラーが発生した場合、エラーがスローされること", async () => {
      // updateClipがエラーをスローするようにモック
      const errorMessage = "更新中にエラーが発生しました";
      jest
        .spyOn(ClipStorageService["storageBackend"], "updateClip")
        .mockRejectedValue(new Error(errorMessage));

      // コンソールエラーをモック（グローバルconsole.errorをjest.fnに置き換え）
      const originalConsoleError = console.error;
      console.error = jest.fn();

      try {
        await expect(ClipStorageService.updateClip(mockClip)).rejects.toThrow();
        expect(console.error).toHaveBeenCalledWith(
          "Error updating clip:",
          expect.any(Error)
        );
      } finally {
        // テスト終了後に元に戻す
        console.error = originalConsoleError;
      }
    });
  });

  describe("deleteClipsByBookId", () => {
    it("指定した書籍IDに関連するすべてのクリップが削除されること", async () => {
      const deleteClipsSpy = jest
        .spyOn(ClipStorageService["storageBackend"], "deleteClipsByBookId")
        .mockResolvedValue(undefined);

      const bookIdToRemove = "book-1";
      await ClipStorageService.deleteClipsByBookId(bookIdToRemove);

      // deleteClipsByBookIdが呼ばれたことを確認
      expect(deleteClipsSpy).toHaveBeenCalledWith(bookIdToRemove);
    });

    it("削除中にエラーが発生した場合、エラーがスローされること", async () => {
      // deleteClipsByBookIdがエラーをスローするようにモック
      const errorMessage = "削除中にエラーが発生しました";
      jest
        .spyOn(ClipStorageService["storageBackend"], "deleteClipsByBookId")
        .mockRejectedValue(new Error(errorMessage));

      // コンソールエラーをモック（グローバルconsole.errorをjest.fnに置き換え）
      const originalConsoleError = console.error;
      console.error = jest.fn();

      try {
        await expect(
          ClipStorageService.deleteClipsByBookId("book-1")
        ).rejects.toThrow();
        expect(console.error).toHaveBeenCalledWith(
          "Error deleting clips by book ID:",
          expect.any(Error)
        );
      } finally {
        // テスト終了後に元に戻す
        console.error = originalConsoleError;
      }
    });
  });
});
