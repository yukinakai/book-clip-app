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
   * 注意: アプリが匿名認証を使用する場合、すべてのユーザーがSupabaseストレージを使用します
   */
  static async initializeStorage(): Promise<void> {
    try {
      // 現在のユーザーを取得
      const user = await AuthService.getCurrentUser();

      if (user) {
        // 認証済みの場合（匿名ユーザーを含む）
        const supabaseStorage = new SupabaseStorageService(user.id);
        BookStorageService.setStorageBackend(supabaseStorage);
        ClipStorageService.setStorageBackend(supabaseStorage);
        BookStorageService.switchToSupabase();
        ClipStorageService.switchToSupabase();
        if (__DEV__) {
          console.log(
            "Supabaseストレージに初期化しました - ユーザーID:",
            user.id
          );
        }
      } else {
        // ユーザーが存在しない場合（初回起動時や認証エラー時）
        // 匿名認証が成功するまでの一時的な措置としてローカルストレージを使用
        const localStorage = new LocalStorageService();
        BookStorageService.setStorageBackend(localStorage);
        ClipStorageService.setStorageBackend(localStorage);
        BookStorageService.switchToLocal();
        ClipStorageService.switchToLocal();
        if (__DEV__) {
          console.log("一時的にローカルストレージを使用します（匿名認証待ち）");
        }
      }
    } catch (error) {
      console.error("ストレージの初期化に失敗しました:", error);
      // エラー時はローカルストレージにフォールバック
      const localStorage = new LocalStorageService();
      BookStorageService.setStorageBackend(localStorage);
      ClipStorageService.setStorageBackend(localStorage);
      BookStorageService.switchToLocal();
      ClipStorageService.switchToLocal();
      if (__DEV__) {
        console.log(
          "ストレージ初期化エラー（ローカルストレージにフォールバック）"
        );
      }
    }
  }

  /**
   * ユーザー認証時のストレージ切り替え
   */
  static async switchToSupabaseStorage(
    userId: string,
    _progressCallback?: (progress: MigrationProgress) => void
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
   * ローカルデータをクリア
   */
  static async clearLocalData(): Promise<void> {
    try {
      const localStorage = new LocalStorageService();
      await localStorage.clearAllData();
    } catch (error) {
      console.error("Failed to clear local data:", error);
      throw error;
    }
  }

  /**
   * ローカルデータをSupabaseに移行
   * 注意: 匿名認証を使用する場合、この機能は不要になります。
   * すべてのデータは最初からSupabaseに保存されるため、移行は必要ありません。
   */
  static async migrateLocalToSupabase(
    _userId: string,
    _progressCallback?: (progress: MigrationProgress) => void
  ): Promise<{
    total: number;
    processed: number;
    failed: number;
  }> {
    // 匿名認証を使用する場合、この機能は不要
    console.warn(
      "匿名認証を使用する場合、データ移行は不要です。すべて成功として返します。"
    );

    return {
      total: 0,
      processed: 0,
      failed: 0,
    };
  }
}
