import { LocalStorageService } from "../../services/LocalStorageService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Book, Clip } from "../../constants/MockData";

// AsyncStorageのモックをセットアップ
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
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

  const mockClip: Clip = {
    id: "clip-id-1",
    bookId: "test-id-1",
    text: "テストクリップです",
    page: 42,
    createdAt: "2023-06-15T10:30:00Z",
  };

  const mockClips: Clip[] = [
    mockClip,
    {
      id: "clip-id-2",
      bookId: "test-id-1",
      text: "2つ目のテストクリップです",
      page: 100,
      createdAt: "2023-06-16T10:30:00Z",
    },
    {
      id: "clip-id-3",
      bookId: "test-id-2",
      text: "別の書籍のクリップです",
      page: 55,
      createdAt: "2023-06-17T10:30:00Z",
    },
  ];

  // 書籍関連のテスト
  describe("書籍関連の操作", () => {
    describe("saveBook", () => {
      it("書籍が正常に保存されること", async () => {
        // AsyncStorage.getItemが空の配列を返すようにモック
        AsyncStorage.getItem = jest.fn().mockResolvedValue(null);

        await localStorageService.saveBook(mockBook);

        // setItemが正しいキーと値で呼ばれたことを確認
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          "@saved_books",
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

        await localStorageService.saveBook(mockBook);

        // 既存の書籍と新しい書籍が結合されたことを確認
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          "@saved_books",
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

        await localStorageService.saveBook(mockBook);

        // 重複IDの書籍は追加されないことを確認
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

        await expect(localStorageService.saveBook(mockBook)).rejects.toThrow();
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

        const books = await localStorageService.getAllBooks();

        // getAllBooksがモックデータと同じ結果を返すことを確認
        expect(books).toEqual(mockBooks);
        expect(AsyncStorage.getItem).toHaveBeenCalledWith("@saved_books");
      });

      it("保存されている書籍がない場合、空の配列を返すこと", async () => {
        AsyncStorage.getItem = jest.fn().mockResolvedValue(null);

        const books = await localStorageService.getAllBooks();

        expect(books).toEqual([]);
        expect(AsyncStorage.getItem).toHaveBeenCalledWith("@saved_books");
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

        const books = await localStorageService.getAllBooks();

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
        await localStorageService.removeBook(bookIdToRemove);

        // 削除後の書籍リストを確認
        const expectedBooks = mockBooks.filter(
          (book) => book.id !== bookIdToRemove
        );
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          "@saved_books",
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

        await expect(
          localStorageService.removeBook("test-id-1")
        ).rejects.toThrow();
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error removing book:",
          expect.any(Error)
        );

        consoleSpy.mockRestore();
      });
    });

    describe("setLastClipBook", () => {
      it("最後に使用した書籍が正常に保存されること", async () => {
        await localStorageService.setLastClipBook(mockBook);

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
          localStorageService.setLastClipBook(mockBook)
        ).rejects.toThrow();
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error saving last clip book:",
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

        const book = await localStorageService.getLastClipBook();

        expect(book).toEqual(mockBook);
        expect(AsyncStorage.getItem).toHaveBeenCalledWith("@last_clip_book");
      });

      it("保存されている最後の書籍がない場合、nullを返すこと", async () => {
        AsyncStorage.getItem = jest.fn().mockResolvedValue(null);

        const book = await localStorageService.getLastClipBook();

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

        const book = await localStorageService.getLastClipBook();

        expect(book).toBeNull();
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error getting last clip book:",
          expect.any(Error)
        );

        consoleSpy.mockRestore();
      });
    });
  });

  // クリップ関連のテスト
  describe("クリップ関連の操作", () => {
    describe("saveClip", () => {
      it("クリップが正常に保存されること", async () => {
        // AsyncStorage.getItemが空の配列を返すようにモック
        AsyncStorage.getItem = jest.fn().mockResolvedValue(null);

        // AsyncStorage.setItemを正常に動作するようにモック
        AsyncStorage.setItem = jest.fn().mockResolvedValue(undefined);

        // 日付固定のためにDate.nowとnew Dateをモック
        const mockTimestamp = 1624186800000; // 2021-06-20T12:00:00Z in milliseconds
        const mockDateString = "2021-06-20T12:00:00Z";

        // mock Date.getTime()
        const mockDateInstance = {
          getTime: jest.fn().mockReturnValue(mockTimestamp),
          toISOString: jest.fn().mockReturnValue(mockDateString),
        };
        jest
          .spyOn(global, "Date")
          .mockImplementation(() => mockDateInstance as unknown as Date);

        const clipWithoutIdAndDate = {
          bookId: "test-id-1",
          text: "新しいクリップ",
          page: 50,
        };

        await localStorageService.saveClip(clipWithoutIdAndDate as Clip);

        // 自動生成されたIDと日付を含むクリップが保存されることを確認
        const expectedClip = {
          ...clipWithoutIdAndDate,
          id: mockTimestamp.toString(),
          createdAt: mockDateString,
        };

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          "@saved_clips",
          JSON.stringify([expectedClip])
        );

        // モックをリストア
        (global.Date as jest.Mock).mockRestore();
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

        // AsyncStorage.setItemを正常に動作するようにモック
        AsyncStorage.setItem = jest.fn().mockResolvedValue(undefined);

        await localStorageService.saveClip(mockClip);

        // 既存のクリップと新しいクリップが結合されたことを確認
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          "@saved_clips",
          JSON.stringify([...existingClips, mockClip])
        );
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

        await expect(localStorageService.saveClip(mockClip)).rejects.toThrow();
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error saving clip:",
          expect.any(Error)
        );

        consoleSpy.mockRestore();
      });
    });

    describe("getAllClips", () => {
      it("保存されているすべてのクリップを取得できること", async () => {
        // モックデータがAsyncStorageから返されるようにセット
        AsyncStorage.getItem = jest
          .fn()
          .mockResolvedValue(JSON.stringify(mockClips));

        const clips = await localStorageService.getAllClips();

        // getAllClipsがモックデータと同じ結果を返すことを確認
        expect(clips).toEqual(mockClips);
        expect(AsyncStorage.getItem).toHaveBeenCalledWith("@saved_clips");
      });

      it("保存されているクリップがない場合、空の配列を返すこと", async () => {
        AsyncStorage.getItem = jest.fn().mockResolvedValue(null);

        const clips = await localStorageService.getAllClips();

        expect(clips).toEqual([]);
        expect(AsyncStorage.getItem).toHaveBeenCalledWith("@saved_clips");
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

        const clips = await localStorageService.getAllClips();

        expect(clips).toEqual([]);
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error getting clips:",
          expect.any(Error)
        );

        consoleSpy.mockRestore();
      });
    });

    describe("getClipsByBookId", () => {
      it("指定した書籍IDに関連するクリップのみを取得できること", async () => {
        // モックデータがAsyncStorageから返されるようにセット
        AsyncStorage.getItem = jest
          .fn()
          .mockResolvedValue(JSON.stringify(mockClips));

        const bookId = "test-id-1";
        const clips = await localStorageService.getClipsByBookId(bookId);

        // test-id-1に関連するクリップのみが返されることを確認
        const expectedClips = mockClips.filter(
          (clip) => clip.bookId === bookId
        );
        expect(clips).toEqual(expectedClips);
        expect(clips.length).toBe(2);
        expect(AsyncStorage.getItem).toHaveBeenCalledWith("@saved_clips");
      });

      it("指定した書籍IDに関連するクリップがない場合、空の配列を返すこと", async () => {
        AsyncStorage.getItem = jest
          .fn()
          .mockResolvedValue(JSON.stringify(mockClips));

        const nonExistingBookId = "non-existing-book";
        const clips = await localStorageService.getClipsByBookId(
          nonExistingBookId
        );

        expect(clips).toEqual([]);
        expect(AsyncStorage.getItem).toHaveBeenCalledWith("@saved_clips");
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

        const clips = await localStorageService.getClipsByBookId("test-id-1");

        expect(clips).toEqual([]);
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error getting clips:",
          expect.any(Error)
        );

        consoleSpy.mockRestore();
      });
    });

    describe("removeClip", () => {
      it("指定したIDのクリップが削除されること", async () => {
        // モックデータがAsyncStorageから返されるようにセット
        AsyncStorage.getItem = jest
          .fn()
          .mockResolvedValue(JSON.stringify(mockClips));

        // AsyncStorage.setItemを正常に動作するようにモック
        AsyncStorage.setItem = jest.fn().mockResolvedValue(undefined);

        const clipIdToRemove = "clip-id-1";
        await localStorageService.removeClip(clipIdToRemove);

        // 削除後のクリップリストを確認
        const expectedClips = mockClips.filter(
          (clip) => clip.id !== clipIdToRemove
        );
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          "@saved_clips",
          JSON.stringify(expectedClips)
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
          localStorageService.removeClip("clip-id-1")
        ).rejects.toThrow();
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error removing clip:",
          expect.any(Error)
        );

        consoleSpy.mockRestore();
      });
    });

    describe("updateClip", () => {
      it("指定したIDのクリップが更新されること", async () => {
        // モックデータがAsyncStorageから返されるようにセット
        AsyncStorage.getItem = jest
          .fn()
          .mockResolvedValue(JSON.stringify(mockClips));

        // AsyncStorage.setItemを正常に動作するようにモック
        AsyncStorage.setItem = jest.fn().mockResolvedValue(undefined);

        // 更新するクリップデータ
        const updatedClip: Clip = {
          ...mockClip,
          text: "更新されたテキスト",
          page: 99,
        };

        await localStorageService.updateClip(updatedClip);

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

        await expect(
          localStorageService.updateClip(mockClip)
        ).rejects.toThrow();
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

        // AsyncStorage.setItemを正常に動作するようにモック
        AsyncStorage.setItem = jest.fn().mockResolvedValue(undefined);

        const bookIdToRemove = "test-id-1";
        await localStorageService.deleteClipsByBookId(bookIdToRemove);

        // 削除後のクリップリストを確認（test-id-1以外のクリップのみが残る）
        const expectedClips = mockClips.filter(
          (clip) => clip.bookId !== bookIdToRemove
        );
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          "@saved_clips",
          JSON.stringify(expectedClips)
        );
        // test-id-1のクリップが2つあるので、1つのクリップだけが残ることを確認
        expect(expectedClips.length).toBe(1);
        expect(expectedClips[0].bookId).toBe("test-id-2");
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
          localStorageService.deleteClipsByBookId("test-id-1")
        ).rejects.toThrow();
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error deleting clips by book ID:",
          expect.any(Error)
        );

        consoleSpy.mockRestore();
      });
    });
  });

  // ストレージ管理のテスト
  describe("ストレージ管理", () => {
    describe("clearAllData", () => {
      it("すべてのデータが正常にクリアされること", async () => {
        await localStorageService.clearAllData();

        // multiRemoveが正しいキーで呼ばれたことを確認
        expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
          "@saved_books",
          "@saved_clips",
          "@last_clip_book",
        ]);
      });

      it("クリア中にエラーが発生した場合、エラーがスローされること", async () => {
        // AsyncStorage.multiRemoveがエラーをスローするようにモック
        const errorMessage = "クリア中にエラーが発生しました";
        AsyncStorage.multiRemove = jest
          .fn()
          .mockRejectedValue(new Error(errorMessage));

        // コンソールエラーをモック
        const consoleSpy = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});

        await expect(localStorageService.clearAllData()).rejects.toThrow();
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error clearing all data:",
          expect.any(Error)
        );

        consoleSpy.mockRestore();
      });
    });
  });
});
