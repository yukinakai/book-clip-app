import { AuthService } from "./auth";
import { BookStorageService } from "./BookStorageService";
import { ClipStorageService } from "./ClipStorageService";
import { LocalStorageService } from "./LocalStorageService";
import { SupabaseStorageService } from "./SupabaseStorageService";

/**
 * データ移行の進捗状況を表すインターフェース
 */
export interface MigrationProgress {
  total: number;
  current: number;
  status: "migrating" | "completed" | "failed";
  error?: Error;
}

/**
 * ストレージ移行サービス
 * ローカルデータとSupabaseデータの間の移行を管理
 */
export class StorageMigrationService {
  /**
   * 認証状態に基づいてストレージを初期化
   */
  static async initializeStorage(): Promise<void> {
    try {
      // 現在のユーザーを取得
      const user = await AuthService.getCurrentUser();

      if (user) {
        // 認証済みの場合
        const supabaseStorage = new SupabaseStorageService(user.id);
        BookStorageService.setStorageBackend(supabaseStorage);
        ClipStorageService.setStorageBackend(supabaseStorage);
        BookStorageService.switchToSupabase();
        ClipStorageService.switchToSupabase();
      } else {
        // 未認証の場合
        const localStorage = new LocalStorageService();
        BookStorageService.setStorageBackend(localStorage);
        ClipStorageService.setStorageBackend(localStorage);
        BookStorageService.switchToLocal();
        ClipStorageService.switchToLocal();
      }
    } catch (error) {
      console.error("Failed to initialize storage:", error);
      // エラー時はローカルストレージにフォールバック
      const localStorage = new LocalStorageService();
      BookStorageService.setStorageBackend(localStorage);
      ClipStorageService.setStorageBackend(localStorage);
      BookStorageService.switchToLocal();
      ClipStorageService.switchToLocal();
    }
  }

  /**
   * ユーザー認証時のストレージ切り替え
   */
  static async switchToSupabaseStorage(
    userId: string,
    progressCallback?: (progress: MigrationProgress) => void
  ): Promise<void> {
    // Supabaseストレージを作成
    const supabaseStorage = new SupabaseStorageService(userId);
    BookStorageService.setStorageBackend(supabaseStorage);
    ClipStorageService.setStorageBackend(supabaseStorage);
    BookStorageService.switchToSupabase();
    ClipStorageService.switchToSupabase();
  }

  /**
   * ユーザーログアウト時のストレージ切り替え
   */
  static async switchToLocalStorage(): Promise<void> {
    // ローカルストレージを作成
    const localStorage = new LocalStorageService();
    BookStorageService.setStorageBackend(localStorage);
    ClipStorageService.setStorageBackend(localStorage);
    BookStorageService.switchToLocal();
    ClipStorageService.switchToLocal();
  }

  /**
   * ローカルデータをSupabaseに移行
   */
  static async migrateLocalToSupabase(
    userId: string,
    progressCallback?: (progress: MigrationProgress) => void
  ): Promise<{
    total: number;
    processed: number;
    failed: number;
  }> {
    // 一時的にローカルストレージのインスタンスを作成
    const localStorage = new LocalStorageService();
    const supabaseStorage = new SupabaseStorageService(userId);

    try {
      // ローカルデータの取得
      const books = await localStorage.getAllBooks();
      const clips = await localStorage.getAllClips();
      const totalItems = books.length + clips.length;

      // 進捗状況の初期化
      let progress: MigrationProgress = {
        total: totalItems,
        current: 0,
        status: "migrating",
      };
      if (progressCallback) progressCallback(progress);

      // 処理結果のカウンター
      let processed = 0;
      let failed = 0;

      // 書籍の移行
      for (const book of books) {
        try {
          await supabaseStorage.saveBook(book);
          processed++;
        } catch (error) {
          console.error(`Failed to migrate book ${book.id}:`, error);
          failed++;
        }

        // 進捗更新
        progress = {
          ...progress,
          current: processed + failed,
        };
        if (progressCallback) progressCallback(progress);
      }

      // クリップの移行
      for (const clip of clips) {
        try {
          await supabaseStorage.saveClip(clip);
          processed++;
        } catch (error) {
          console.error(`Failed to migrate clip ${clip.id}:`, error);
          failed++;
        }

        // 進捗更新
        progress = {
          ...progress,
          current: processed + failed,
        };
        if (progressCallback) progressCallback(progress);
      }

      // 完了状態を通知
      progress = {
        ...progress,
        status: "completed",
      };
      if (progressCallback) progressCallback(progress);

      return {
        total: totalItems,
        processed,
        failed,
      };
    } catch (error) {
      console.error("Migration failed:", error);

      // エラー状態を通知
      const progress: MigrationProgress = {
        total: 0,
        current: 0,
        status: "failed",
        error: error instanceof Error ? error : new Error(String(error)),
      };
      if (progressCallback) progressCallback(progress);

      throw error;
    }
  }

  /**
   * ローカルデータをクリア
   */
  static async clearLocalData(): Promise<void> {
    const localStorage = new LocalStorageService();
    await localStorage.clearAllData();
  }

  /**
   * ローカルデータをSupabaseに移行する
   * @param userId Supabaseのユーザーid
   * @param _progressCallback 進捗を報告するコールバック関数
   */
  static async migrateLocalDataToSupabase(
    _userId: string,
    _progressCallback?: (progress: number) => void
  ): Promise<boolean> {
    // ... existing code ...
  }
}
