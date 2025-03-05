import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QuoteSearch } from '@/components/quotes/QuoteSearch';
import { searchQuotes } from '@/lib/quotes';
import { getAllTags } from '@/lib/tags';
import { useQuery } from '@tanstack/react-query';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('@/lib/quotes', () => ({
  searchQuotes: jest.fn(),
}));

jest.mock('@/lib/tags', () => ({
  getAllTags: jest.fn(),
}));

const mockSearchQuotes = searchQuotes as jest.Mock;
const mockGetAllTags = getAllTags as jest.Mock;
const mockUseQuery = useQuery as jest.Mock;

describe('QuoteSearch', () => {
  const mockTags = [
    { id: 'tag1', name: 'タグ1', userId: 'user1', createdAt: '', updatedAt: '' },
    { id: 'tag2', name: 'タグ2', userId: 'user1', createdAt: '', updatedAt: '' },
  ];

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
    mockUseQuery.mockImplementation(({ queryKey }) => {
      if (queryKey[0] === 'tags') {
        return {
          data: mockTags,
          isLoading: false,
          error: null,
        };
      }
      return {
        data: mockQuotes,
        isLoading: false,
        error: null,
      };
    });
    mockGetAllTags.mockResolvedValue(mockTags);
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
    const filteredQuotes = [mockQuotes[0]];
    mockUseQuery.mockImplementation(({ queryKey }) => {
      if (queryKey[0] === 'tags') {
        return {
          data: mockTags,
          isLoading: false,
          error: null,
        };
      }
      if (queryKey[2]?.includes('tag1')) {
        return {
          data: filteredQuotes,
          isLoading: false,
          error: null,
        };
      }
      return {
        data: mockQuotes,
        isLoading: false,
        error: null,
      };
    });
    
    const { getByTestId, getAllByText, queryByText } = render(<QuoteSearch />);
    const tagFilter = getByTestId('tag-filter');
    
    fireEvent.press(tagFilter);

    // ダイアログ内のタグをクリック
    const tagButtons = getAllByText('タグ1');
    fireEvent.press(tagButtons[0]);
    
    await waitFor(() => {
      expect(getByTestId('quote-item-1')).toBeTruthy();
      expect(queryByText('テスト引用2')).toBeNull();
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
