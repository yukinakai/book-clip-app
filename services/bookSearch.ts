import { Alert } from "react-native";

interface BookInfo {
  title: string;
  author: string;
  isbn: string;
  imageUrl?: string;
  // 必要に応じて他のフィールドを追加
}

export const searchBookByIsbn = async (
  isbn: string
): Promise<BookInfo | null> => {
  try {
    const applicationId = process.env.EXPO_PUBLIC_RAKUTEN_APP_ID;

    if (!applicationId) {
      throw new Error(
        "楽天アプリケーションIDが設定されていません。環境変数EXPO_PUBLIC_RAKUTEN_APP_IDを確認してください。"
      );
    }

    const formattedIsbn = isbn.replace(/[^0-9]/g, "");

    if (formattedIsbn.length !== 13 || !/^\d+$/.test(formattedIsbn)) {
      throw new Error(
        `無効なISBN形式です: ${formattedIsbn}。13桁の数字が必要です。`
      );
    }

    const apiUrl = `https://app.rakuten.co.jp/services/api/BooksTotal/Search/20170404?format=json&isbnjan=${formattedIsbn}&applicationId=${applicationId}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.Items || data.Items.length === 0) {
      return null;
    }

    const bookInfo = data.Items[0].Item;

    return {
      title: bookInfo.title || "不明",
      author: bookInfo.author || "不明",
      isbn: formattedIsbn,
      imageUrl: bookInfo.largeImageUrl,
    };
  } catch (error) {
    console.error("書籍情報の検索中にエラーが発生しました:", error);
    throw error;
  }
};
