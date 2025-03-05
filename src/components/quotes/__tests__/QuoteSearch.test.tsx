import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QuoteSearch } from '../QuoteSearch';
import { searchQuotes } from '@/lib/quotes';
import { useQuery } from '@tanstack/react-query';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('@/lib/quotes', () => ({
  searchQuotes: jest.fn(),
}));

const mockSearchQuotes = searchQuotes as jest.Mock;
const mockUseQuery = useQuery as jest.Mock;

describe('QuoteSearch', () => {
  const mockQuotes = [
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
    mockUseQuery.mockImplementation(() => ({
      data: mockQuotes,
      isLoading: false,
      error: null,
    }));
  });

  it('検索フォームが表示される', () => {
    const { getByTestId } = render(<QuoteSearch />);
    expect(getByTestId('quote-search-input')).toBeTruthy();
  });

  it('タグフィルターが表示される', () => {
    const { getByTestId } = render(<QuoteSearch />);
    expect(getByTestId('tag-filter')).toBeTruthy();
  });

  it('引用一覧が表示される', () => {
    const { getByTestId } = render(<QuoteSearch />);
    expect(getByTestId('quote-list')).toBeTruthy();
  });

  it('検索結果が表示される', async () => {
    mockSearchQuotes.mockResolvedValueOnce(mockQuotes);
    
    const { getByTestId, getByText } = render(<QuoteSearch />);
    const searchInput = getByTestId('quote-search-input');
    
    fireEvent.changeText(searchInput, 'テスト');
    
    await waitFor(() => {
      expect(mockSearchQuotes).toHaveBeenCalledWith(expect.objectContaining({
        query: 'テスト',
      }));
      expect(getByText('テスト引用1')).toBeTruthy();
      expect(getByText('テスト引用2')).toBeTruthy();
    });
  });

  it('タグフィルターで絞り込みができる', async () => {
    mockSearchQuotes.mockResolvedValueOnce([mockQuotes[0]]);
    
    const { getByTestId, getByText } = render(<QuoteSearch />);
    const tagFilter = getByTestId('tag-filter');
    
    fireEvent.press(tagFilter);
    fireEvent.press(getByText('タグ1')); // タグを選択
    
    await waitFor(() => {
      expect(mockSearchQuotes).toHaveBeenCalledWith(expect.objectContaining({
        tagIds: ['tag1'],
      }));
      expect(getByText('テスト引用1')).toBeTruthy();
      expect(() => getByText('テスト引用2')).toThrow();
    });
  });

  it('ローディング状態が表示される', () => {
    mockUseQuery.mockImplementation(() => ({
      data: null,
      isLoading: true,
      error: null,
    }));

    const { getByTestId } = render(<QuoteSearch />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('エラー状態が表示される', () => {
    mockUseQuery.mockImplementation(() => ({
      data: null,
      isLoading: false,
      error: new Error('テストエラー'),
    }));

    const { getByTestId } = render(<QuoteSearch />);
    expect(getByTestId('error-message')).toBeTruthy();
  });

  it('スクロール時に追加データが読み込まれる', async () => {
    const { getByTestId } = render(<QuoteSearch />);
    const quoteList = getByTestId('quote-list');
    
    fireEvent.scroll(quoteList, {
      nativeEvent: {
        contentOffset: { y: 500 },
        contentSize: { height: 1000 },
        layoutMeasurement: { height: 100 },
      },
    });

    await waitFor(() => {
      expect(mockSearchQuotes).toHaveBeenCalledWith(expect.objectContaining({
        offset: 20,
        limit: 20,
      }));
    });
  });
});
