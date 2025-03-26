import AsyncStorage from "@react-native-async-storage/async-storage";
import { Book } from "../constants/MockData";

// ストレージキー - 最後に選択された書籍のみ
const LAST_CLIP_BOOK_KEY = "@last_clip_book";

/**
 * AsyncStorageを使用したローカルストレージの実装
 * 匿名認証を使用する場合は、最後に選択された書籍の情報のみを扱います
 */
export class LocalStorageService {
  constructor() {
    console.log("LocalStorageService initialized (最後のクリップ書籍のみ対応)");
  }

  // 最後に選択された書籍を保存
  async setLastClipBook(book: Book): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_CLIP_BOOK_KEY, JSON.stringify(book));
    } catch (error) {
      console.error("Error saving last clip book:", error);
    }
  }

  // 最後に選択された書籍を取得
  async getLastClipBook(): Promise<Book | null> {
    try {
      const bookJson = await AsyncStorage.getItem(LAST_CLIP_BOOK_KEY);
      return bookJson ? JSON.parse(bookJson) : null;
    } catch (error) {
      console.error("Error getting last clip book:", error);
      return null;
    }
  }

  // ローカルストレージのデータをクリア
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LAST_CLIP_BOOK_KEY);
      console.log("Last clip book data cleared");
    } catch (error) {
      console.error("Error clearing data:", error);
      throw error;
    }
  }
}
