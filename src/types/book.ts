import { Quote } from './quote';

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  publishedDate?: string;
  description?: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export type CreateBookInput = Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'userId'>;

export type UpdateBookInput = Partial<CreateBookInput>;

export interface BookWithQuotes extends Book {
  quotes?: Quote[];
}
