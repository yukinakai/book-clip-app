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
   * 書籍IDで単一の書籍を取得
   * この方法はストレージバックエンドがサポートしている場合は効率的に動作
   */
  static async getBookById(bookId: string): Promise<Book | null> {
    // StorageInterfaceが対応していればそのメソッドを使用
    if ("getBookById" in this.storageBackend) {
      return (this.storageBackend as any).getBookById(bookId);
    }

    // 対応していない場合は全書籍から検索
    const books = await this.getAllBooks();
    return books.find((book) => book.id === bookId) || null;
  }

  /**
   * 書籍を更新
   * この方法はストレージバックエンドがupdateBookメソッドをサポートしている場合は直接そのメソッドを使用
   * サポートしていない場合は、削除して再保存する処理を内部で行う
   */
  static async updateBook(book: Book): Promise<void> {
    // StorageInterfaceがupdateBookに対応していればそのメソッドを使用
    if ("updateBook" in this.storageBackend) {
      return (this.storageBackend as any).updateBook(book);
    }

    // 対応していない場合は削除して再保存する
    if (!book.id) {
      throw new Error("書籍IDが指定されていません");
    }

    await this.removeBook(book.id);
    return this.saveBook(book);
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
