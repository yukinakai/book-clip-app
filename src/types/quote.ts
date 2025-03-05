import { Tag } from './tag';

export interface Quote {
  id: string;
  bookId: string;
  content: string;
  page?: number;
  memo?: string;
  tags?: Tag[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export type CreateQuoteInput = Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'userId'>;

export type UpdateQuoteInput = Partial<Omit<CreateQuoteInput, 'bookId'>>;

export interface QuoteFormData {
  content: string;
  page?: number;
  memo?: string;
  tags?: string[];
}
