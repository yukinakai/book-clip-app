import { Book } from "../constants/MockData";
import { BookStorageService } from "./BookStorageService";

interface RakutenBookItem {
  Item: {
    isbn: string;
    title: string;
    author: string;
    largeImageUrl: string;
  };
}

export class RakutenBookService {
  private static readonly API_BASE_URL =
    "https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404";
  private static readonly APP_ID = process.env.EXPO_PUBLIC_RAKUTEN_APP_ID;

  static async searchByIsbn(isbn: string): Promise<Book | null> {
    try {
      const url = `${this.API_BASE_URL}?format=json&isbn=${isbn}&applicationId=${this.APP_ID}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.Items && data.Items.length > 0) {
        const bookItem = data.Items[0] as RakutenBookItem;
        const book: Book = {
          isbn: bookItem.Item.isbn,
          title: bookItem.Item.title,
          author: bookItem.Item.author,
          coverImage: bookItem.Item.largeImageUrl,
        };
        console.log("楽天APIから取得した書籍データ:", book);
        return book;
      }
      return null;
    } catch (error) {
      console.error("Error searching book:", error);
      throw error;
    }
  }

  static async searchAndSaveBook(
    isbn: string
  ): Promise<{ book: Book | null; isExisting: boolean }> {
    try {
      console.log("書籍検索開始 - ISBN:", isbn);
      const book = await this.searchByIsbn(isbn);
      if (book) {
        console.log("書籍が見つかりました:", book);
        // 既存の本をチェック
        const existingBooks = await BookStorageService.getAllBooks();
        const isExisting = existingBooks.some((b) => b.isbn === book.isbn);

        if (!isExisting) {
          console.log("新規書籍として保存します");
          await BookStorageService.saveBook(book);
        } else {
          console.log("既存の書籍が見つかりました");
        }

        return { book, isExisting };
      }
      console.log("書籍が見つかりませんでした");
      return { book: null, isExisting: false };
    } catch (error) {
      console.error("Error searching and saving book:", error);
      throw error;
    }
  }
}
