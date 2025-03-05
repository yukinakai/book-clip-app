import { supabase } from '../supabase';
import {
  createQuote,
  getQuote,
  getQuotesByBookId,
  updateQuote,
  deleteQuote,
  updateQuoteTags,
  searchQuotes,
} from '../quotes';
import { Quote } from '@/types/quote';

jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    })),
  },
}));

describe('quotes', () => {
  // ... 既存のテスト ...

  describe('searchQuotes', () => {
    const mockQuotes: Quote[] = [
      {
        id: '1',
        content: 'テスト引用1',
        page: 1,
        memo: 'メモ1',
        bookId: 'book1',
        userId: 'user1',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        tags: [{ id: 'tag1', name: 'タグ1', userId: 'user1', createdAt: '', updatedAt: '' }],
      },
      {
        id: '2',
        content: 'テスト引用2',
        page: 2,
        memo: 'メモ2',
        bookId: 'book1',
        userId: 'user1',
        createdAt: '2025-01-02',
        updatedAt: '2025-01-02',
        tags: [{ id: 'tag2', name: 'タグ2', userId: 'user1', createdAt: '', updatedAt: '' }],
      },
    ];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('キーワードで引用を検索できる', async () => {
      const mockSupabase = supabase.from('quotes');
      const mockChain = {
        ...mockSupabase,
        ilike: jest.fn().mockReturnThis(),
        data: mockQuotes,
        error: null,
      };
      (mockSupabase.select as jest.Mock).mockReturnValue(mockChain);
      (mockChain.ilike as jest.Mock).mockResolvedValue({ data: mockQuotes, error: null });

      const result = await searchQuotes({ query: 'テスト' });
      expect(result).toHaveLength(2);
      expect(mockSupabase.select).toHaveBeenCalledWith(`
        *,
        tags (*)
      `);
      expect(mockChain.ilike).toHaveBeenCalledWith('content', '%テスト%');
    });

    it('タグで引用を絞り込める', async () => {
      const mockSupabase = supabase.from('quotes');
      const mockChain = {
        ...mockSupabase,
        in: jest.fn().mockReturnThis(),
        data: [mockQuotes[0]],
        error: null,
      };
      (mockSupabase.select as jest.Mock).mockReturnValue(mockChain);
      (mockChain.in as jest.Mock).mockResolvedValue({ data: [mockQuotes[0]], error: null });

      const result = await searchQuotes({ tagIds: ['tag1'] });
      expect(result).toHaveLength(1);
      expect(mockSupabase.select).toHaveBeenCalledWith(`
        *,
        tags!inner (*)
      `);
      expect(mockChain.in).toHaveBeenCalledWith('tags.id', ['tag1']);
    });

    it('作成日時でソートできる', async () => {
      const mockSupabase = supabase.from('quotes');
      const mockChain = {
        ...mockSupabase,
        order: jest.fn().mockReturnThis(),
        data: mockQuotes,
        error: null,
      };
      (mockSupabase.select as jest.Mock).mockReturnValue(mockChain);
      (mockChain.order as jest.Mock).mockResolvedValue({ data: mockQuotes, error: null });

      const result = await searchQuotes({ orderBy: 'createdAt', ascending: false });
      expect(result).toHaveLength(2);
      expect(mockChain.order).toHaveBeenCalledWith('createdAt', { ascending: false });
    });

    it('エラー時に空配列を返す', async () => {
      const mockSupabase = supabase.from('quotes');
      const mockChain = {
        ...mockSupabase,
        data: null,
        error: new Error('テストエラー'),
      };
      (mockSupabase.select as jest.Mock).mockReturnValue(mockChain);
      (mockChain as any).mockResolvedValue({ data: null, error: new Error('テストエラー') });

      const result = await searchQuotes({});
      expect(result).toEqual([]);
    });
  });
});
