import { Book } from "../constants/MockData";
import { LocalStorageService } from "./LocalStorageService";
import { SupabaseStorageService } from "./SupabaseStorageService";
import { AuthService } from "./auth";

/**
 * 書籍ストレージサービス
 * Supabaseデータベースと最後のクリップブック情報の管理を担当
 */
export class BookStorageService {
  // LocalStorageServiceは最後のクリップブック情報の管理にのみ使用
  private static localStorageService = new LocalStorageService();
  private static supabaseService: SupabaseStorageService | null = null;

  /**
   * SupabaseServiceのインスタンスを取得または作成
   * @returns SupabaseStorageServiceのインスタンス
   */
  private static async getSupabaseService(): Promise<SupabaseStorageService> {
    try {
      // 既存のインスタンスがあればそれを返す
      if (this.supabaseService) {
        return this.supabaseService;
      }

      // 現在のユーザーIDを取得
      const user = await AuthService.getCurrentUser();
      if (!user || !user.id) {
        console.warn("匿名認証環境では書籍の取得はSupabaseから直接行われます");
        this.supabaseService = new SupabaseStorageService("anonymous");
        return this.supabaseService;
      }

      // 新しいインスタンスを作成
      this.supabaseService = new SupabaseStorageService(user.id);
      return this.supabaseService;
    } catch (error) {
      console.error("Supabaseサービス初期化エラー:", error);
      throw error;
    }
  }

  /**
   * 書籍を保存
   */
  static async saveBook(book: Book): Promise<void> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user || !user.id) {
        console.warn("匿名認証環境では書籍の保存はSupabaseに直接行われます");
        return;
      }
      const service = await this.getSupabaseService();
      await service.saveBook(book);
    } catch (error) {
      console.error("書籍保存エラー:", error);
      throw error;
    }
  }

  /**
   * すべての書籍を取得
   */
  static async getAllBooks(): Promise<Book[]> {
    try {
      const service = await this.getSupabaseService();
      return await service.getAllBooks();
    } catch (error) {
      console.error("書籍一覧取得エラー:", error);
      return [];
    }
  }

  /**
   * 書籍IDで単一の書籍を取得
   */
  static async getBookById(bookId: string): Promise<Book | null> {
    try {
      const service = await this.getSupabaseService();
      return await service.getBookById(bookId);
    } catch (error) {
      console.error("書籍取得エラー:", error);
      return null;
    }
  }

  /**
   * 書籍を更新
   */
  static async updateBook(book: Book): Promise<void> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user || !user.id) {
        console.warn("匿名認証環境では書籍の更新はSupabaseで直接行われます");
        return;
      }
      const service = await this.getSupabaseService();
      await service.updateBook(book);
    } catch (error) {
      console.error("書籍更新エラー:", error);
      throw error;
    }
  }

  /**
   * 書籍を削除
   */
  static async removeBook(bookId: string): Promise<void> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user || !user.id) {
        console.warn("匿名認証環境では書籍の削除はSupabaseで直接行われます");
        return;
      }
      const service = await this.getSupabaseService();
      await service.removeBook(bookId);
    } catch (error) {
      console.error("書籍削除エラー:", error);
      throw error;
    }
  }

  /**
   * 書籍を削除（エイリアス）
   */
  static async deleteBook(bookId: string): Promise<void> {
    return this.removeBook(bookId);
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
