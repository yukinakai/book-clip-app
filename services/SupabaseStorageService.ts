import { Book, Clip } from "../constants/MockData";
import { StorageInterface } from "./StorageInterface";
import { supabase } from "./auth";

// テーブル名
const BOOKS_TABLE = "books";
const CLIPS_TABLE = "clips";
const USER_SETTINGS_TABLE = "user_settings";
const LAST_CLIP_BOOK_SETTING = "last_clip_book";

/**
 * Supabaseを使用したストレージの実装
 */
export class SupabaseStorageService implements StorageInterface {
  private userId: string | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  // 書籍関連の実装
  async saveBook(book: Book): Promise<void> {
    try {
      if (!this.userId) throw new Error("認証されていません");
      console.log("保存開始 - ユーザーID:", this.userId);
      console.log("保存する書籍データ:", book);

      // ISBNで既存の書籍を検索
      const { data: existingBooks, error: checkError } = await supabase
        .from(BOOKS_TABLE)
        .select("id, isbn")
        .eq("isbn", book.isbn)
        .eq("user_id", this.userId);

      if (checkError) {
        console.error("書籍の存在確認でエラー:", checkError);
        throw checkError;
      }

      console.log("既存の書籍:", existingBooks);

      // 書籍が存在しない場合のみ保存
      if (!existingBooks || existingBooks.length === 0) {
        const bookData = {
          user_id: this.userId,
          isbn: book.isbn,
          title: book.title,
          author: book.author,
          cover_image: book.coverImage,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        console.log("保存するデータ:", bookData);

        const { data, error } = await supabase
          .from(BOOKS_TABLE)
          .insert(bookData)
          .select()
          .single();

        if (error) {
          console.error("書籍の保存でエラー:", error);
          throw error;
        }
        console.log("書籍の保存が完了しました:", data);
      } else {
        console.log("書籍は既に存在します");
      }
    } catch (error) {
      console.error("Error saving book to Supabase:", error);
      throw error;
    }
  }

  async getAllBooks(): Promise<Book[]> {
    try {
      if (!this.userId) return [];

      const { data, error } = await supabase
        .from(BOOKS_TABLE)
        .select("*")
        .eq("user_id", this.userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting books from Supabase:", error);
      return [];
    }
  }

  async removeBook(bookId: string): Promise<void> {
    try {
      if (!this.userId) throw new Error("認証されていません");

      const { error } = await supabase
        .from(BOOKS_TABLE)
        .delete()
        .eq("id", bookId)
        .eq("user_id", this.userId);

      if (error) throw error;

      // 関連するクリップを削除
      await this.deleteClipsByBookId(bookId);
    } catch (error) {
      console.error("Error removing book from Supabase:", error);
      throw error;
    }
  }

  async setLastClipBook(book: Book): Promise<void> {
    try {
      if (!this.userId) throw new Error("認証されていません");

      // ユーザー設定を確認
      const { data: existingSetting, error: checkError } = await supabase
        .from(USER_SETTINGS_TABLE)
        .select("*")
        .eq("user_id", this.userId)
        .eq("key", LAST_CLIP_BOOK_SETTING)
        .single();

      if (checkError && checkError.code !== "PGRST116") throw checkError;

      // 設定が存在するかどうかで処理を分岐
      if (existingSetting) {
        // 更新
        const { error } = await supabase
          .from(USER_SETTINGS_TABLE)
          .update({
            value: JSON.stringify(book),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingSetting.id);

        if (error) throw error;
      } else {
        // 新規作成
        const { error } = await supabase.from(USER_SETTINGS_TABLE).insert({
          user_id: this.userId,
          key: LAST_CLIP_BOOK_SETTING,
          value: JSON.stringify(book),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
      }
    } catch (error) {
      console.error("Error saving last clip book to Supabase:", error);
      throw error;
    }
  }

  async getLastClipBook(): Promise<Book | null> {
    try {
      if (!this.userId) return null;

      const { data, error } = await supabase
        .from(USER_SETTINGS_TABLE)
        .select("value")
        .eq("user_id", this.userId)
        .eq("key", LAST_CLIP_BOOK_SETTING)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // 404 エラー（データが見つからない）
        throw error;
      }

      return data?.value ? JSON.parse(data.value) : null;
    } catch (error) {
      console.error("Error getting last clip book from Supabase:", error);
      return null;
    }
  }

  // クリップ関連の実装
  async saveClip(clip: Clip): Promise<void> {
    try {
      if (!this.userId) throw new Error("認証されていません");
      console.log("クリップ保存開始 - ユーザーID:", this.userId);
      console.log("保存するクリップデータ:", clip);

      const clipData = {
        user_id: this.userId,
        book_id: clip.bookId,
        text: clip.text,
        page: clip.page,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      console.log("Supabaseに保存するデータ:", clipData);

      const { data, error } = await supabase
        .from(CLIPS_TABLE)
        .insert(clipData)
        .select()
        .single();

      if (error) {
        console.error("クリップの保存でエラー:", error);
        throw error;
      }
      console.log("クリップの保存が完了しました:", data);

      // 最後に使用した書籍の情報を更新
      console.log("最後に使用した書籍の情報を更新中...");
      const books = await this.getAllBooks();
      const book = books.find((b) => b.id === clip.bookId);
      if (book) {
        console.log("最後に使用した書籍:", book);
        await this.setLastClipBook(book);
        console.log("最後に使用した書籍の情報を更新しました");
      } else {
        console.log("関連する書籍が見つかりませんでした");
      }
    } catch (error) {
      console.error("Error saving clip to Supabase:", error);
      throw error;
    }
  }

  async getAllClips(): Promise<Clip[]> {
    try {
      if (!this.userId) return [];

      const { data, error } = await supabase
        .from(CLIPS_TABLE)
        .select("*")
        .eq("user_id", this.userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting clips from Supabase:", error);
      return [];
    }
  }

  async getClipsByBookId(bookId: string): Promise<Clip[]> {
    try {
      if (!this.userId) return [];

      const { data, error } = await supabase
        .from(CLIPS_TABLE)
        .select("*")
        .eq("user_id", this.userId)
        .eq("bookId", bookId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting clips by book ID from Supabase:", error);
      return [];
    }
  }

  async removeClip(clipId: string): Promise<void> {
    try {
      if (!this.userId) throw new Error("認証されていません");

      const { error } = await supabase
        .from(CLIPS_TABLE)
        .delete()
        .eq("id", clipId)
        .eq("user_id", this.userId);

      if (error) throw error;
    } catch (error) {
      console.error("Error removing clip from Supabase:", error);
      throw error;
    }
  }

  async updateClip(updatedClip: Clip): Promise<void> {
    try {
      if (!this.userId) throw new Error("認証されていません");

      const { error } = await supabase
        .from(CLIPS_TABLE)
        .update({
          ...updatedClip,
          updated_at: new Date().toISOString(),
        })
        .eq("id", updatedClip.id)
        .eq("user_id", this.userId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating clip in Supabase:", error);
      throw error;
    }
  }

  async deleteClipsByBookId(bookId: string): Promise<void> {
    try {
      if (!this.userId) throw new Error("認証されていません");

      const { error } = await supabase
        .from(CLIPS_TABLE)
        .delete()
        .eq("bookId", bookId)
        .eq("user_id", this.userId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting clips by book ID from Supabase:", error);
      throw error;
    }
  }

  // ストレージ管理
  async clearAllData(): Promise<void> {
    // Supabaseに保存されたデータは削除しないため、
    // この実装では何もしない
    return;
  }
}
