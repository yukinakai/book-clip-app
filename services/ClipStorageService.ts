import AsyncStorage from "@react-native-async-storage/async-storage";
import { Clip } from "../constants/MockData";
import { BookStorageService } from "./BookStorageService";

const STORAGE_KEY = "@saved_clips";

export class ClipStorageService {
  static async saveClip(clip: Clip): Promise<void> {
    try {
      const existingClipsJson = await AsyncStorage.getItem(STORAGE_KEY);
      const existingClips: Clip[] = existingClipsJson
        ? JSON.parse(existingClipsJson)
        : [];

      // 新しいクリップにIDを割り当て
      const newClip = {
        ...clip,
        id: clip.id || Date.now().toString(),
        createdAt: clip.createdAt || new Date().toISOString(),
      };

      const updatedClips = [...existingClips, newClip];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedClips));

      // 最後に使用した書籍の情報を更新
      const books = await BookStorageService.getAllBooks();
      const book = books.find((b) => b.id === clip.bookId);
      if (book) {
        await BookStorageService.setLastClipBook(book);
      }
    } catch (error) {
      console.error("Error saving clip:", error);
      throw error;
    }
  }

  static async getAllClips(): Promise<Clip[]> {
    try {
      const clipsJson = await AsyncStorage.getItem(STORAGE_KEY);
      return clipsJson ? JSON.parse(clipsJson) : [];
    } catch (error) {
      console.error("Error getting clips:", error);
      return [];
    }
  }

  static async getClipsByBookId(bookId: string): Promise<Clip[]> {
    try {
      const allClips = await this.getAllClips();
      return allClips.filter((clip) => clip.bookId === bookId);
    } catch (error) {
      console.error("Error getting clips by book ID:", error);
      return [];
    }
  }

  static async removeClip(clipId: string): Promise<void> {
    try {
      const existingClipsJson = await AsyncStorage.getItem(STORAGE_KEY);
      const existingClips: Clip[] = existingClipsJson
        ? JSON.parse(existingClipsJson)
        : [];
      const updatedClips = existingClips.filter((clip) => clip.id !== clipId);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedClips));
    } catch (error) {
      console.error("Error removing clip:", error);
      throw error;
    }
  }

  static async updateClip(updatedClip: Clip): Promise<void> {
    try {
      const existingClipsJson = await AsyncStorage.getItem(STORAGE_KEY);
      const existingClips: Clip[] = existingClipsJson
        ? JSON.parse(existingClipsJson)
        : [];

      // 更新対象のクリップを置き換え
      const updatedClips = existingClips.map((clip) =>
        clip.id === updatedClip.id ? updatedClip : clip
      );

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedClips));
    } catch (error) {
      console.error("Error updating clip:", error);
      throw error;
    }
  }

  // 特定の書籍に関連するすべてのクリップを削除
  static async deleteClipsByBookId(bookId: string): Promise<void> {
    try {
      const existingClipsJson = await AsyncStorage.getItem(STORAGE_KEY);
      const existingClips: Clip[] = existingClipsJson
        ? JSON.parse(existingClipsJson)
        : [];

      // 指定された書籍ID以外のクリップを残す
      const updatedClips = existingClips.filter(
        (clip) => clip.bookId !== bookId
      );

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedClips));
    } catch (error) {
      console.error("Error deleting clips by book ID:", error);
      throw error;
    }
  }
}
