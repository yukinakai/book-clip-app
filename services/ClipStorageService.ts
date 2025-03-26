import { Clip } from "../constants/MockData";

/**
 * クリップストレージサービス
 * 匿名認証環境ではSupabaseデータベースへの操作を担当
 */
export class ClipStorageService {
  /**
   * クリップを保存
   * 匿名認証環境ではSupabaseに直接保存されるため、このメソッドは使用されない
   */
  static async saveClip(_clip: Clip): Promise<void> {
    console.warn("匿名認証環境ではクリップの保存はSupabaseに直接行われます");
  }

  /**
   * すべてのクリップを取得
   * 匿名認証環境ではSupabaseから直接取得されるため、このメソッドは使用されない
   */
  static async getAllClips(): Promise<Clip[]> {
    console.warn("匿名認証環境ではクリップの取得はSupabaseから直接行われます");
    return [];
  }

  /**
   * 書籍IDに関連するクリップを取得
   * 匿名認証環境ではSupabaseから直接取得されるため、このメソッドは使用されない
   */
  static async getClipsByBookId(_bookId: string): Promise<Clip[]> {
    console.warn("匿名認証環境ではクリップの取得はSupabaseから直接行われます");
    return [];
  }

  /**
   * クリップIDで単一のクリップを取得
   * 匿名認証環境ではSupabaseから直接取得されるため、このメソッドは使用されない
   */
  static async getClipById(_clipId: string): Promise<Clip | null> {
    console.warn("匿名認証環境ではクリップの取得はSupabaseから直接行われます");
    return null;
  }

  /**
   * クリップを削除
   * 匿名認証環境ではSupabaseで直接削除されるため、このメソッドは使用されない
   */
  static async removeClip(_clipId: string): Promise<void> {
    console.warn("匿名認証環境ではクリップの削除はSupabaseで直接行われます");
  }

  /**
   * クリップを更新
   * 匿名認証環境ではSupabaseで直接更新されるため、このメソッドは使用されない
   */
  static async updateClip(_clip: Clip): Promise<void> {
    console.warn("匿名認証環境ではクリップの更新はSupabaseで直接行われます");
  }

  /**
   * 書籍IDに関連するすべてのクリップを削除
   * 匿名認証環境ではSupabaseで直接削除されるため、このメソッドは使用されない
   */
  static async deleteClipsByBookId(_bookId: string): Promise<void> {
    console.warn("匿名認証環境ではクリップの削除はSupabaseで直接行われます");
  }
}
