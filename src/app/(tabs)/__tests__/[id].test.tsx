import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import BookDetailPage from '../[id]';
import { useColorScheme } from '@/hooks/useColorScheme';

// モック設定
jest.mock('expo-router');
jest.mock('@tanstack/react-query');
jest.mock('@/hooks/useColorScheme');

const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<typeof useLocalSearchParams>;
const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
const mockUseColorScheme = useColorScheme as jest.MockedFunction<typeof useColorScheme>;

describe('BookDetailPage', () => {
  const mockBook = {
    id: '1',
    title: 'テスト書籍',
    author: 'テスト著者',
    isbn: '9784000000000',
    coverUrl: 'https://example.com/cover.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  beforeEach(() => {
    mockUseLocalSearchParams.mockReturnValue({ id: '1' });
    mockUseQuery.mockReturnValue({
      data: mockBook,
      isLoading: false,
      error: null
    } as any);
    mockUseColorScheme.mockReturnValue('light');
  });

  it('ローディング状態を表示する', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: true,
      error: null
    } as any);

    const { getByTestId } = render(<BookDetailPage />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('エラー状態を表示する', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch book')
    } as any);

    const { getByText } = render(<BookDetailPage />);
    expect(getByText('エラーが発生しました')).toBeTruthy();
  });

  it('書籍情報を表示する', () => {
    const { getByText } = render(<BookDetailPage />);
    expect(getByText(mockBook.title)).toBeTruthy();
    expect(getByText(mockBook.author)).toBeTruthy();
    expect(getByText(mockBook.isbn)).toBeTruthy();
  });

  it('ヘッダー画像を表示する', () => {
    const { getByTestId } = render(<BookDetailPage />);
    const headerImage = getByTestId('book-cover-image');
    expect(headerImage.props.source.uri).toBe(mockBook.coverUrl);
  });

  it('引用を追加するボタンを表示する', () => {
    const { getByText } = render(<BookDetailPage />);
    expect(getByText('引用を追加')).toBeTruthy();
  });

  it('引用一覧を表示する', () => {
    const mockQuotes = [
      { id: '1', text: 'テスト引用1', page: 1 },
      { id: '2', text: 'テスト引用2', page: 2 }
    ];

    mockUseQuery.mockReturnValue({
      data: { ...mockBook, quotes: mockQuotes },
      isLoading: false,
      error: null
    } as any);

    const { getByText } = render(<BookDetailPage />);
    expect(getByText('テスト引用1')).toBeTruthy();
    expect(getByText('テスト引用2')).toBeTruthy();
  });
});
