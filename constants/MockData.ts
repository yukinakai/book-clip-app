export interface Book {
  id?: string; // Supabaseで自動生成されるUUID
  isbn: string; // ISBN番号
  title: string;
  author: string | null;
  coverImage: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Clip {
  id?: string; // Supabaseで自動生成されるUUID
  bookId: string;
  text: string;
  page: number;
  createdAt?: string;
  updatedAt?: string;
}
