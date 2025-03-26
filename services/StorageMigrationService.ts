import { AuthService } from "./auth";
import { LocalStorageService } from "./LocalStorageService";

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
 * 匿名認証環境でのストレージ管理を担当
 * 注意: 匿名認証を使用するため、すべてのデータはSupabaseに保存され、
 * このサービスは最後に選択した書籍情報のみをローカルストレージで管理します
 */
export class StorageMigrationService {
  private static localStorageService = new LocalStorageService();

  /**
   * 認証状態に基づいてストレージを初期化
   * 匿名認証環境では特に何も行いません
   */
  static async initializeStorage(): Promise<void> {
    try {
      const user = await AuthService.getCurrentUser();
      if (user) {
        if (__DEV__) {
          console.log("ユーザーが認証済みです - ユーザーID:", user.id);
        }
      } else {
        if (__DEV__) {
          console.log("未認証状態です、匿名認証が行われるまで待機します");
        }
      }
    } catch (error) {
      console.error("ストレージの初期化に失敗しました:", error);
    }
  }

  /**
   * ユーザー認証時のストレージ切り替え
   * 匿名認証環境では特に何も行いません
   */
  static async switchToSupabaseStorage(
    userId: string,
    _progressCallback?: (progress: MigrationProgress) => void
  ): Promise<void> {
    if (__DEV__) {
      console.log("Supabaseストレージを使用します - ユーザーID:", userId);
    }
  }

  /**
   * ユーザーログアウト時のストレージ切り替え
   * 匿名認証環境では特に何も行いません
   */
  static async switchToLocalStorage(): Promise<void> {
    if (__DEV__) {
      console.log(
        "ログアウト時のストレージ切り替え（匿名認証環境では操作なし）"
      );
    }
  }

  /**
   * ローカルデータをクリア
   * 最後に選択した書籍情報をクリアします
   */
  static async clearLocalData(): Promise<void> {
    try {
      await this.localStorageService.clearAllData();
      if (__DEV__) {
        console.log("最後に選択した書籍情報をクリアしました");
      }
    } catch (error) {
      console.error("ローカルデータのクリアに失敗しました:", error);
      throw error;
    }
  }

  /**
   * ローカルデータをSupabaseに移行
   * 匿名認証環境では不要な操作です
   */
  static async migrateLocalToSupabase(
    _userId: string,
    _progressCallback?: (progress: MigrationProgress) => void
  ): Promise<{
    total: number;
    processed: number;
    failed: number;
  }> {
    console.warn(
      "匿名認証環境では、データ移行は不要です。すべて成功として返します。"
    );

    return {
      total: 0,
      processed: 0,
      failed: 0,
    };
  }

  /**
   * ローカルデータをSupabaseに移行（別名）
   * 互換性のために残していますが、匿名認証環境では使用されません
   */
  static async migrateLocalDataToSupabase(
    userId: string,
    progressCallback?: (progress: MigrationProgress) => void
  ): Promise<boolean> {
    await this.migrateLocalToSupabase(userId, progressCallback);
    return true;
  }
}
