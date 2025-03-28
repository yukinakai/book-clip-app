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
    isbn: "9784000000000",
  };

  const mockBooks: Book[] = [
    mockBook,
    {
      id: "test-id-2",
      title: "テスト書籍2",
      author: "テスト著者2",
      coverImage: "https://example.com/cover2.jpg",
      isbn: "9784000000001",
    },
    {
      id: "test-id-3",
      title: "テスト書籍3",
      author: "テスト著者3",
      coverImage: null,
      isbn: "9784000000002",
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

        await localStorageService.saveBook(mockBook);

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
        expect(AsyncStorage.getItem).toHaveBeenCalledWith("@books");
      });

      it("保存されている書籍がない場合、空の配列を返すこと", async () => {
        AsyncStorage.getItem = jest.fn().mockResolvedValue(null);

        const books = await localStorageService.getAllBooks();

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

    describe("getBookById", () => {
      it("指定したIDの書籍を正常に取得できること", async () => {
        // モックデータがAsyncStorageから返されるようにセット
        AsyncStorage.getItem = jest
          .fn()
          .mockResolvedValue(JSON.stringify(mockBooks));

        // コンソールログをモック
        const consoleSpy = jest
          .spyOn(console, "log")
          .mockImplementation(() => {});

        const bookId = "test-id-1";
        const book = await localStorageService.getBookById(bookId);

        // 正しい書籍が返されることを確認
        expect(book).toEqual(mockBooks.find((b) => b.id === bookId));
        expect(AsyncStorage.getItem).toHaveBeenCalledWith("@books");

        consoleSpy.mockRestore();
      });

      it("存在しないIDの場合、nullを返すこと", async () => {
        // モックデータがAsyncStorageから返されるようにセット
        AsyncStorage.getItem = jest
          .fn()
          .mockResolvedValue(JSON.stringify(mockBooks));

        // コンソールログをモック
        const consoleSpy = jest
          .spyOn(console, "log")
          .mockImplementation(() => {});

        const nonExistingBookId = "non-existing-id";
        const book = await localStorageService.getBookById(nonExistingBookId);

        // nullが返されることを確認
        expect(book).toBeNull();
        expect(AsyncStorage.getItem).toHaveBeenCalledWith("@books");

        consoleSpy.mockRestore();
      });

      it("保存されている書籍がない場合、nullを返すこと", async () => {
        // AsyncStorage.getItemがnullを返すようにモック
        AsyncStorage.getItem = jest.fn().mockResolvedValue(null);

        // コンソールログをモック
        const consoleSpy = jest
          .spyOn(console, "log")
          .mockImplementation(() => {});

        const bookId = "test-id-1";
        const book = await localStorageService.getBookById(bookId);

        // nullが返されることを確認
        expect(book).toBeNull();
        expect(AsyncStorage.getItem).toHaveBeenCalledWith("@books");

        consoleSpy.mockRestore();
      });

      it("取得中にエラーが発生した場合、nullを返し、エラーをログ出力すること", async () => {
        // AsyncStorage.getItemがエラーをスローするようにモック
        const errorMessage = "取得中にエラーが発生しました";
        AsyncStorage.getItem = jest
          .fn()
          .mockRejectedValue(new Error(errorMessage));

        // コンソールログとエラーをモック
        const consoleLogSpy = jest
          .spyOn(console, "log")
          .mockImplementation(() => {});
        const consoleErrorSpy = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});

        const bookId = "test-id-1";
        const book = await localStorageService.getBookById(bookId);

        // nullが返され、エラーログが出力されることを確認
        expect(book).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error getting book by ID from local storage:",
          expect.any(Error)
        );

        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
      });
    });

    describe("updateBook", () => {
      it("指定したIDの書籍が正常に更新されること", async () => {
        // モックデータがAsyncStorageから返されるようにセット
        AsyncStorage.getItem = jest
          .fn()
          .mockResolvedValue(JSON.stringify(mockBooks));

        // コンソールログをモック
        const consoleSpy = jest
          .spyOn(console, "log")
          .mockImplementation(() => {});

        // 更新する書籍データ
        const updatedBook: Book = {
          ...mockBook,
          title: "更新されたタイトル",
          author: "更新された著者",
        };

        await localStorageService.updateBook(updatedBook);

        // 更新後の書籍リストを確認
        const expectedBooks = mockBooks.map((book) =>
          book.id === updatedBook.id ? updatedBook : book
        );

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          "@books",
          JSON.stringify(expectedBooks)
        );

        consoleSpy.mockRestore();
      });

      it("指定したIDの書籍が存在しない場合、エラーがスローされること", async () => {
        // モックデータがAsyncStorageから返されるようにセット（対象のIDの書籍は含まれていない）
        const booksWithoutTarget = mockBooks.filter(
          (book) => book.id !== mockBook.id
        );
        AsyncStorage.getItem = jest
          .fn()
          .mockResolvedValue(JSON.stringify(booksWithoutTarget));

        // コンソールログとエラーをモック
        const consoleLogSpy = jest
          .spyOn(console, "log")
          .mockImplementation(() => {});
        const consoleErrorSpy = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});

        // 更新する書籍のIDが存在しないケース
        await expect(localStorageService.updateBook(mockBook)).rejects.toThrow(
          "指定されたIDの書籍が見つかりません"
        );

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error updating book in local storage:",
          expect.any(Error)
        );

        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
      });

      it("書籍データが存在しない場合、エラーがスローされること", async () => {
        // AsyncStorage.getItemがnullを返すようにモック
        AsyncStorage.getItem = jest.fn().mockResolvedValue(null);

        // コンソールログとエラーをモック
        const consoleLogSpy = jest
          .spyOn(console, "log")
          .mockImplementation(() => {});
        const consoleErrorSpy = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});

        await expect(localStorageService.updateBook(mockBook)).rejects.toThrow(
          "書籍データが見つかりません"
        );

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error updating book in local storage:",
          expect.any(Error)
        );

        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
      });

      it("書籍IDが未指定の場合、エラーがスローされること", async () => {
        // コンソールエラーをモック
        const consoleErrorSpy = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});

        // IDがない書籍
        const bookWithoutId = { ...mockBook, id: undefined };

        await expect(
          localStorageService.updateBook(bookWithoutId as any)
        ).rejects.toThrow("書籍IDが指定されていません");

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error updating book in local storage:",
          expect.any(Error)
        );

        consoleErrorSpy.mockRestore();
      });

      it("更新中にエラーが発生した場合、エラーがスローされること", async () => {
        // AsyncStorage.getItemがエラーをスローするようにモック
        const errorMessage = "更新中にエラーが発生しました";
        AsyncStorage.getItem = jest
          .fn()
          .mockRejectedValue(new Error(errorMessage));

        // コンソールログとエラーをモック
        const consoleLogSpy = jest
          .spyOn(console, "log")
          .mockImplementation(() => {});
        const consoleErrorSpy = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});

        await expect(
          localStorageService.updateBook(mockBook)
        ).rejects.toThrow();

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error updating book in local storage:",
          expect.any(Error)
        );

        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
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

        await localStorageService.saveClip(mockClip);

        // 新しいクリップが保存されることを確認
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          "@clips",
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

        // AsyncStorage.setItemを正常に動作するようにモック
        AsyncStorage.setItem = jest.fn().mockResolvedValue(undefined);

        await localStorageService.saveClip(mockClip);

        // 既存のクリップと新しいクリップが結合されたことを確認
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          "@clips",
          JSON.stringify([...existingClips, mockClip])
        );
      });

      it("保存中にエラーが発生した場合、エラーがスローされること", async () => {
        // AsyncStorage.getItemがエラーをスローするようにモック
        const errorMessage = "保存中にエラーが発生しました";
        AsyncStorage.getItem = jest
          .fn()
          .mockRejectedValue(new Error(errorMessage));

        // AsyncStorage.setItemもエラーをスローするようにモック
        AsyncStorage.setItem = jest
          .fn()
          .mockRejectedValue(new Error(errorMessage));

        // コンソールエラーをモック
        const consoleSpy = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});

        await expect(localStorageService.saveClip(mockClip)).rejects.toThrow();
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error saving clip to local storage:",
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
        expect(AsyncStorage.getItem).toHaveBeenCalledWith("@clips");
      });

      it("保存されているクリップがない場合、空の配列を返すこと", async () => {
        AsyncStorage.getItem = jest.fn().mockResolvedValue(null);

        const clips = await localStorageService.getAllClips();

        expect(clips).toEqual([]);
        expect(AsyncStorage.getItem).toHaveBeenCalledWith("@clips");
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
        expect(AsyncStorage.getItem).toHaveBeenCalledWith("@clips");
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
        expect(AsyncStorage.getItem).toHaveBeenCalledWith("@clips");
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
          "@clips",
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
          "@clips",
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
          "@clips",
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

    describe("getClipById", () => {
      it("指定したIDのクリップを正常に取得できること", async () => {
        // モックデータがAsyncStorageから返されるようにセット
        AsyncStorage.getItem = jest
          .fn()
          .mockResolvedValue(JSON.stringify(mockClips));

        // コンソールログをモック
        const consoleSpy = jest
          .spyOn(console, "log")
          .mockImplementation(() => {});

        const clipId = "clip-id-1";
        const clip = await localStorageService.getClipById(clipId);

        // 正しいクリップが返されることを確認
        expect(clip).toEqual(mockClips.find((c) => c.id === clipId));
        expect(AsyncStorage.getItem).toHaveBeenCalledWith("@clips");

        consoleSpy.mockRestore();
      });

      it("存在しないIDの場合、nullを返すこと", async () => {
        // モックデータがAsyncStorageから返されるようにセット
        AsyncStorage.getItem = jest
          .fn()
          .mockResolvedValue(JSON.stringify(mockClips));

        // コンソールログをモック
        const consoleSpy = jest
          .spyOn(console, "log")
          .mockImplementation(() => {});

        const nonExistingClipId = "non-existing-id";
        const clip = await localStorageService.getClipById(nonExistingClipId);

        // nullが返されることを確認
        expect(clip).toBeNull();
        expect(AsyncStorage.getItem).toHaveBeenCalledWith("@clips");

        consoleSpy.mockRestore();
      });

      it("保存されているクリップがない場合、nullを返すこと", async () => {
        // AsyncStorage.getItemがnullを返すようにモック
        AsyncStorage.getItem = jest.fn().mockResolvedValue(null);

        // コンソールログをモック
        const consoleSpy = jest
          .spyOn(console, "log")
          .mockImplementation(() => {});

        const clipId = "clip-id-1";
        const clip = await localStorageService.getClipById(clipId);

        // nullが返されることを確認
        expect(clip).toBeNull();
        expect(AsyncStorage.getItem).toHaveBeenCalledWith("@clips");

        consoleSpy.mockRestore();
      });

      it("取得中にエラーが発生した場合、nullを返し、エラーをログ出力すること", async () => {
        // AsyncStorage.getItemがエラーをスローするようにモック
        const errorMessage = "取得中にエラーが発生しました";
        AsyncStorage.getItem = jest
          .fn()
          .mockRejectedValue(new Error(errorMessage));

        // コンソールログとエラーをモック
        const consoleLogSpy = jest
          .spyOn(console, "log")
          .mockImplementation(() => {});
        const consoleErrorSpy = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});

        const clipId = "clip-id-1";
        const clip = await localStorageService.getClipById(clipId);

        // nullが返され、エラーログが出力されることを確認
        expect(clip).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error getting clip by ID from local storage:",
          expect.any(Error)
        );

        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
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
          "@books",
          "@clips",
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

    describe("setLastClipBook", () => {
      it("最後に使用した書籍が正常に保存されること", async () => {
        await localStorageService.setLastClipBook(mockBook);

        // 正しく書籍が保存されることを確認
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
          "Error setting last clip book:",
          expect.any(Error)
        );

        consoleSpy.mockRestore();
      });
    });

    describe("getLastClipBook", () => {
      it("最後に使用した書籍を正常に取得できること", async () => {
        // AsyncStorage.getItemが書籍データを返すようにモック
        AsyncStorage.getItem = jest
          .fn()
          .mockResolvedValue(JSON.stringify(mockBook));

        const book = await localStorageService.getLastClipBook();

        // 正しい書籍が返されることを確認
        expect(book).toEqual(mockBook);
        expect(AsyncStorage.getItem).toHaveBeenCalledWith("@last_clip_book");
      });

      it("データがない場合、nullを返すこと", async () => {
        // AsyncStorage.getItemがnullを返すようにモック
        AsyncStorage.getItem = jest.fn().mockResolvedValue(null);

        const book = await localStorageService.getLastClipBook();

        // nullが返されることを確認
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
});
