import { ClipStorageService } from "../../services/ClipStorageService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Clip } from "../../constants/MockData";

// AsyncStorageのモックをセットアップ
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe("ClipStorageService", () => {
  // 各テストの前にモックをリセット
  beforeEach(() => {
    jest.clearAllMocks();
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
      // AsyncStorage.getItemが空の配列を返すようにモック
      AsyncStorage.getItem = jest.fn().mockResolvedValue(null);

      await ClipStorageService.saveClip(mockClip);

      // setItemが正しいキーと値で呼ばれたことを確認
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@saved_clips",
        JSON.stringify([mockClip])
      );
    });

    it("既存のクリップがある場合、追加して保存されること", async () => {
      // 既存のクリップがある状態をモック
      const existingClips = [
        {
          id: "existing-id",
          bookId: "book-1",
          text: "既存のクリップ",
          page: 30,
          createdAt: "2023-06-14T10:30:00Z",
        },
      ];
      AsyncStorage.getItem = jest
        .fn()
        .mockResolvedValue(JSON.stringify(existingClips));

      await ClipStorageService.saveClip(mockClip);

      // 既存のクリップと新しいクリップが結合されたことを確認
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@saved_clips",
        JSON.stringify([...existingClips, mockClip])
      );
    });
  });

  describe("getAllClips", () => {
    it("保存されているすべてのクリップを取得できること", async () => {
      // モックデータがAsyncStorageから返されるようにセット
      AsyncStorage.getItem = jest
        .fn()
        .mockResolvedValue(JSON.stringify(mockClips));

      const clips = await ClipStorageService.getAllClips();

      // getAllClipsがモックデータと同じ結果を返すことを確認
      expect(clips).toEqual(mockClips);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("@saved_clips");
    });

    it("保存されているクリップがない場合、空の配列を返すこと", async () => {
      AsyncStorage.getItem = jest.fn().mockResolvedValue(null);

      const clips = await ClipStorageService.getAllClips();

      expect(clips).toEqual([]);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("@saved_clips");
    });
  });

  describe("getClipsByBookId", () => {
    it("指定した書籍IDに関連するクリップのみを取得できること", async () => {
      // モックデータがAsyncStorageから返されるようにセット
      AsyncStorage.getItem = jest
        .fn()
        .mockResolvedValue(JSON.stringify(mockClips));

      const bookId = "book-1";
      const clips = await ClipStorageService.getClipsByBookId(bookId);

      // book-1に関連するクリップのみが返されることを確認
      const expectedClips = mockClips.filter((clip) => clip.bookId === bookId);
      expect(clips).toEqual(expectedClips);
      expect(clips.length).toBe(2);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("@saved_clips");
    });

    it("指定した書籍IDに関連するクリップがない場合、空の配列を返すこと", async () => {
      AsyncStorage.getItem = jest
        .fn()
        .mockResolvedValue(JSON.stringify(mockClips));

      const nonExistingBookId = "non-existing-book";
      const clips = await ClipStorageService.getClipsByBookId(
        nonExistingBookId
      );

      expect(clips).toEqual([]);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("@saved_clips");
    });
  });

  describe("removeClip", () => {
    it("指定したIDのクリップが削除されること", async () => {
      // モックデータがAsyncStorageから返されるようにセット
      AsyncStorage.getItem = jest
        .fn()
        .mockResolvedValue(JSON.stringify(mockClips));

      const clipIdToRemove = "test-id-1";
      await ClipStorageService.removeClip(clipIdToRemove);

      // 削除後のクリップリストを確認
      const expectedClips = mockClips.filter(
        (clip) => clip.id !== clipIdToRemove
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@saved_clips",
        JSON.stringify(expectedClips)
      );
    });
  });

  describe("updateClip", () => {
    it("指定したIDのクリップが更新されること", async () => {
      // モックデータがAsyncStorageから返されるようにセット
      AsyncStorage.getItem = jest
        .fn()
        .mockResolvedValue(JSON.stringify(mockClips));

      // 更新するクリップデータ
      const updatedClip: Clip = {
        ...mockClip,
        text: "更新されたテキスト",
        page: 99,
      };

      await ClipStorageService.updateClip(updatedClip);

      // 更新後のクリップリストを確認
      const expectedClips = mockClips.map((clip) =>
        clip.id === updatedClip.id ? updatedClip : clip
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@saved_clips",
        JSON.stringify(expectedClips)
      );
    });

    it("更新中にエラーが発生した場合、エラーがスローされること", async () => {
      // AsyncStorage.getItemがエラーをスローするようにモック
      const errorMessage = "更新中にエラーが発生しました";
      AsyncStorage.getItem = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      // コンソールエラーをモック
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await expect(ClipStorageService.updateClip(mockClip)).rejects.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error updating clip:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("deleteClipsByBookId", () => {
    it("指定した書籍IDに関連するすべてのクリップが削除されること", async () => {
      // モックデータがAsyncStorageから返されるようにセット
      AsyncStorage.getItem = jest
        .fn()
        .mockResolvedValue(JSON.stringify(mockClips));

      const bookIdToRemove = "book-1";
      await ClipStorageService.deleteClipsByBookId(bookIdToRemove);

      // 削除後のクリップリストを確認（book-1以外のクリップのみが残る）
      const expectedClips = mockClips.filter(
        (clip) => clip.bookId !== bookIdToRemove
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@saved_clips",
        JSON.stringify(expectedClips)
      );
      // book-1のクリップが2つあるので、1つのクリップだけが残ることを確認
      expect(expectedClips.length).toBe(1);
      expect(expectedClips[0].bookId).toBe("book-2");
    });

    it("指定した書籍IDに関連するクリップがない場合、変更なしで保存されること", async () => {
      // モックデータがAsyncStorageから返されるようにセット
      AsyncStorage.getItem = jest
        .fn()
        .mockResolvedValue(JSON.stringify(mockClips));

      const nonExistingBookId = "non-existing-book";
      await ClipStorageService.deleteClipsByBookId(nonExistingBookId);

      // 元のクリップリストと同じ内容が保存されることを確認
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@saved_clips",
        JSON.stringify(mockClips)
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

      await expect(
        ClipStorageService.deleteClipsByBookId("book-1")
      ).rejects.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error deleting clips by book ID:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});
