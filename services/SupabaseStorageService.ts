import { Book, Clip } from "../constants/MockData";
import { StorageInterface } from "./StorageInterface";
import { supabase } from "./auth";

/**
 * Supabaseを使用したストレージの実装
 */
export class SupabaseStorageService implements StorageInterface {
  private readonly BOOKS_TABLE = "books";
  private readonly CLIPS_TABLE = "clips";
  private readonly userId: string;

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
        .from(this.BOOKS_TABLE)
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
          .from(this.BOOKS_TABLE)
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
        .from(this.BOOKS_TABLE)
        .select("*")
        .eq("user_id", this.userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // データベースのスネークケースからキャメルケースに変換
      return (
        data.map((book) => ({
          id: book.id,
          title: book.title,
          author: book.author,
          coverImage: book.cover_image,
          isbn: book.isbn,
        })) || []
      );
    } catch (error) {
      console.error("Error getting books from Supabase:", error);
      return [];
    }
  }

  async removeBook(bookId: string): Promise<void> {
    try {
      if (!this.userId) throw new Error("認証されていません");

      const { error } = await supabase
        .from(this.BOOKS_TABLE)
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

      const { error } = await supabase.from(this.CLIPS_TABLE).insert(clipData);

      if (error) {
        console.error("クリップの保存でエラー:", error);
        throw error;
      }
      console.log("クリップの保存が完了しました");
    } catch (error) {
      console.error("Error saving clip to Supabase:", error);
      throw error;
    }
  }

  async getAllClips(): Promise<Clip[]> {
    try {
      if (!this.userId) return [];

      const { data, error } = await supabase
        .from(this.CLIPS_TABLE)
        .select("*")
        .eq("user_id", this.userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // データベースのスネークケースからキャメルケースに変換
      return (
        data.map((clip) => ({
          id: clip.id,
          bookId: clip.book_id,
          text: clip.text,
          page: clip.page,
          createdAt: clip.created_at,
        })) || []
      );
    } catch (error) {
      console.error("Error getting clips from Supabase:", error);
      return [];
    }
  }

  async getClipsByBookId(bookId: string): Promise<Clip[]> {
    try {
      if (!this.userId) return [];

      const { data, error } = await supabase
        .from(this.CLIPS_TABLE)
        .select("*")
        .eq("user_id", this.userId)
        .eq("book_id", bookId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // データベースのスネークケースからキャメルケースに変換
      return (
        data.map((clip) => ({
          id: clip.id,
          bookId: clip.book_id,
          text: clip.text,
          page: clip.page,
          createdAt: clip.created_at,
        })) || []
      );
    } catch (error) {
      console.error("Error getting clips by book ID from Supabase:", error);
      return [];
    }
  }

  async removeClip(clipId: string): Promise<void> {
    try {
      if (!this.userId) throw new Error("認証されていません");

      const { error } = await supabase
        .from(this.CLIPS_TABLE)
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
        .from(this.CLIPS_TABLE)
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
        .from(this.CLIPS_TABLE)
        .delete()
        .eq("book_id", bookId)
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
