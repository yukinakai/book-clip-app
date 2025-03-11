import AsyncStorage from "@react-native-async-storage/async-storage";
import { Book } from "../constants/MockData";

const STORAGE_KEY = "@saved_books";

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
}
