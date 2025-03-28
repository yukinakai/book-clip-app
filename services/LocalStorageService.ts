import AsyncStorage from "@react-native-async-storage/async-storage";
import { Book, Clip } from "../constants/MockData";
import { StorageInterface } from "./StorageInterface";

// ストレージキー
const BOOKS_STORAGE_KEY = "@books";
const CLIPS_STORAGE_KEY = "@clips";
const LAST_CLIP_BOOK_KEY = "@last_clip_book";

/**
 * AsyncStorageを使用したローカルストレージの実装
 */
export class LocalStorageService implements StorageInterface {
  // 書籍関連の実装
  async saveBook(book: Book): Promise<void> {
    try {
      const existingBooksJson = await AsyncStorage.getItem(BOOKS_STORAGE_KEY);
      const existingBooks: Book[] = existingBooksJson
        ? JSON.parse(existingBooksJson)
        : [];

      // 重複チェック
      if (!existingBooks.some((b) => b.id === book.id)) {
        const updatedBooks = [...existingBooks, book];
        await AsyncStorage.setItem(
          BOOKS_STORAGE_KEY,
          JSON.stringify(updatedBooks)
        );
      }
    } catch (error) {
      console.error("Error saving book:", error);
      throw error;
    }
  }

  async getAllBooks(): Promise<Book[]> {
    try {
      const booksJson = await AsyncStorage.getItem(BOOKS_STORAGE_KEY);
      return booksJson ? JSON.parse(booksJson) : [];
    } catch (error) {
      console.error("Error getting books:", error);
      return [];
    }
  }

  /**
   * 書籍IDで単一の書籍を取得
   */
  async getBookById(bookId: string): Promise<Book | null> {
    try {
      console.log("ローカルストレージから書籍を単一取得 - ID:", bookId);
      const startTime = Date.now();

      // ローカルストレージからすべての書籍を取得
      const booksData = await AsyncStorage.getItem(BOOKS_STORAGE_KEY);
      if (!booksData) return null;

      // JSONデータを解析
      const books: Book[] = JSON.parse(booksData);

      // 指定されたIDの書籍を検索
      const book = books.find((b) => b.id === bookId);

      const endTime = Date.now();
      console.log(`書籍取得完了 (${endTime - startTime}ms)`);

      return book || null;
    } catch (error) {
      console.error("Error getting book by ID from local storage:", error);
      return null;
    }
  }

  /**
   * 書籍データを更新する
   * ローカルストレージでは全データを取得して対象の書籍を更新し、再保存する
   */
  async updateBook(book: Book): Promise<void> {
    try {
      if (!book.id) throw new Error("書籍IDが指定されていません");

      console.log("ローカルストレージで書籍を更新 - ID:", book.id);
      const startTime = Date.now();

      // すべての書籍を取得
      const booksData = await AsyncStorage.getItem(BOOKS_STORAGE_KEY);
      if (!booksData) throw new Error("書籍データが見つかりません");

      // JSONからパース
      const books: Book[] = JSON.parse(booksData);

      // 更新対象の書籍のインデックスを検索
      const bookIndex = books.findIndex((b) => b.id === book.id);
      if (bookIndex === -1)
        throw new Error("指定されたIDの書籍が見つかりません");

      // 書籍を更新
      books[bookIndex] = book;

      // 更新されたデータを保存
      await AsyncStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));

      const endTime = Date.now();
      console.log(`書籍更新完了 (${endTime - startTime}ms)`);
    } catch (error) {
      console.error("Error updating book in local storage:", error);
      throw error;
    }
  }

  async removeBook(bookId: string): Promise<void> {
    try {
      const existingBooksJson = await AsyncStorage.getItem(BOOKS_STORAGE_KEY);
      const existingBooks: Book[] = existingBooksJson
        ? JSON.parse(existingBooksJson)
        : [];
      const updatedBooks = existingBooks.filter((book) => book.id !== bookId);
      await AsyncStorage.setItem(
        BOOKS_STORAGE_KEY,
        JSON.stringify(updatedBooks)
      );
    } catch (error) {
      console.error("Error removing book:", error);
      throw error;
    }
  }

  // クリップ関連の実装
  async saveClip(clip: Clip): Promise<void> {
    try {
      const clips = await this.getAllClips();
      clips.push(clip);
      await AsyncStorage.setItem(CLIPS_STORAGE_KEY, JSON.stringify(clips));
    } catch (error) {
      console.error("Error saving clip to local storage:", error);
      throw error;
    }
  }

  async getAllClips(): Promise<Clip[]> {
    try {
      const clipsJson = await AsyncStorage.getItem(CLIPS_STORAGE_KEY);
      return clipsJson ? JSON.parse(clipsJson) : [];
    } catch (error) {
      console.error("Error getting clips:", error);
      return [];
    }
  }

  /**
   * 書籍IDに基づくクリップを取得
   */
  async getClipsByBookId(bookId: string): Promise<Clip[]> {
    try {
      const allClips = await this.getAllClips();
      return allClips.filter((clip) => clip.bookId === bookId);
    } catch (error) {
      console.error("Error getting clips by book ID:", error);
      return [];
    }
  }

  /**
   * クリップIDで単一のクリップを取得
   */
  async getClipById(clipId: string): Promise<Clip | null> {
    try {
      console.log("ローカルストレージからクリップを単一取得 - ID:", clipId);
      const startTime = Date.now();

      // ローカルストレージからすべてのクリップを取得
      const clipsData = await AsyncStorage.getItem(CLIPS_STORAGE_KEY);
      if (!clipsData) return null;

      // JSONデータを解析
      const clips: Clip[] = JSON.parse(clipsData);

      // 指定されたIDのクリップを検索
      const clip = clips.find((c) => c.id === clipId);

      const endTime = Date.now();
      console.log(`クリップ取得完了 (${endTime - startTime}ms)`);

      return clip || null;
    } catch (error) {
      console.error("Error getting clip by ID from local storage:", error);
      return null;
    }
  }

  async removeClip(clipId: string): Promise<void> {
    try {
      const existingClipsJson = await AsyncStorage.getItem(CLIPS_STORAGE_KEY);
      const existingClips: Clip[] = existingClipsJson
        ? JSON.parse(existingClipsJson)
        : [];
      const updatedClips = existingClips.filter((clip) => clip.id !== clipId);
      await AsyncStorage.setItem(
        CLIPS_STORAGE_KEY,
        JSON.stringify(updatedClips)
      );
    } catch (error) {
      console.error("Error removing clip:", error);
      throw error;
    }
  }

  async updateClip(updatedClip: Clip): Promise<void> {
    try {
      const existingClipsJson = await AsyncStorage.getItem(CLIPS_STORAGE_KEY);
      const existingClips: Clip[] = existingClipsJson
        ? JSON.parse(existingClipsJson)
        : [];

      // 更新対象のクリップを置き換え
      const updatedClips = existingClips.map((clip) =>
        clip.id === updatedClip.id ? updatedClip : clip
      );

      await AsyncStorage.setItem(
        CLIPS_STORAGE_KEY,
        JSON.stringify(updatedClips)
      );
    } catch (error) {
      console.error("Error updating clip:", error);
      throw error;
    }
  }

  async deleteClipsByBookId(bookId: string): Promise<void> {
    try {
      const existingClipsJson = await AsyncStorage.getItem(CLIPS_STORAGE_KEY);
      const existingClips: Clip[] = existingClipsJson
        ? JSON.parse(existingClipsJson)
        : [];

      // 指定された書籍ID以外のクリップを残す
      const updatedClips = existingClips.filter(
        (clip) => clip.bookId !== bookId
      );

      await AsyncStorage.setItem(
        CLIPS_STORAGE_KEY,
        JSON.stringify(updatedClips)
      );
    } catch (error) {
      console.error("Error deleting clips by book ID:", error);
      throw error;
    }
  }

  // ストレージ管理
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([BOOKS_STORAGE_KEY, CLIPS_STORAGE_KEY]);
    } catch (error) {
      console.error("Error clearing all data:", error);
      throw error;
    }
  }

  async setLastClipBook(book: Book): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_CLIP_BOOK_KEY, JSON.stringify(book));
    } catch (error) {
      console.error("Error setting last clip book:", error);
      throw error;
    }
  }

  async getLastClipBook(): Promise<Book | null> {
    try {
      const bookJson = await AsyncStorage.getItem(LAST_CLIP_BOOK_KEY);
      return bookJson ? JSON.parse(bookJson) : null;
    } catch (error) {
      console.error("Error getting last clip book:", error);
      return null;
    }
  }
}
