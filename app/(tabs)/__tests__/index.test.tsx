import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../index';
import { MOCK_BOOKS } from '../../../constants/MockData';
import BookshelfView from '../../../components/BookshelfView';

// モックの設定
jest.mock('../../../constants/MockData', () => ({
  MOCK_BOOKS: [
    {
      id: '1',
      title: 'Test Book 1',
      author: 'Test Author 1',
      coverImage: 'https://example.com/cover1.jpg',
    },
    {
      id: '2',
      title: 'Test Book 2',
      author: 'Test Author 2',
      coverImage: 'https://example.com/cover2.jpg',
    },
  ],
}));

// BookshelfViewコンポーネントのモック
jest.mock('../../../components/BookshelfView', () => {
  return jest.fn(({ books, onSelectBook, headerTitle }) => {
    return (
      <div data-testid="bookshelf-view">
        <h1>{headerTitle}</h1>
        {books.map((book) => (
          <button
            key={book.id}
            data-testid={`book-item-${book.id}`}
            onClick={() => onSelectBook(book)}
          >
            {book.title}
          </button>
        ))}
      </div>
    );
  });
});

// コンソールログのモック
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('HomeScreen', () => {
  beforeEach(() => {
    // テスト前に各モックをリセット
    jest.clearAllMocks();
  });

  it('BookshelfViewに適切なプロパティが渡されること', () => {
    render(<HomeScreen />);
    
    expect(BookshelfView).toHaveBeenCalledWith(
      expect.objectContaining({
        books: MOCK_BOOKS,
        headerTitle: 'マイライブラリ',
        onSelectBook: expect.any(Function),
      }),
      {}
    );
  });

  it('本を選択するとコンソールログが表示されること', () => {
    const { getByTestId } = render(<HomeScreen />);
    
    fireEvent.click(getByTestId('book-item-1'));
    
    expect(mockConsoleLog).toHaveBeenCalledWith('Selected book:', 'Test Book 1');
  });

  it('すべてのモック書籍が表示されること', () => {
    const { getByTestId } = render(<HomeScreen />);
    
    expect(getByTestId('book-item-1')).toBeTruthy();
    expect(getByTestId('book-item-2')).toBeTruthy();
  });

  it('ヘッダータイトルが正しく表示されること', () => {
    const { getByText } = render(<HomeScreen />);
    
    expect(getByText('マイライブラリ')).toBeTruthy();
  });
});
