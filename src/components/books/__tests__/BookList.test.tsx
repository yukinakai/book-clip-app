import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BookList } from '../BookList';
import { Book } from '@/types/book';

describe('BookList', () => {
  const mockBooks: Book[] = [
    {
      id: '1',
      title: 'テスト本1',
      author: 'テスト著者1',
      thumbnailUrl: 'https://example.com/thumbnail1.jpg',
      isbn: '1234567890123',
      publisher: 'テスト出版社1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'test-user-1'
    },
    {
      id: '2',
      title: 'テスト本2',
      author: 'テスト著者2',
      thumbnailUrl: 'https://example.com/thumbnail2.jpg',
      isbn: '1234567890124',
      publisher: 'テスト出版社2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'test-user-1'
    }
  ];

  const mockOnBookPress = jest.fn();
  const mockOnDeletePress = jest.fn();
  const mockOnAddPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('書籍一覧を正しく表示する', () => {
    const { getByText } = render(
      <BookList
        books={mockBooks}
        onBookPress={mockOnBookPress}
        onDeletePress={mockOnDeletePress}
        onAddPress={mockOnAddPress}
      />
    );

    expect(getByText('テスト本1')).toBeTruthy();
    expect(getByText('テスト著者1')).toBeTruthy();
    expect(getByText('テスト本2')).toBeTruthy();
    expect(getByText('テスト著者2')).toBeTruthy();
  });

  it('空の状態を正しく表示する', () => {
    const { getByText } = render(
      <BookList
        books={[]}
        onBookPress={mockOnBookPress}
        onDeletePress={mockOnDeletePress}
        onAddPress={mockOnAddPress}
      />
    );

    expect(getByText('登録されている書籍はありません')).toBeTruthy();
  });

  it('書籍をタップした時にonBookPressが呼ばれる', () => {
    const { getByText } = render(
      <BookList
        books={mockBooks}
        onBookPress={mockOnBookPress}
        onDeletePress={mockOnDeletePress}
        onAddPress={mockOnAddPress}
      />
    );

    fireEvent.press(getByText('テスト本1'));
    expect(mockOnBookPress).toHaveBeenCalledWith(mockBooks[0]);
  });

  it('削除ボタンをタップした時にonDeletePressが呼ばれる', () => {
    const { getAllByLabelText } = render(
      <BookList
        books={mockBooks}
        onBookPress={mockOnBookPress}
        onDeletePress={mockOnDeletePress}
        onAddPress={mockOnAddPress}
      />
    );

    fireEvent.press(getAllByLabelText('削除')[0]);
    expect(mockOnDeletePress).toHaveBeenCalledWith(mockBooks[0].id);
  });

  it('追加ボタンをタップした時にonAddPressが呼ばれる', () => {
    const { getByLabelText } = render(
      <BookList
        books={mockBooks}
        onBookPress={mockOnBookPress}
        onDeletePress={mockOnDeletePress}
        onAddPress={mockOnAddPress}
      />
    );

    fireEvent.press(getByLabelText('追加'));
    expect(mockOnAddPress).toHaveBeenCalled();
  });

  it('空の状態でも追加ボタンが表示される', () => {
    const { getByLabelText } = render(
      <BookList
        books={[]}
        onBookPress={mockOnBookPress}
        onDeletePress={mockOnDeletePress}
        onAddPress={mockOnAddPress}
      />
    );

    expect(getByLabelText('追加')).toBeTruthy();
  });
});
