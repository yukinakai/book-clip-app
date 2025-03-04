import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BookDetailPage from '../[id]';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/hooks/useAuth';

// モック設定
jest.mock('expo-router', () => require('@/__mocks__/expo-router'));
jest.mock('@tanstack/react-query', () => require('@/__mocks__/@tanstack/react-query'));
jest.mock('@/hooks/useColorScheme');
jest.mock('@/hooks/useAuth');

const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<typeof useLocalSearchParams>;
const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
const mockUseColorScheme = useColorScheme as jest.MockedFunction<typeof useColorScheme>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockQueryClient = {
  invalidateQueries: jest.fn(),
};

describe('BookDetailPage', () => {
  const mockBook = {
    id: '1',
    title: 'テスト書籍',
    author: 'テスト著者',
    publisher: 'テスト出版社',
    description: 'テストの説明',
    thumbnailUrl: 'https://example.com/cover.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    quotes: []
  };

  beforeEach(() => {
    mockUseLocalSearchParams.mockReturnValue({ id: '1' });
    mockUseQuery.mockReturnValue({
      data: mockBook,
      isLoading: false,
      error: null
    } as any);
    mockUseColorScheme.mockReturnValue('light');
    mockUseAuth.mockReturnValue({
      user: {
        id: 'test-user-id',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2025-03-05T00:00:00.000Z',
        email: 'test@example.com',
        phone: '',
        role: '',
        updated_at: '2025-03-05T00:00:00.000Z'
      },
      isAuthenticated: true,
      signOut: jest.fn(),
    });
    (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
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
    expect(getByText('Failed to fetch book')).toBeTruthy();
  });

  it('書籍情報を表示する', () => {
    const { getByText } = render(<BookDetailPage />);
    expect(getByText(mockBook.title)).toBeTruthy();
    expect(getByText(mockBook.author)).toBeTruthy();
    expect(getByText(`出版社: ${mockBook.publisher}`)).toBeTruthy();
    expect(getByText(mockBook.description)).toBeTruthy();
  });

  it('ユーザーや書籍データが存在しない場合のエラーを表示する', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      signOut: jest.fn(),
    });

    const { getByText } = render(<BookDetailPage />);
    expect(getByText('書籍が見つかりませんでした')).toBeTruthy();
  });

  it('引用を追加するアイコンを表示する', () => {
    const { getByTestId } = render(<BookDetailPage />);
    expect(getByTestId('icon-symbol-add')).toBeTruthy();
  });

  it('引用一覧を表示する', () => {
    const mockQuotes = [
      {
        id: '1',
        content: 'テスト引用1',
        page: 1,
        memo: 'メモ1',
        tags: [],
        bookId: '1',
        userId: 'test-user-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        content: 'テスト引用2',
        page: 2,
        memo: 'メモ2',
        tags: [],
        bookId: '1',
        userId: 'test-user-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    mockUseQuery.mockReturnValue({
      data: { ...mockBook, quotes: mockQuotes },
      isLoading: false,
      error: null
    } as any);

    const { getByText } = render(<BookDetailPage />);
    expect(getByText(mockQuotes[0].content)).toBeTruthy();
    expect(getByText(`P.${mockQuotes[0].page}`)).toBeTruthy();
    expect(getByText(mockQuotes[0].memo!)).toBeTruthy();
    expect(getByText(mockQuotes[1].content)).toBeTruthy();
    expect(getByText(`P.${mockQuotes[1].page}`)).toBeTruthy();
    expect(getByText(mockQuotes[1].memo!)).toBeTruthy();
  });

  it('引用を編集できる', () => {
    const mockQuote = {
      id: '1',
      content: 'テスト引用1',
      page: 1,
      memo: 'メモ1',
      tags: [],
      bookId: '1',
      userId: 'test-user-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockUseQuery.mockReturnValue({
      data: { ...mockBook, quotes: [mockQuote] },
      isLoading: false,
      error: null
    } as any);

    const { getByTestId, getByText } = render(<BookDetailPage />);

    // 編集ボタンをクリック
    fireEvent.press(getByTestId('icon-symbol-pencil'));

    // ダイアログが表示される
    expect(getByText('引用を編集')).toBeTruthy();
  });

  it('引用を削除できる', () => {
    const mockQuote = {
      id: '1',
      content: 'テスト引用1',
      page: 1,
      memo: 'メモ1',
      tags: [],
      bookId: '1',
      userId: 'test-user-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockUseQuery.mockReturnValue({
      data: { ...mockBook, quotes: [mockQuote] },
      isLoading: false,
      error: null
    } as any);

    const { getByTestId, getByText } = render(<BookDetailPage />);

    // 削除ボタンをクリック
    fireEvent.press(getByTestId('icon-symbol-trash'));

    // 確認ダイアログが表示される
    expect(getByText('この引用を削除してもよろしいですか？')).toBeTruthy();
  });

  it('書籍情報を編集できる', () => {
    const { getByTestId, getByText } = render(<BookDetailPage />);

    // 編集ボタンをクリック
    fireEvent.press(getByTestId('icon-symbol-pencil'));

    // ダイアログが表示される
    expect(getByText('書籍情報を編集')).toBeTruthy();
  });
});
