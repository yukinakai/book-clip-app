import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { QuoteForm } from '../QuoteForm';
import { Tag } from '@/types/tag';

describe('QuoteForm', () => {
  const mockTags: Tag[] = [
    { id: '1', name: 'タグ1', userId: 'user1', createdAt: '', updatedAt: '' },
    { id: '2', name: 'タグ2', userId: 'user1', createdAt: '', updatedAt: '' },
  ];

  const mockOnSubmit = jest.fn();
  const mockOnClose = jest.fn();

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
    availableTags: mockTags,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('フォームが表示されること', () => {
    const { getByTestId } = render(<QuoteForm {...defaultProps} />);
    expect(getByTestId('quote-form-dialog')).toBeTruthy();
  });

  it('必須項目が空の場合、送信ボタンが無効になること', () => {
    const { getByTestId } = render(<QuoteForm {...defaultProps} />);
    const submitButton = getByTestId('submit-button');
    
    expect(submitButton.props.accessibilityState.disabled).toBe(true);
  });

  it('必須項目が入力された場合、送信ボタンが有効になること', () => {
    const { getByTestId } = render(<QuoteForm {...defaultProps} />);
    
    const contentInput = getByTestId('content-input');
    fireEvent.changeText(contentInput, 'テスト引用');

    const submitButton = getByTestId('submit-button');
    expect(submitButton.props.accessibilityState.disabled).toBe(false);
  });

  it('フォーム送信時に正しい値が渡されること', () => {
    const { getByTestId } = render(<QuoteForm {...defaultProps} />);
    
    // 必須項目の入力
    const contentInput = getByTestId('content-input');
    fireEvent.changeText(contentInput, 'テスト引用');

    // オプション項目の入力
    const pageInput = getByTestId('page-input');
    fireEvent.changeText(pageInput, '42');

    const memoInput = getByTestId('memo-input');
    fireEvent.changeText(memoInput, 'メモ');

    // タグの選択
    const tagSelect = getByTestId('tag-select');
    fireEvent.press(tagSelect);
    const tag1 = getByTestId('tag-1');
    fireEvent.press(tag1);

    // フォームの送信
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      content: 'テスト引用',
      page: 42,
      memo: 'メモ',
      tags: ['1'],
    });
  });

  it('キャンセルボタンを押すとonCloseが呼ばれること', () => {
    const { getByTestId } = render(<QuoteForm {...defaultProps} />);
    
    const cancelButton = getByTestId('cancel-button');
    fireEvent.press(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('編集モードで既存の値が表示されること', () => {
    const quote = {
      content: '既存の引用',
      page: 42,
      memo: '既存のメモ',
      tags: ['1'],
    };

    const { getByTestId } = render(
      <QuoteForm {...defaultProps} initialValues={quote} />
    );

    expect(getByTestId('content-input').props.value).toBe('既存の引用');
    expect(getByTestId('page-input').props.value).toBe('42');
    expect(getByTestId('memo-input').props.value).toBe('既存のメモ');
    
    // 選択されているタグの確認
    const selectedTag = getByTestId('selected-tag-1');
    expect(selectedTag).toBeTruthy();
  });
});
