import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BookItem from '../BookItem';

// モックデータ
const mockBook = {
  id: '1',
  title: 'テスト本',
  author: 'テスト著者',
  coverImage: 'https://example.com/testcover.jpg',
};

// テストのためのモックフック
jest.mock('../../hooks/useThemeColor', () => ({
  useThemeColor: () => '#000000',
}));

// onPressハンドラのモック
const mockOnPress = jest.fn();

describe('BookItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('正しくレンダリングされること', () => {
    const { getByText } = render(
      <BookItem book={mockBook} onPress={mockOnPress} />
    );
    
    expect(getByText('テスト本')).toBeTruthy();
    expect(getByText('テスト著者')).toBeTruthy();
  });

  it('タップするとonPress関数が呼ばれること', () => {
    const { getByText } = render(
      <BookItem book={mockBook} onPress={mockOnPress} />
    );
    
    // タイトルテキストを含むコンポーネントの親（TouchableOpacity）をタップ
    const titleElement = getByText('テスト本');
    const touchableParent = titleElement.parent.parent.parent; // Text -> View -> TouchableOpacity
    
    fireEvent.press(touchableParent);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
    expect(mockOnPress).toHaveBeenCalledWith(mockBook);
  });

  it('画像のソースが正しいこと', () => {
    const { UNSAFE_getByType } = render(
      <BookItem book={mockBook} onPress={mockOnPress} />
    );
    
    const image = UNSAFE_getByType('Image');
    expect(image.props.source).toEqual({ uri: 'https://example.com/testcover.jpg' });
  });

  it('タイトルと著者のテキスト制限が正しく設定されていること', () => {
    const { getByText } = render(
      <BookItem book={mockBook} onPress={mockOnPress} />
    );
    
    const titleElement = getByText('テスト本');
    const authorElement = getByText('テスト著者');
    
    expect(titleElement.props.numberOfLines).toBe(2);
    expect(authorElement.props.numberOfLines).toBe(1);
  });
});
