import AsyncStorage from "@react-native-async-storage/async-storage";
import { Book, Clip } from "../constants/MockData";
import { StorageInterface } from "./StorageInterface";

// ストレージキー
const BOOKS_STORAGE_KEY = "@saved_books";
const CLIPS_STORAGE_KEY = "@saved_clips";
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

  async setLastClipBook(book: Book): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_CLIP_BOOK_KEY, JSON.stringify(book));
    } catch (error) {
      console.error("Error saving last clip book:", error);
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

  // クリップ関連の実装
  async saveClip(clip: Clip): Promise<void> {
    try {
      const existingClipsJson = await AsyncStorage.getItem(CLIPS_STORAGE_KEY);
      const existingClips: Clip[] = existingClipsJson
        ? JSON.parse(existingClipsJson)
        : [];

      // 新しいクリップにIDを割り当て
      const newClip = {
        ...clip,
        id: clip.id || new Date().getTime().toString(),
        createdAt: clip.createdAt || new Date().toISOString(),
      };

      const updatedClips = [...existingClips, newClip];
      await AsyncStorage.setItem(
        CLIPS_STORAGE_KEY,
        JSON.stringify(updatedClips)
      );
    } catch (error) {
      console.error("Error saving clip:", error);
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

  async getClipsByBookId(bookId: string): Promise<Clip[]> {
    try {
      const allClips = await this.getAllClips();
      return allClips.filter((clip) => clip.bookId === bookId);
    } catch (error) {
      console.error("Error getting clips by book ID:", error);
      return [];
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
      await AsyncStorage.multiRemove([
        BOOKS_STORAGE_KEY,
        CLIPS_STORAGE_KEY,
        LAST_CLIP_BOOK_KEY,
      ]);
    } catch (error) {
      console.error("Error clearing all data:", error);
      throw error;
    }
  }
}
