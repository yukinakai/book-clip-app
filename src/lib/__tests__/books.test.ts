import { supabase } from '../supabase';
import { createBook, getBook, updateBook, deleteBook } from '../books';
import { Book, CreateBookInput, UpdateBookInput } from '@/types/book';

jest.mock('../supabase');

describe.skip('Books API', () => {
  const mockBook: Book = {
    id: '1',
    isbn: '9784156451234',
    title: 'テスト駆動開発',
    author: 'Kent Beck',
    publisher: 'オーム社',
    publishedDate: '2017-01-01',
    description: 'TDDの解説書',
    thumbnailUrl: 'https://example.com/book.jpg',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    userId: 'user1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBook', () => {
    const createBookInput: CreateBookInput = {
      isbn: mockBook.isbn,
      title: mockBook.title,
      author: mockBook.author,
      publisher: mockBook.publisher,
      publishedDate: mockBook.publishedDate,
      description: mockBook.description,
      thumbnailUrl: mockBook.thumbnailUrl,
    };

    it('新しい書籍を作成できる', async () => {
      // Mock insert operation
      const mockInsertResponse = {
        data: { id: '1' },
        error: null,
      };
      
      // Mock select operation to retrieve the created book
      const mockSelectResponse = {
        data: mockBook,
        error: null,
      };
      
      const mockSelectFn = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue(mockSelectResponse),
        }),
      });
      
      const mockFromFn = jest.fn();
      mockFromFn.mockImplementation((table) => {
        if (table === 'books') {
          return {
            insert: jest.fn().mockResolvedValue(mockInsertResponse),
            select: mockSelectFn,
          };
        }
        return {};
      });
      
      (supabase.from as jest.Mock).mockImplementation(mockFromFn);

      const result = await createBook(createBookInput);
      expect(result).toEqual(mockBook);
      expect(mockFromFn).toHaveBeenCalledWith('books');
    });

    it('エラー時にnullを返す', async () => {
      const mockResponse = {
        data: null,
        error: new Error('Database error'),
      };
      const mockFromFn = jest.fn().mockReturnValue({
        insert: jest.fn().mockResolvedValue(mockResponse),
      });
      (supabase.from as jest.Mock).mockImplementation(mockFromFn);

      const result = await createBook(createBookInput);
      expect(result).toBeNull();
    });
  });

  describe('getBook', () => {
    it('指定されたIDの書籍を取得できる', async () => {
      const mockResponse = {
        data: mockBook,
        error: null,
      };
      const mockFromFn = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue(mockResponse),
          }),
        }),
      });
      (supabase.from as jest.Mock).mockImplementation(mockFromFn);

      const result = await getBook('1');
      expect(result).toEqual(mockBook);
      expect(mockFromFn).toHaveBeenCalledWith('books');
    });

    it('存在しない書籍の場合はnullを返す', async () => {
      const mockResponse = {
        data: null,
        error: null,
      };
      const mockFromFn = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue(mockResponse),
          }),
        }),
      });
      (supabase.from as jest.Mock).mockImplementation(mockFromFn);

      const result = await getBook('999');
      expect(result).toBeNull();
    });
  });

  describe('updateBook', () => {
    const updateBookInput: UpdateBookInput = {
      title: '新しいタイトル',
      description: '更新された説明',
    };

    it('書籍情報を更新できる', async () => {
      const updatedBook = { ...mockBook, ...updateBookInput };
      
      // Mock update operation
      const mockUpdateResponse = {
        error: null,
      };
      
      // Mock select operation to retrieve the updated book
      const mockSelectResponse = {
        data: updatedBook,
        error: null,
      };
      
      const mockSelectFn = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue(mockSelectResponse),
        }),
      });
      
      const mockUpdateFn = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue(mockUpdateResponse),
      });
      
      const mockFromFn = jest.fn();
      mockFromFn.mockImplementation((table) => {
        if (table === 'books') {
          return {
            update: mockUpdateFn,
            select: mockSelectFn,
          };
        }
        return {};
      });
      
      (supabase.from as jest.Mock).mockImplementation(mockFromFn);

      const result = await updateBook('1', updateBookInput);
      expect(result).toEqual(updatedBook);
      expect(mockFromFn).toHaveBeenCalledWith('books');
    });

    it('エラー時にnullを返す', async () => {
      const mockResponse = {
        error: new Error('Database error'),
      };
      const mockFromFn = jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue(mockResponse),
        }),
      });
      (supabase.from as jest.Mock).mockImplementation(mockFromFn);

      const result = await updateBook('1', updateBookInput);
      expect(result).toBeNull();
    });
  });

  describe('deleteBook', () => {
    it('書籍を削除できる', async () => {
      const mockResponse = {
        error: null,
      };
      const mockFromFn = jest.fn().mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue(mockResponse),
        }),
      });
      (supabase.from as jest.Mock).mockImplementation(mockFromFn);

      const result = await deleteBook('1');
      expect(result).toBe(true);
      expect(mockFromFn).toHaveBeenCalledWith('books');
    });

    it('エラー時にfalseを返す', async () => {
      const mockResponse = {
        error: new Error('Database error'),
      };
      const mockFromFn = jest.fn().mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue(mockResponse),
        }),
      });
      (supabase.from as jest.Mock).mockImplementation(mockFromFn);

      const result = await deleteBook('1');
      expect(result).toBe(false);
    });
  });
});
