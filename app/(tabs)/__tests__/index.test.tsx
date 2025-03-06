import React from 'react';
import { render, fireEvent } from '../../../test-utils';
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
  const React = require('react');
  const { View, Text, Pressable } = require('react-native');
  
  return {
    __esModule: true,
    default: jest.fn(({ books, onSelectBook, headerTitle }) => {
      return (
        <View testID="bookshelf-view">
          <Text>{headerTitle}</Text>
          {books.map((book) => (
            <Pressable
              key={book.id}
              testID={`book-item-${book.id}`}
              onPress={() => onSelectBook(book)}
            >
              <Text>{book.title}</Text>
            </Pressable>
          ))}
        </View>
      );
    })
  };
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
    
    fireEvent.press(getByTestId('book-item-1'));
    
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
