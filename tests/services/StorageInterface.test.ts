import {
  StorageInterface,
  StorageService,
} from "../../services/StorageInterface";
import { Book, Clip } from "../../constants/MockData";

// StorageInterfaceを実装したモッククラスを作成
class MockStorageService implements StorageInterface {
  books: Book[] = [];
  clips: Clip[] = [];
  lastClipBook: Book | null = null;
  mockClearAllData = jest.fn();

  async saveBook(book: Book): Promise<void> {
    if (!this.books.some((b) => b.id === book.id)) {
      this.books.push(book);
    }
  }

  async getAllBooks(): Promise<Book[]> {
    return this.books;
  }

  async getBookById(bookId: string): Promise<Book | null> {
    return this.books.find((book) => book.id === bookId) || null;
  }

  async updateBook(book: Book): Promise<void> {
    const index = this.books.findIndex((b) => b.id === book.id);
    if (index === -1) {
      throw new Error("指定されたIDの書籍が見つかりません");
    }
    this.books[index] = book;
  }

  async removeBook(bookId: string): Promise<void> {
    this.books = this.books.filter((book) => book.id !== bookId);
  }

  async setLastClipBook(book: Book): Promise<void> {
    this.lastClipBook = book;
  }

  async getLastClipBook(): Promise<Book | null> {
    return this.lastClipBook;
  }

  async saveClip(clip: Clip): Promise<void> {
    this.clips.push({
      ...clip,
      id: clip.id || new Date().getTime().toString(),
      createdAt: clip.createdAt || new Date().toISOString(),
    });
  }

  async getAllClips(): Promise<Clip[]> {
    return this.clips;
  }

  async getClipsByBookId(bookId: string): Promise<Clip[]> {
    return this.clips.filter((clip) => clip.bookId === bookId);
  }

  async getClipById(clipId: string): Promise<Clip | null> {
    return this.clips.find((clip) => clip.id === clipId) || null;
  }

  async removeClip(clipId: string): Promise<void> {
    this.clips = this.clips.filter((clip) => clip.id !== clipId);
  }

  async updateClip(updatedClip: Clip): Promise<void> {
    const index = this.clips.findIndex((clip) => clip.id === updatedClip.id);
    if (index === -1) {
      throw new Error("指定されたIDのクリップが見つかりません");
    }
    this.clips[index] = updatedClip;
  }

  async deleteClipsByBookId(bookId: string): Promise<void> {
    this.clips = this.clips.filter((clip) => clip.bookId !== bookId);
  }

  async clearAllData(): Promise<void> {
    this.books = [];
    this.clips = [];
    this.lastClipBook = null;
    this.mockClearAllData();
  }
}

// テスト用のStorageService実装
class TestStorageService extends StorageService {}

describe("StorageInterface", () => {
  // テスト用データ
  const mockBook: Book = {
    id: "test-book-id",
    title: "テスト書籍",
    author: "テスト著者",
    coverImage: "https://example.com/cover.jpg",
  };

  const mockClip: Clip = {
    id: "test-clip-id",
    bookId: "test-book-id",
    text: "テストクリップです",
    page: 42,
    createdAt: "2023-06-15T10:30:00Z",
  };

  let mockStorage: MockStorageService;

  beforeEach(() => {
    mockStorage = new MockStorageService();
    // モックストレージをStorageServiceに設定
    TestStorageService.setStorageBackend(mockStorage);
  });

  describe("StorageService", () => {
    it("初期状態ではローカルストレージモードであること", () => {
      expect(TestStorageService.isAuthenticated).toBeFalsy();
    });

    it("Supabaseモードに切り替えられること", () => {
      TestStorageService.switchToSupabase();
      expect(TestStorageService.isAuthenticated).toBeTruthy();
    });

    it("ローカルモードに切り替えられること", () => {
      // 先にSupabaseモードに切り替える
      TestStorageService.switchToSupabase();
      expect(TestStorageService.isAuthenticated).toBeTruthy();

      // ローカルモードに戻す
      TestStorageService.switchToLocal();
      expect(TestStorageService.isAuthenticated).toBeFalsy();
    });

    it("ローカルモードの場合にclearLocalDataが機能すること", async () => {
      TestStorageService.switchToLocal();
      await TestStorageService.clearLocalData();
      expect(mockStorage.mockClearAllData).toHaveBeenCalled();
    });

    it("Supabaseモードの場合にclearLocalDataが呼ばれないこと", async () => {
      TestStorageService.switchToSupabase();
      await TestStorageService.clearLocalData();
      expect(mockStorage.mockClearAllData).not.toHaveBeenCalled();
    });

    it("ストレージバックエンドが正しく設定されること", () => {
      const newMockStorage = new MockStorageService();
      TestStorageService.setStorageBackend(newMockStorage);

      // プライベートフィールドなのでテストが難しいため、機能的なテストで代用
      TestStorageService.switchToLocal();
      TestStorageService.clearLocalData();
      expect(newMockStorage.mockClearAllData).toHaveBeenCalled();
    });
  });

  describe("MockStorageService (StorageInterface実装)", () => {
    describe("書籍関連の操作", () => {
      it("書籍が保存されること", async () => {
        await mockStorage.saveBook(mockBook);
        const books = await mockStorage.getAllBooks();
        expect(books).toContainEqual(mockBook);
      });

      it("同じIDの書籍は重複して保存されないこと", async () => {
        await mockStorage.saveBook(mockBook);
        await mockStorage.saveBook(mockBook); // 同じIDで2回保存
        const books = await mockStorage.getAllBooks();
        expect(books.length).toBe(1);
      });

      it("書籍が削除されること", async () => {
        await mockStorage.saveBook(mockBook);
        await mockStorage.removeBook(mockBook.id);
        const books = await mockStorage.getAllBooks();
        expect(books).not.toContainEqual(mockBook);
      });

      it("最後に使用した書籍が設定・取得できること", async () => {
        await mockStorage.setLastClipBook(mockBook);
        const lastBook = await mockStorage.getLastClipBook();
        expect(lastBook).toEqual(mockBook);
      });

      it("書籍がIDで取得できること", async () => {
        await mockStorage.saveBook(mockBook);
        const book = await mockStorage.getBookById(mockBook.id);
        expect(book).toEqual(mockBook);
      });

      it("存在しない書籍IDの場合、nullを返すこと", async () => {
        const book = await mockStorage.getBookById("non-existent-id");
        expect(book).toBeNull();
      });

      it("書籍が更新できること", async () => {
        await mockStorage.saveBook(mockBook);
        const updatedBook = { ...mockBook, title: "更新された書籍" };
        await mockStorage.updateBook(updatedBook);
        const book = await mockStorage.getBookById(mockBook.id);
        expect(book).toEqual(updatedBook);
      });

      it("存在しない書籍の更新時にエラーがスローされること", async () => {
        const nonExistentBook = { ...mockBook, id: "non-existent-id" };
        await expect(mockStorage.updateBook(nonExistentBook)).rejects.toThrow(
          "指定されたIDの書籍が見つかりません"
        );
      });
    });

    describe("クリップ関連の操作", () => {
      it("クリップが保存されること", async () => {
        await mockStorage.saveClip(mockClip);
        const clips = await mockStorage.getAllClips();
        expect(clips).toContainEqual(mockClip);
      });

      it("IDのないクリップが保存されるとき、IDが自動生成されること", async () => {
        // 日付固定のためにDateをモック
        const mockTimestamp = 1624186800000; // 2021-06-20T12:00:00Z
        const mockDateString = "2021-06-20T12:00:00Z";

        // mock Date.getTime() and toISOString()
        const mockDateInstance = {
          getTime: jest.fn().mockReturnValue(mockTimestamp),
          toISOString: jest.fn().mockReturnValue(mockDateString),
        };
        jest
          .spyOn(global, "Date")
          .mockImplementation(() => mockDateInstance as unknown as Date);

        const clipWithoutId = {
          bookId: "test-book-id",
          text: "IDなしクリップ",
          page: 123,
        };

        await mockStorage.saveClip(clipWithoutId as Clip);
        const clips = await mockStorage.getAllClips();

        expect(clips.length).toBe(1);
        expect(clips[0].id).toBe(mockTimestamp.toString());
        expect(clips[0].createdAt).toBe(mockDateString);

        // モックをリストア
        (global.Date as jest.Mock).mockRestore();
      });

      it("書籍IDでクリップがフィルタリングされること", async () => {
        const clip1 = { ...mockClip, id: "clip1" };
        const clip2 = { ...mockClip, id: "clip2" };
        const clip3 = { ...mockClip, id: "clip3", bookId: "another-book-id" };

        await mockStorage.saveClip(clip1);
        await mockStorage.saveClip(clip2);
        await mockStorage.saveClip(clip3);

        const filteredClips = await mockStorage.getClipsByBookId(
          "test-book-id"
        );
        expect(filteredClips.length).toBe(2);
        expect(filteredClips).toContainEqual(clip1);
        expect(filteredClips).toContainEqual(clip2);
      });

      it("クリップが削除されること", async () => {
        await mockStorage.saveClip(mockClip);
        await mockStorage.removeClip(mockClip.id);
        const clips = await mockStorage.getAllClips();
        expect(clips).not.toContainEqual(mockClip);
      });

      it("クリップが更新されること", async () => {
        await mockStorage.saveClip(mockClip);
        const updatedClip = { ...mockClip, text: "更新されたテキスト" };
        await mockStorage.updateClip(updatedClip);

        const clips = await mockStorage.getAllClips();
        expect(clips).toContainEqual(updatedClip);
        expect(clips).not.toContainEqual(mockClip);
      });

      it("書籍IDに関連するすべてのクリップが削除されること", async () => {
        const clip1 = { ...mockClip, id: "clip1" };
        const clip2 = { ...mockClip, id: "clip2" };
        const clip3 = { ...mockClip, id: "clip3", bookId: "another-book-id" };

        await mockStorage.saveClip(clip1);
        await mockStorage.saveClip(clip2);
        await mockStorage.saveClip(clip3);

        await mockStorage.deleteClipsByBookId("test-book-id");

        const clips = await mockStorage.getAllClips();
        expect(clips.length).toBe(1);
        expect(clips).toContainEqual(clip3);
      });

      it("クリップがIDで取得できること", async () => {
        await mockStorage.saveClip(mockClip);
        const clip = await mockStorage.getClipById(mockClip.id);
        expect(clip).toEqual(mockClip);
      });

      it("存在しないクリップIDの場合、nullを返すこと", async () => {
        const clip = await mockStorage.getClipById("non-existent-id");
        expect(clip).toBeNull();
      });

      it("存在しないクリップの更新時にエラーがスローされること", async () => {
        const nonExistentClip = { ...mockClip, id: "non-existent-id" };
        await expect(mockStorage.updateClip(nonExistentClip)).rejects.toThrow(
          "指定されたIDのクリップが見つかりません"
        );
      });
    });

    describe("ストレージ管理", () => {
      it("すべてのデータがクリアされること", async () => {
        await mockStorage.saveBook(mockBook);
        await mockStorage.saveClip(mockClip);
        await mockStorage.setLastClipBook(mockBook);

        await mockStorage.clearAllData();

        const books = await mockStorage.getAllBooks();
        const clips = await mockStorage.getAllClips();
        const lastBook = await mockStorage.getLastClipBook();

        expect(books).toEqual([]);
        expect(clips).toEqual([]);
        expect(lastBook).toBeNull();
        expect(mockStorage.mockClearAllData).toHaveBeenCalled();
      });
    });
  });
});
