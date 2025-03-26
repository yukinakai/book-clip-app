import { Book } from "../constants/MockData";
import { LocalStorageService } from "./LocalStorageService";

/**
 * 書籍ストレージサービス
 * Supabaseデータベースと最後のクリップブック情報の管理を担当
 */
export class BookStorageService {
  // LocalStorageServiceは最後のクリップブック情報の管理にのみ使用
  private static localStorageService = new LocalStorageService();

  /**
   * 書籍を保存
   * 匿名認証環境ではSupabaseに直接保存されるため、このメソッドは使用されない
   */
  static async saveBook(book: Book): Promise<void> {
    console.warn("匿名認証環境では書籍の保存はSupabaseに直接行われます");
  }

  /**
   * すべての書籍を取得
   * 匿名認証環境ではSupabaseから直接取得されるため、このメソッドは使用されない
   */
  static async getAllBooks(): Promise<Book[]> {
    console.warn("匿名認証環境では書籍の取得はSupabaseから直接行われます");
    return [];
  }

  /**
   * 書籍IDで単一の書籍を取得
   * 匿名認証環境ではSupabaseから直接取得されるため、このメソッドは使用されない
   */
  static async getBookById(bookId: string): Promise<Book | null> {
    console.warn("匿名認証環境では書籍の取得はSupabaseから直接行われます");
    return null;
  }

  /**
   * 書籍を更新
   * 匿名認証環境ではSupabaseで直接更新されるため、このメソッドは使用されない
   */
  static async updateBook(book: Book): Promise<void> {
    console.warn("匿名認証環境では書籍の更新はSupabaseで直接行われます");
  }

  /**
   * 書籍を削除
   * 匿名認証環境ではSupabaseで直接削除されるため、このメソッドは使用されない
   */
  static async removeBook(bookId: string): Promise<void> {
    console.warn("匿名認証環境では書籍の削除はSupabaseで直接行われます");
  }

  /**
   * 書籍を削除（エイリアス）
   * 匿名認証環境ではSupabaseで直接削除されるため、このメソッドは使用されない
   */
  static async deleteBook(bookId: string): Promise<void> {
    console.warn("匿名認証環境では書籍の削除はSupabaseで直接行われます");
  }

  /**
   * 最後にクリップした書籍を設定
   * LocalStorageServiceを使用して保存
   */
  static async setLastClipBook(book: Book): Promise<void> {
    return this.localStorageService.setLastClipBook(book);
  }

  /**
   * 最後にクリップした書籍を取得
   * LocalStorageServiceから取得
   */
  static async getLastClipBook(): Promise<Book | null> {
    return this.localStorageService.getLastClipBook();
  }
}
