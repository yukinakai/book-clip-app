import { Clip } from "../constants/MockData";
import { StorageService } from "./StorageInterface";
import { LocalStorageService } from "./LocalStorageService";

/**
 * クリップストレージサービス
 * データの保存先を自動的に切り替える
 */
export class ClipStorageService extends StorageService {
  // 初期設定としてLocalStorageを使用
  protected static storageBackend = new LocalStorageService();

  /**
   * クリップを保存
   */
  static async saveClip(clip: Clip): Promise<void> {
    try {
      return await this.storageBackend.saveClip(clip);
    } catch (error) {
      console.error("Error saving clip:", error);
      throw error;
    }
  }

  /**
   * すべてのクリップを取得
   */
  static async getAllClips(): Promise<Clip[]> {
    return this.storageBackend.getAllClips();
  }

  /**
   * 書籍IDに関連するクリップを取得
   */
  static async getClipsByBookId(bookId: string): Promise<Clip[]> {
    return this.storageBackend.getClipsByBookId(bookId);
  }

  /**
   * クリップIDで単一のクリップを取得
   * この方法はストレージバックエンドがサポートしている場合は効率的に動作
   */
  static async getClipById(clipId: string): Promise<Clip | null> {
    // StorageInterfaceが対応していればそのメソッドを使用
    if ("getClipById" in this.storageBackend) {
      return (this.storageBackend as any).getClipById(clipId);
    }

    // 対応していない場合は全クリップから検索
    const clips = await this.getAllClips();
    return clips.find((clip) => clip.id === clipId) || null;
  }

  /**
   * クリップを削除
   */
  static async removeClip(clipId: string): Promise<void> {
    return this.storageBackend.removeClip(clipId);
  }

  /**
   * クリップを更新
   */
  static async updateClip(clip: Clip): Promise<void> {
    try {
      return await this.storageBackend.updateClip(clip);
    } catch (error) {
      console.error("Error updating clip:", error);
      throw error;
    }
  }

  /**
   * 書籍IDに関連するすべてのクリップを削除
   */
  static async deleteClipsByBookId(bookId: string): Promise<void> {
    try {
      return await this.storageBackend.deleteClipsByBookId(bookId);
    } catch (error) {
      console.error("Error deleting clips by book ID:", error);
      throw error;
    }
  }
}
