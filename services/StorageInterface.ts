import { Book, Clip } from "../constants/MockData";

/**
 * ストレージバックエンドのインターフェース
 * ローカルストレージとSupabaseのどちらも実装するための共通インターフェース
 */
export interface StorageInterface {
  // 書籍関連
  saveBook(book: Book): Promise<void>;
  getAllBooks(): Promise<Book[]>;
  removeBook(bookId: string): Promise<void>;

  // クリップ関連
  saveClip(clip: Clip): Promise<void>;
  getAllClips(): Promise<Clip[]>;
  getClipsByBookId(bookId: string): Promise<Clip[]>;
  removeClip(clipId: string): Promise<void>;
  updateClip(clip: Clip): Promise<void>;
  deleteClipsByBookId(bookId: string): Promise<void>;

  // ストレージ管理
  clearAllData(): Promise<void>;
}

/**
 * ストレージサービスの抽象クラス
 * ストレージの切り替えと状態管理を行う
 */
export abstract class StorageService {
  protected static isUsingSupabase: boolean = false;
  protected static storageBackend: StorageInterface;

  /**
   * Supabaseストレージに切り替える
   */
  static switchToSupabase(): void {
    this.isUsingSupabase = true;
  }

  /**
   * ローカルストレージに切り替える
   */
  static switchToLocal(): void {
    this.isUsingSupabase = false;
  }

  /**
   * 現在認証済みかどうかを確認
   */
  static get isAuthenticated(): boolean {
    return this.isUsingSupabase;
  }

  /**
   * ローカルデータをクリアする
   */
  static async clearLocalData(): Promise<void> {
    if (!this.isUsingSupabase) {
      await this.storageBackend.clearAllData();
    }
  }

  /**
   * 使用するストレージバックエンドを設定
   */
  static setStorageBackend(backend: StorageInterface): void {
    this.storageBackend = backend;
  }
}
