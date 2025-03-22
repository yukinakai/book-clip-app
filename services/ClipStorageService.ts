import { Clip } from "../constants/MockData";
import { StorageService } from "./StorageInterface";
import { LocalStorageService } from "./LocalStorageService";
import { BookStorageService } from "./BookStorageService";

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
    const result = await this.storageBackend.saveClip(clip);

    // 最後に使用した書籍の情報を更新
    const books = await BookStorageService.getAllBooks();
    const book = books.find((b) => b.id === clip.bookId);
    if (book) {
      await BookStorageService.setLastClipBook(book);
    }

    return result;
  }

  /**
   * すべてのクリップを取得
   */
  static async getAllClips(): Promise<Clip[]> {
    return this.storageBackend.getAllClips();
  }

  /**
   * 書籍IDに基づくクリップを取得
   */
  static async getClipsByBookId(bookId: string): Promise<Clip[]> {
    return this.storageBackend.getClipsByBookId(bookId);
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
  static async updateClip(updatedClip: Clip): Promise<void> {
    return this.storageBackend.updateClip(updatedClip);
  }

  /**
   * 書籍IDに基づくクリップをすべて削除
   */
  static async deleteClipsByBookId(bookId: string): Promise<void> {
    return this.storageBackend.deleteClipsByBookId(bookId);
  }
}
