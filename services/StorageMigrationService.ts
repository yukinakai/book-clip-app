import { AuthService } from "./auth";
import { BookStorageService } from "./BookStorageService";
import { ClipStorageService } from "./ClipStorageService";
import { LocalStorageService } from "./LocalStorageService";
import { SupabaseStorageService } from "./SupabaseStorageService";
import { supabase } from "./auth";
import { Book, Clip } from "../constants/MockData";

// ローカルIDとSupabase IDのマッピングを保持するオブジェクト
interface BookIdMapping {
  [localId: string]: string;
}

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
    userId: string,
    _progressCallback?: (progress: MigrationProgress) => void
  ): Promise<{
    total: number;
    processed: number;
    failed: number;
  }> {
    // 匿名認証を使用する場合、この機能は不要
    console.warn("匿名認証を使用する場合、データ移行は不要です。");

    // 一時的にローカルストレージのインスタンスを作成
    const localStorage = new LocalStorageService();

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
      if (_progressCallback) _progressCallback(progress);

      // 処理結果のカウンター
      let processed = 0;
      let failed = 0;

      // ローカルIDとSupabase IDのマッピングを保持するオブジェクト
      const bookIdMapping: BookIdMapping = {};

      // 書籍の移行
      for (const book of books) {
        try {
          // 書籍データを保存
          const newBookId = await this.saveBookToSupabase(userId, book);
          // IDのマッピングを保存
          if (newBookId && book.id) {
            bookIdMapping[book.id] = newBookId;
          }
          processed++;
        } catch (error) {
          console.error(`書籍の移行に失敗しました ${book.id}:`, error);
          failed++;
        }

        // 進捗更新
        progress = {
          ...progress,
          current: processed + failed,
        };
        if (_progressCallback) _progressCallback(progress);
      }

      // クリップの移行
      for (const clip of clips) {
        try {
          // クリップの書籍IDを変換
          if (clip.bookId && bookIdMapping[clip.bookId]) {
            const newBookId = bookIdMapping[clip.bookId];
            // 新しい書籍IDでクリップを保存
            await this.saveClipToSupabase(userId, clip, newBookId);
            processed++;
          } else {
            console.warn(
              `クリップ ${clip.id} の書籍IDのマッピングが見つかりません`
            );
            failed++;
          }
        } catch (error) {
          console.error(`クリップの移行に失敗しました ${clip.id}:`, error);
          failed++;
        }

        // 進捗更新
        progress = {
          ...progress,
          current: processed + failed,
        };
        if (_progressCallback) _progressCallback(progress);
      }

      // 完了状態を通知
      progress = {
        ...progress,
        status: "completed",
      };
      if (_progressCallback) _progressCallback(progress);

      return {
        total: totalItems,
        processed,
        failed,
      };
    } catch (error) {
      console.error("Migration failed:", error);

      // エラー状態を通知
      if (_progressCallback) {
        _progressCallback({
          total: 0,
          current: 0,
          status: "failed",
          error: error as Error,
        });
      }

      throw error;
    }
  }

  /**
   * 書籍データをSupabaseに保存
   */
  private static async saveBookToSupabase(
    userId: string,
    book: Book
  ): Promise<string | null> {
    try {
      const bookData = {
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        cover_image: book.coverImage,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("books")
        .insert(bookData)
        .select("id")
        .single();

      if (error) {
        console.error("書籍の保存でエラー:", error);
        throw error;
      }

      return data?.id || null;
    } catch (error) {
      console.error("Error saving book to Supabase:", error);
      throw error;
    }
  }

  /**
   * クリップデータをSupabaseに保存
   */
  private static async saveClipToSupabase(
    userId: string,
    clip: Clip,
    newBookId: string
  ): Promise<void> {
    try {
      const clipData = {
        user_id: userId,
        book_id: newBookId, // 新しい書籍IDを使用
        text: clip.text,
        page: clip.page,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("clips").insert(clipData);

      if (error) {
        console.error("クリップの保存でエラー:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error saving clip to Supabase:", error);
      throw error;
    }
  }
}
