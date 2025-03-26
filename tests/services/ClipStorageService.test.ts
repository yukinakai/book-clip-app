import { ClipStorageService } from "../../services/ClipStorageService";
import { Clip } from "../../constants/MockData";

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

  describe("匿名認証環境向けメソッド", () => {
    it("saveClipは警告を出力して何も行わないこと", async () => {
      const consoleSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      await ClipStorageService.saveClip(mockClip);

      expect(consoleSpy).toHaveBeenCalledWith(
        "匿名認証環境ではクリップの保存はSupabaseに直接行われます"
      );

      consoleSpy.mockRestore();
    });

    it("getAllClipsは警告を出力して空配列を返すこと", async () => {
      const consoleSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const result = await ClipStorageService.getAllClips();

      expect(consoleSpy).toHaveBeenCalledWith(
        "匿名認証環境ではクリップの取得はSupabaseから直接行われます"
      );
      expect(result).toEqual([]);

      consoleSpy.mockRestore();
    });

    it("getClipsByBookIdは警告を出力して空配列を返すこと", async () => {
      const consoleSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const result = await ClipStorageService.getClipsByBookId("book-1");

      expect(consoleSpy).toHaveBeenCalledWith(
        "匿名認証環境ではクリップの取得はSupabaseから直接行われます"
      );
      expect(result).toEqual([]);

      consoleSpy.mockRestore();
    });

    it("getClipByIdは警告を出力してnullを返すこと", async () => {
      const consoleSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const result = await ClipStorageService.getClipById("test-id-1");

      expect(consoleSpy).toHaveBeenCalledWith(
        "匿名認証環境ではクリップの取得はSupabaseから直接行われます"
      );
      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });

    it("removeClipは警告を出力して何も行わないこと", async () => {
      const consoleSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      await ClipStorageService.removeClip("test-id-1");

      expect(consoleSpy).toHaveBeenCalledWith(
        "匿名認証環境ではクリップの削除はSupabaseで直接行われます"
      );

      consoleSpy.mockRestore();
    });

    it("updateClipは警告を出力して何も行わないこと", async () => {
      const consoleSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      await ClipStorageService.updateClip(mockClip);

      expect(consoleSpy).toHaveBeenCalledWith(
        "匿名認証環境ではクリップの更新はSupabaseで直接行われます"
      );

      consoleSpy.mockRestore();
    });

    it("deleteClipsByBookIdは警告を出力して何も行わないこと", async () => {
      const consoleSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      await ClipStorageService.deleteClipsByBookId("book-1");

      expect(consoleSpy).toHaveBeenCalledWith(
        "匿名認証環境ではクリップの削除はSupabaseで直接行われます"
      );

      consoleSpy.mockRestore();
    });
  });
});
