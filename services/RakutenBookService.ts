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
          id: bookItem.Item.isbn,
          title: bookItem.Item.title,
          author: bookItem.Item.author,
          coverImage: bookItem.Item.largeImageUrl,
        };
        return book;
      }
      return null;
    } catch (error) {
      console.error("Error searching book:", error);
      throw error;
    }
  }

  static async searchAndSaveBook(isbn: string): Promise<Book | null> {
    try {
      const book = await this.searchByIsbn(isbn);
      if (book) {
        await BookStorageService.saveBook(book);
        return book;
      }
      return null;
    } catch (error) {
      console.error("Error searching and saving book:", error);
      throw error;
    }
  }
}
