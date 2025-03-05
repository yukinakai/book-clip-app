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

import { PostgrestFilterBuilder, PostgrestBuilder } from '@supabase/postgrest-js';

// すべてのメソッドチェーンをモック化するビルダーを作成
const createChainableMock = () => {
  const mockBuilder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    then: jest.fn(),
  };

  // Promise-like behavior
  mockBuilder.then = jest.fn().mockImplementation((onfulfilled) => {
    return Promise.resolve(onfulfilled ? onfulfilled(mockBuilder) : mockBuilder);
  });

  // Allow method chaining for any method
  return new Proxy(mockBuilder, {
    get: (target: any, prop: string) => {
      if (!(prop in target)) {
        target[prop] = jest.fn().mockReturnThis();
      }
      return target[prop];
    },
  });
};

// Supabaseクライアントのモック
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn().mockImplementation(() => createChainableMock()),
  },
}));

// テストファイルなのでTypeScriptの型チェックは無視
// @ts-ignore
describe('quotes', () => {
  const mockQuote: Quote = {
    id: '1',
    content: 'テスト引用',
    page: 1,
    memo: 'メモ',
    bookId: 'book1',
    userId: 'user1',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    tags: [{ id: 'tag1', name: 'タグ1', userId: 'user1', createdAt: '', updatedAt: '' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createQuote', () => {
    it('引用を作成できる', async () => {
      const mockSupabase = supabase.from('quotes');
      (mockSupabase.insert as jest.Mock).mockResolvedValue({ data: [mockQuote], error: null });

      const newQuote = {
        content: 'テスト引用',
        page: 1,
        memo: 'メモ',
        bookId: 'book1',
        tags: [{ id: 'tag1', name: 'タグ1', userId: 'user1', createdAt: '', updatedAt: '' }],
      };

      const result = await createQuote(newQuote);
      expect(result).toEqual(mockQuote);
      expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
        content: 'テスト引用',
        page: 1,
      }));
    });

    it('エラー時にnullを返す', async () => {
      const mockSupabase = supabase.from('quotes');
      (mockSupabase.insert as jest.Mock).mockResolvedValue({ data: null, error: new Error('エラー') });

      const result = await createQuote({
        content: 'テスト',
        bookId: 'book1',
      });
      expect(result).toBeNull();
    });
  });

  describe('getQuote', () => {
    it('IDで引用を取得できる', async () => {
      const mockSupabase = supabase.from('quotes');
      // @ts-ignore
      (mockSupabase.select as jest.Mock).mockReturnThis();
      // @ts-ignore
      (mockSupabase.eq as jest.Mock).mockReturnThis();
      // @ts-ignore
      (mockSupabase.single as jest.Mock).mockResolvedValue({ data: mockQuote, error: null });

      const result = await getQuote('1');
      expect(result).toEqual(mockQuote);
      expect(mockSupabase.select).toHaveBeenCalledWith('*, tags (*)');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
    });

    it('エラー時にnullを返す', async () => {
      const mockSupabase = supabase.from('quotes');
      // @ts-ignore
      (mockSupabase.select as jest.Mock).mockReturnThis();
      // @ts-ignore
      (mockSupabase.eq as jest.Mock).mockReturnThis();
      // @ts-ignore
      (mockSupabase.single as jest.Mock).mockResolvedValue({ data: null, error: new Error('エラー') });

      const result = await getQuote('999');
      expect(result).toBeNull();
    });
  });

  describe('updateQuote', () => {
    it('引用を更新できる', async () => {
      const mockSupabase = supabase.from('quotes');
      (mockSupabase.update as jest.Mock).mockReturnThis();
      (mockSupabase.eq as jest.Mock).mockResolvedValue({ data: [mockQuote], error: null });

      const updates = {
        content: '更新後の引用',
        page: 2,
      };

      const result = await updateQuote('1', updates);
      expect(result).toEqual(mockQuote);
      expect(mockSupabase.update).toHaveBeenCalledWith(updates);
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
    });

    it('エラー時にnullを返す', async () => {
      const mockSupabase = supabase.from('quotes');
      (mockSupabase.update as jest.Mock).mockReturnThis();
      (mockSupabase.eq as jest.Mock).mockResolvedValue({ data: null, error: new Error('エラー') });

      const result = await updateQuote('1', { content: 'テスト' });
      expect(result).toBeNull();
    });
  });

  describe('deleteQuote', () => {
    it('引用を削除できる', async () => {
      const mockSupabase = supabase.from('quotes');
      (mockSupabase.delete as jest.Mock).mockReturnThis();
      (mockSupabase.eq as jest.Mock).mockResolvedValue({ data: [mockQuote], error: null });

      const result = await deleteQuote('1');
      expect(result).toBe(true);
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
    });

    it('エラー時にfalseを返す', async () => {
      const mockSupabase = supabase.from('quotes');
      (mockSupabase.delete as jest.Mock).mockReturnThis();
      (mockSupabase.eq as jest.Mock).mockResolvedValue({ data: null, error: new Error('エラー') });

      const result = await deleteQuote('1');
      expect(result).toBe(false);
    });
  });

  describe('updateQuoteTags', () => {
    it('引用のタグを更新できる', async () => {
      const mockSupabase = supabase.from('quotes');
      (mockSupabase.update as jest.Mock).mockReturnThis();
      (mockSupabase.eq as jest.Mock).mockResolvedValue({ data: [{ ...mockQuote, tags: ['tag2'] }], error: null });

      const result = await updateQuoteTags('1', ['tag2']);
      expect(result).toEqual({ ...mockQuote, tags: ['tag2'] });
      expect(mockSupabase.update).toHaveBeenCalledWith({ tags: ['tag2'] });
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
    });

    it('エラー時にnullを返す', async () => {
      const mockSupabase = supabase.from('quotes');
      (mockSupabase.update as jest.Mock).mockReturnThis();
      (mockSupabase.eq as jest.Mock).mockResolvedValue({ data: null, error: new Error('エラー') });

      const result = await updateQuoteTags('1', ['tag2']);
      expect(result).toBeNull();
    });
  });

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
