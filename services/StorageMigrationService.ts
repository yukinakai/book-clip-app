import { AuthService } from "./auth";
import { BookStorageService } from "./BookStorageService";
import { ClipStorageService } from "./ClipStorageService";
import { LocalStorageService } from "./LocalStorageService";
import { SupabaseStorageService } from "./SupabaseStorageService";
import { Book, Clip } from "../constants/MockData";
import { supabase } from "./auth";

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
        if (__DEV__) {
          console.log("Storage initialized");
        }
      } else {
        // 未認証の場合
        const localStorage = new LocalStorageService();
        BookStorageService.setStorageBackend(localStorage);
        ClipStorageService.setStorageBackend(localStorage);
        BookStorageService.switchToLocal();
        ClipStorageService.switchToLocal();
        if (__DEV__) {
          console.log("Storage initialized");
        }
      }
    } catch (error) {
      console.error("Failed to initialize storage:", error);
      // エラー時はローカルストレージにフォールバック
      const localStorage = new LocalStorageService();
      BookStorageService.setStorageBackend(localStorage);
      ClipStorageService.setStorageBackend(localStorage);
      BookStorageService.switchToLocal();
      ClipStorageService.switchToLocal();
      if (__DEV__) {
        console.log("Storage initialized (fallback to local)");
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
   * ローカルデータをSupabaseに移行
   */
  static async migrateLocalToSupabase(
    userId: string,
    _progressCallback?: (progress: MigrationProgress) => void
  ): Promise<{
    total: number;
    processed: number;
    failed: number;
  }> {
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
      const bookIdMapping: Record<string, string> = {};

      // 書籍の移行
      for (const book of books) {
        try {
          // 書籍データを保存
          const newBookId = await this.saveBookToSupabase(userId, book);
          // IDのマッピングを保存
          if (newBookId) {
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
      const progress: MigrationProgress = {
        total: 0,
        current: 0,
        status: "failed",
        error: error instanceof Error ? error : new Error(String(error)),
      };
      if (_progressCallback) _progressCallback(progress);

      throw error;
    }
  }

  /**
   * 書籍データをSupabaseに保存し、新しく生成されたIDを返す
   */
  private static async saveBookToSupabase(
    userId: string,
    book: Book
  ): Promise<string | null> {
    try {
      // ISBNで既存の書籍を検索
      const { data: existingBooks, error: checkError } = await supabase
        .from("books")
        .select("id, isbn")
        .eq("isbn", book.isbn)
        .eq("user_id", userId);

      if (checkError) {
        console.error("書籍の存在確認でエラー:", checkError);
        throw checkError;
      }

      // 書籍が存在する場合はそのIDを返す
      if (existingBooks && existingBooks.length > 0) {
        return existingBooks[0].id;
      }

      // 書籍が存在しない場合は新規作成
      const bookData = {
        user_id: userId,
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        cover_image: book.coverImage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("books")
        .insert(bookData)
        .select()
        .single();

      if (error) {
        console.error("書籍の保存でエラー:", error);
        throw error;
      }

      // 新しく生成されたIDを返す
      return data.id;
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
    _progressCallback?: (progress: MigrationProgress) => void
  ): Promise<boolean> {
    try {
      await this.migrateLocalToSupabase(_userId, _progressCallback);
      return true;
    } catch (error) {
      console.error("データ移行に失敗しました:", error);
      return false;
    }
  }
}
