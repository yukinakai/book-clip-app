import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { createTag, updateTag, deleteTag, getAllTags, getTagsByQuoteId, addTagToQuote, removeTagFromQuote } from '../tags';
import { supabase } from '../supabase';

// モック関数を提供するヘルパー
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockSingle = jest.fn();
const mockReturns = jest.fn();

// Supabaseクライアントのモック
jest.mock('../supabase', () => ({
  supabase: {
    from: mockFrom,
  },
}));

beforeEach(() => {
  jest.clearAllMocks();

  // デフォルトのチェーンメソッドを設定
  mockFrom.mockReturnValue({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    eq: mockEq,
  });

  mockSelect.mockReturnValue({ eq: mockEq, order: mockOrder, single: mockSingle });
  mockInsert.mockReturnValue({ select: mockSelect });
  mockUpdate.mockReturnValue({ eq: mockEq });
  mockDelete.mockReturnValue({ eq: mockEq });
  mockEq.mockReturnValue({ select: mockSelect, eq: mockEq, returns: mockReturns });
  mockOrder.mockReturnValue(Promise.resolve({ data: [], error: null }));
  mockSingle.mockReturnValue(Promise.resolve({ data: null, error: null }));
  mockReturns.mockReturnValue(Promise.resolve({ data: [], error: null }));
});

const mockTag = {
  id: '1',
  name: 'テストタグ',
  createdAt: '2025-03-05T00:00:00.000Z',
  updatedAt: '2025-03-05T00:00:00.000Z',
  userId: 'test-user-id',
};

describe('tags.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTag', () => {
    test('タグの作成が成功する', async () => {
      const mockSinglePromise = Promise.resolve({ data: mockTag, error: null });
      mockSingle.mockReturnValueOnce(mockSinglePromise);

      const result = await createTag('テストタグ');
      expect(result).toEqual(mockTag);
    });

    test('タグの作成が失敗する', async () => {
      const mockSinglePromise = Promise.resolve({ data: null, error: new Error('エラー') });
      mockSingle.mockReturnValueOnce(mockSinglePromise);

      const result = await createTag('テストタグ');
      expect(result).toBeNull();
    });
  });

  describe('updateTag', () => {
    test('タグの更新が成功する', async () => {
      const mockSinglePromise = Promise.resolve({ data: mockTag, error: null });
      mockSingle.mockReturnValueOnce(mockSinglePromise);

      const result = await updateTag('1', '更新タグ');
      expect(result).toEqual(mockTag);
    });

    test('タグの更新が失敗する', async () => {
      const mockSinglePromise = Promise.resolve({ data: null, error: new Error('エラー') });
      mockSingle.mockReturnValueOnce(mockSinglePromise);

      const result = await updateTag('1', '更新タグ');
      expect(result).toBeNull();
    });
  });

  describe('deleteTag', () => {
    test('タグの削除が成功する', async () => {
      const mockDeletePromise = Promise.resolve({ error: null });
      mockEq.mockReturnValueOnce(mockDeletePromise);

      const result = await deleteTag('1');
      expect(result).toBe(true);
    });

    test('タグの削除が失敗する', async () => {
      const mockDeletePromise = Promise.resolve({ error: new Error('エラー') });
      mockEq.mockReturnValueOnce(mockDeletePromise);

      const result = await deleteTag('1');
      expect(result).toBe(false);
    });
  });

  describe('getAllTags', () => {
    test('全タグの取得が成功する', async () => {
      const mockOrderPromise = Promise.resolve({ data: [mockTag], error: null });
      mockOrder.mockReturnValueOnce(mockOrderPromise);

      const result = await getAllTags();
      expect(result).toEqual([mockTag]);
    });

    test('全タグの取得が失敗する', async () => {
      const mockOrderPromise = Promise.resolve({ data: null, error: new Error('エラー') });
      mockOrder.mockReturnValueOnce(mockOrderPromise);

      const result = await getAllTags();
      expect(result).toEqual([]);
    });
  });

  describe('getTagsByQuoteId', () => {
    test('引用のタグ取得が成功する', async () => {
      const mockReturnPromise = Promise.resolve({
        data: [{ tags: mockTag }],
        error: null,
      });
      mockReturns.mockReturnValueOnce(mockReturnPromise);

      const result = await getTagsByQuoteId('1');
      expect(result).toEqual([
        {
          id: mockTag.id,
          name: mockTag.name,
          createdAt: mockTag.createdAt,
          updatedAt: mockTag.updatedAt,
          userId: mockTag.userId,
        },
      ]);
    });

    test('引用のタグ取得が失敗する', async () => {
      const mockReturnPromise = Promise.resolve({ data: null, error: new Error('エラー') });
      mockReturns.mockReturnValueOnce(mockReturnPromise);

      const result = await getTagsByQuoteId('1');
      expect(result).toEqual([]);
    });
  });

  describe('addTagToQuote', () => {
    test('引用へのタグ追加が成功する', async () => {
      const mockInsertPromise = Promise.resolve({ error: null });
      mockInsert.mockReturnValueOnce(mockInsertPromise);

      const result = await addTagToQuote('1', '1');
      expect(result).toBe(true);
    });

    test('引用へのタグ追加が失敗する', async () => {
      const mockInsertPromise = Promise.resolve({ error: new Error('エラー') });
      mockInsert.mockReturnValueOnce(mockInsertPromise);

      const result = await addTagToQuote('1', '1');
      expect(result).toBe(false);
    });
  });

  describe('removeTagFromQuote', () => {
    let mockInnerEq: jest.Mock;

    beforeEach(() => {
      mockInnerEq = jest.fn();
      const mockFirstEq = jest.fn().mockReturnValue({
        eq: mockInnerEq,
      });
      mockDelete.mockReturnValue({
        eq: mockFirstEq,
      });
    });

    test('引用からのタグ削除が成功する', async () => {
      mockInnerEq.mockImplementation((): any => Promise.resolve({ error: null }));

      const result = await removeTagFromQuote('1', '1');
      expect(result).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith('quote_tags');
    });

    test('引用からのタグ削除が失敗する', async () => {
      mockInnerEq.mockImplementation((): any => Promise.resolve({ error: new Error('エラー') }));

      const result = await removeTagFromQuote('1', '1');
      expect(result).toBe(false);
      expect(mockFrom).toHaveBeenCalledWith('quote_tags');
    });
  });
});
