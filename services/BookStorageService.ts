import { Book } from "../constants/MockData";
import { StorageService } from "./StorageInterface";
import { LocalStorageService } from "./LocalStorageService";

/**
 * 書籍ストレージサービス
 * データの保存先を自動的に切り替える
 */
export class BookStorageService extends StorageService {
  // 初期設定としてLocalStorageを使用
  protected static storageBackend = new LocalStorageService();

  /**
   * 書籍を保存
   */
  static async saveBook(book: Book): Promise<void> {
    return this.storageBackend.saveBook(book);
  }

  /**
   * すべての書籍を取得
   */
  static async getAllBooks(): Promise<Book[]> {
    return this.storageBackend.getAllBooks();
  }

  /**
   * 書籍を削除
   */
  static async removeBook(bookId: string): Promise<void> {
    return this.storageBackend.removeBook(bookId);
  }

  /**
   * 書籍を削除（エイリアス）
   */
  static async deleteBook(bookId: string): Promise<void> {
    return this.removeBook(bookId);
  }

  /**
   * 最後にクリップした書籍を設定
   */
  static async setLastClipBook(book: Book): Promise<void> {
    return this.storageBackend.setLastClipBook(book);
  }

  /**
   * 最後にクリップした書籍を取得
   */
  static async getLastClipBook(): Promise<Book | null> {
    return this.storageBackend.getLastClipBook();
  }
}
