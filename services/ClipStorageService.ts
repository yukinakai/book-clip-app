import { Clip } from "../constants/MockData";
import { SupabaseStorageService } from "./SupabaseStorageService";
import { AuthService } from "./auth";

/**
 * クリップストレージサービス
 * 匿名認証環境でもSupabaseデータベースへの操作を担当
 */
export class ClipStorageService {
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
        console.warn(
          "匿名認証環境ではクリップの取得はSupabaseから直接行われます"
        );
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
   * クリップを保存
   */
  static async saveClip(clip: Clip): Promise<void> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user || !user.id) {
        console.warn(
          "匿名認証環境ではクリップの保存はSupabaseに直接行われます"
        );
        return;
      }
      const service = await this.getSupabaseService();
      await service.saveClip(clip);
    } catch (error) {
      console.error("クリップ保存エラー:", error);
      throw error;
    }
  }

  /**
   * すべてのクリップを取得
   */
  static async getAllClips(): Promise<Clip[]> {
    try {
      const service = await this.getSupabaseService();
      return await service.getAllClips();
    } catch (error) {
      console.error("クリップ一覧取得エラー:", error);
      return [];
    }
  }

  /**
   * 書籍IDに関連するクリップを取得
   */
  static async getClipsByBookId(bookId: string): Promise<Clip[]> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user || !user.id) {
        console.warn(
          "匿名認証環境ではクリップの取得はSupabaseから直接行われます"
        );
        return [];
      }
      const service = await this.getSupabaseService();
      return await service.getClipsByBookId(bookId);
    } catch (error) {
      console.error("Error getting clips by book ID:", error);
      throw error;
    }
  }

  /**
   * クリップIDで単一のクリップを取得
   */
  static async getClipById(clipId: string): Promise<Clip | null> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user || !user.id) {
        console.warn(
          "匿名認証環境ではクリップの取得はSupabaseから直接行われます"
        );
        return null;
      }
      const service = await this.getSupabaseService();
      return await service.getClipById(clipId);
    } catch (error) {
      console.error("Error getting clip by ID:", error);
      throw error;
    }
  }

  /**
   * クリップを削除
   */
  static async removeClip(clipId: string): Promise<void> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user || !user.id) {
        console.warn(
          "匿名認証環境ではクリップの削除はSupabaseで直接行われます"
        );
        return;
      }
      const service = await this.getSupabaseService();
      await service.removeClip(clipId);
    } catch (error) {
      console.error("クリップ削除エラー:", error);
      throw error;
    }
  }

  /**
   * クリップを更新
   */
  static async updateClip(clip: Clip): Promise<void> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user || !user.id) {
        console.warn(
          "匿名認証環境ではクリップの更新はSupabaseで直接行われます"
        );
        return;
      }
      const service = await this.getSupabaseService();
      await service.updateClip(clip);
    } catch (error) {
      console.error("クリップ更新エラー:", error);
      throw error;
    }
  }

  /**
   * 書籍IDに関連するすべてのクリップを削除
   */
  static async deleteClipsByBookId(bookId: string): Promise<void> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user || !user.id) {
        console.warn(
          "匿名認証環境ではクリップの削除はSupabaseで直接行われます"
        );
        return;
      }
      const service = await this.getSupabaseService();
      await service.deleteClipsByBookId(bookId);
    } catch (error) {
      console.error("書籍別クリップ削除エラー:", error);
      throw error;
    }
  }
}
