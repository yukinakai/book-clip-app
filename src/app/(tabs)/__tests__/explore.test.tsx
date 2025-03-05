import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import ExploreScreen from '../explore';
import { User } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/useAuth';
import { getAllTags, createTag, updateTag, deleteTag } from '@/lib/tags';
import { searchQuotes } from '@/lib/quotes';

jest.mock('@/hooks/useAuth');
jest.mock('@/lib/tags');
jest.mock('@/lib/quotes');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockGetAllTags = getAllTags as jest.MockedFunction<typeof getAllTags>;
const mockCreateTag = createTag as jest.MockedFunction<typeof createTag>;
const mockUpdateTag = updateTag as jest.MockedFunction<typeof updateTag>;
const mockDeleteTag = deleteTag as jest.MockedFunction<typeof deleteTag>;
const mockSearchQuotes = searchQuotes as jest.MockedFunction<typeof searchQuotes>;

const now = new Date().toISOString();

const mockTags = [
  { id: '1', name: 'タグ1', userId: 'user1', createdAt: now, updatedAt: now },
  { id: '2', name: 'タグ2', userId: 'user1', createdAt: now, updatedAt: now },
];

const mockQuotes = [
  {
    id: '1',
    content: '引用1',
    bookId: 'book1',
    userId: 'user1',
    page: 1,
    memo: 'メモ1',
    tags: [mockTags[0]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '2',
    content: '引用2',
    bookId: 'book1',
    userId: 'user1',
    page: 2,
    memo: 'メモ2',
    tags: [mockTags[1]],
    createdAt: now,
    updatedAt: now,
  },
];

describe('ExploreScreen', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user1',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: now,
      } as User,
      isAuthenticated: true,
      signOut: jest.fn(),
    });
    mockGetAllTags.mockResolvedValue(mockTags);
    mockSearchQuotes.mockResolvedValue(mockQuotes);
  });

  it('タグ一覧を表示する', async () => {
    render(<ExploreScreen />);

    await waitFor(() => {
      expect(screen.getByText('タグ1')).toBeTruthy();
      expect(screen.getByText('タグ2')).toBeTruthy();
    });
  });

  it('新しいタグを作成する', async () => {
    mockCreateTag.mockResolvedValueOnce({
      id: '3',
      name: '新しいタグ',
      userId: 'user1',
      createdAt: now,
      updatedAt: now,
    });
    
    render(<ExploreScreen />);

    fireEvent.press(screen.getByTestId('add-tag-button'));
    fireEvent.changeText(screen.getByTestId('tag-form-input'), '新しいタグ');
    fireEvent.press(screen.getByTestId('tag-form-submit'));

    await waitFor(() => {
      expect(mockCreateTag).toHaveBeenCalledWith('新しいタグ');
      expect(mockGetAllTags).toHaveBeenCalled();
    });
  });

  it('タグを編集する', async () => {
    render(<ExploreScreen />);

    await waitFor(() => {
      fireEvent.press(screen.getByTestId('edit-tag-1'));
    });

    fireEvent.changeText(screen.getByTestId('tag-form-input'), '更新されたタグ');
    fireEvent.press(screen.getByTestId('tag-form-submit'));

    await waitFor(() => {
      expect(mockUpdateTag).toHaveBeenCalledWith('1', '更新されたタグ');
      expect(mockGetAllTags).toHaveBeenCalled();
    });
  });

  it('タグを削除する', async () => {
    render(<ExploreScreen />);

    await waitFor(() => {
      fireEvent.press(screen.getByTestId('delete-tag-1'));
    });

    fireEvent.press(screen.getByTestId('delete-confirm-button'));

    await waitFor(() => {
      expect(mockDeleteTag).toHaveBeenCalledWith('1');
      expect(mockGetAllTags).toHaveBeenCalled();
    });
  });

  it('引用を検索する', async () => {
    render(<ExploreScreen />);

    fireEvent.changeText(screen.getByTestId('quote-search-input'), '引用');

    await waitFor(() => {
      expect(mockSearchQuotes).toHaveBeenCalledWith({
        query: '引用',
        tagIds: [],
        limit: 20,
        offset: 0,
        orderBy: 'createdAt',
        ascending: false,
      });
      expect(screen.getByText('引用1')).toBeTruthy();
      expect(screen.getByText('引用2')).toBeTruthy();
    });
  });

  it('タグで引用を絞り込む', async () => {
    render(<ExploreScreen />);

    fireEvent.press(screen.getByTestId('tag-filter'));
    fireEvent.press(screen.getByText('タグ1'));

    await waitFor(() => {
      expect(mockSearchQuotes).toHaveBeenCalledWith({
        query: '',
        tagIds: ['1'],
        limit: 20,
        offset: 0,
        orderBy: 'createdAt',
        ascending: false,
      });
      expect(screen.getByText('引用1')).toBeTruthy();
      expect(screen.queryByText('引用2')).toBeNull();
    });
  });
});
