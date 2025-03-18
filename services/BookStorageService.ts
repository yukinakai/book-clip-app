import AsyncStorage from "@react-native-async-storage/async-storage";
import { Book } from "../constants/MockData";

const STORAGE_KEY = "@saved_books";
const LAST_CLIP_BOOK_KEY = "@last_clip_book";

export class BookStorageService {
  static async saveBook(book: Book): Promise<void> {
    try {
      const existingBooksJson = await AsyncStorage.getItem(STORAGE_KEY);
      const existingBooks: Book[] = existingBooksJson
        ? JSON.parse(existingBooksJson)
        : [];

      // 重複チェック
      if (!existingBooks.some((b) => b.id === book.id)) {
        const updatedBooks = [...existingBooks, book];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBooks));
      }
    } catch (error) {
      console.error("Error saving book:", error);
      throw error;
    }
  }

  static async getAllBooks(): Promise<Book[]> {
    try {
      const booksJson = await AsyncStorage.getItem(STORAGE_KEY);
      return booksJson ? JSON.parse(booksJson) : [];
    } catch (error) {
      console.error("Error getting books:", error);
      return [];
    }
  }

  static async removeBook(bookId: string): Promise<void> {
    try {
      const existingBooksJson = await AsyncStorage.getItem(STORAGE_KEY);
      const existingBooks: Book[] = existingBooksJson
        ? JSON.parse(existingBooksJson)
        : [];
      const updatedBooks = existingBooks.filter((book) => book.id !== bookId);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBooks));
    } catch (error) {
      console.error("Error removing book:", error);
      throw error;
    }
  }

  // エイリアスとしてdeleteBookを提供 (互換性のため)
  static async deleteBook(bookId: string): Promise<void> {
    return this.removeBook(bookId);
  }

  static async setLastClipBook(book: Book): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_CLIP_BOOK_KEY, JSON.stringify(book));
    } catch (error) {
      console.error("Error saving last clip book:", error);
      throw error;
    }
  }

  static async getLastClipBook(): Promise<Book | null> {
    try {
      const bookJson = await AsyncStorage.getItem(LAST_CLIP_BOOK_KEY);
      return bookJson ? JSON.parse(bookJson) : null;
    } catch (error) {
      console.error("Error getting last clip book:", error);
      return null;
    }
  }
}
