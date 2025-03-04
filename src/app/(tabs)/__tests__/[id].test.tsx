import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import BookDetailScreen from '../[id]';
import { useAuth } from '@/hooks/useAuth';
import { getBook, updateBook } from '@/lib/books';
import { createQuote, deleteQuote, updateQuote } from '@/lib/quotes';
import { BookWithQuotes, Quote } from '@/types/book';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/books', () => ({
  getBook: jest.fn(),
  updateBook: jest.fn(),
}));

jest.mock('@/lib/quotes', () => ({
  createQuote: jest.fn(),
  updateQuote: jest.fn(),
  deleteQuote: jest.fn(),
}));

const mockBook: BookWithQuotes = {
  id: '1',
  isbn: '9784167158057',
  title: '人間失格',
  author: '太宰治',
  publisher: '文藝春秋',
  publishedDate: '1948-01-01',
  description: '私は、その男の写真を三葉、見たことがある。',
  thumbnailUrl: 'https://example.com/image.jpg',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  userId: 'user1',
  quotes: [
    {
      id: 'quote1',
      bookId: '1',
      content: '恥の多い生涯を送って来ました。',
      page: 1,
      memo: '印象的な冒頭',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      userId: 'user1',
    },
  ],
};

describe('BookDetailScreen', () => {
  beforeEach(() => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '1' });
    (useAuth as jest.Mock).mockReturnValue({ user: { id: 'user1' } });
    (getBook as jest.Mock).mockResolvedValue(mockBook);
  });

  it('書籍の詳細情報が表示される', async () => {
    render(<BookDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText(mockBook.title)).toBeTruthy();
      expect(screen.getByText(mockBook.author)).toBeTruthy();
      expect(screen.getByText(mockBook.description!)).toBeTruthy();
    });
  });

  it('引用一覧が表示される', async () => {
    render(<BookDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText(mockBook.quotes![0].content)).toBeTruthy();
      expect(screen.getByText(`P.${mockBook.quotes![0].page}`)).toBeTruthy();
    });
  });

  it('引用を追加できる', async () => {
    const newQuote: Quote = {
      id: 'quote2',
      bookId: '1',
      content: '新しい引用',
      page: 2,
      memo: 'メモ',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      userId: 'user1',
    };
    (createQuote as jest.Mock).mockResolvedValue(newQuote);

    render(<BookDetailScreen />);

    fireEvent.press(screen.getByText('引用を追加'));
    fireEvent.changeText(screen.getByPlaceholderText('引用を入力'), newQuote.content);
    fireEvent.changeText(screen.getByPlaceholderText('ページ番号'), String(newQuote.page));
    fireEvent.changeText(screen.getByPlaceholderText('メモ'), newQuote.memo!);
    fireEvent.press(screen.getByText('保存'));

    await waitFor(() => {
      expect(createQuote).toHaveBeenCalledWith({
        bookId: '1',
        content: newQuote.content,
        page: newQuote.page,
        memo: newQuote.memo,
      });
    });
  });

  it('引用を編集できる', async () => {
    const updatedQuote = {
      ...mockBook.quotes![0],
      content: '編集された引用',
      memo: '編集されたメモ',
    };
    (updateQuote as jest.Mock).mockResolvedValue(updatedQuote);

    render(<BookDetailScreen />);

    fireEvent.press(screen.getByText('編集'));
    fireEvent.changeText(screen.getByDisplayValue(mockBook.quotes![0].content), updatedQuote.content);
    fireEvent.changeText(screen.getByDisplayValue(mockBook.quotes![0].memo!), updatedQuote.memo);
    fireEvent.press(screen.getByText('更新'));

    await waitFor(() => {
      expect(updateQuote).toHaveBeenCalledWith(mockBook.quotes![0].id, {
        content: updatedQuote.content,
        memo: updatedQuote.memo,
      });
    });
  });

  it('引用を削除できる', async () => {
    (deleteQuote as jest.Mock).mockResolvedValue(true);

    render(<BookDetailScreen />);

    fireEvent.press(screen.getByText('削除'));
    fireEvent.press(screen.getByText('確認'));

    await waitFor(() => {
      expect(deleteQuote).toHaveBeenCalledWith(mockBook.quotes![0].id);
    });
  });

  it('書籍情報を編集できる', async () => {
    const updatedBook = {
      ...mockBook,
      title: '人間失格（新版）',
      description: '更新された説明',
    };
    (updateBook as jest.Mock).mockResolvedValue(updatedBook);

    render(<BookDetailScreen />);

    fireEvent.press(screen.getByText('書籍情報を編集'));
    fireEvent.changeText(screen.getByDisplayValue(mockBook.title), updatedBook.title);
    fireEvent.changeText(screen.getByDisplayValue(mockBook.description!), updatedBook.description!);
    fireEvent.press(screen.getByText('更新'));

    await waitFor(() => {
      expect(updateBook).toHaveBeenCalledWith(mockBook.id, {
        title: updatedBook.title,
        description: updatedBook.description,
      });
    });
  });

  it('エラー時にエラーメッセージが表示される', async () => {
    const error = new Error('書籍の取得に失敗しました');
    (getBook as jest.Mock).mockRejectedValue(error);

    render(<BookDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText(error.message)).toBeTruthy();
    });
  });
});
