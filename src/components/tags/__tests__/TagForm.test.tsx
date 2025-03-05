import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TagForm } from '../TagForm';
import { View } from 'react-native';
import { Tag } from '@/types/tag';

jest.mock('@/hooks/useColorScheme');
jest.mock('@/components/ui/Dialog');

describe('TagForm', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  const mockTag: Tag = {
    id: '1',
    name: 'テストタグ',
    createdAt: '2024-03-05T00:00:00Z',
    updatedAt: '2024-03-05T00:00:00Z',
    userId: 'user1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly in create mode', () => {
    const { getByPlaceholderText, queryByDisplayValue } = render(
      <TagForm visible onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    expect(getByPlaceholderText('タグ名')).toBeTruthy();
    expect(queryByDisplayValue('テストタグ')).toBeNull();
  });

  it('renders correctly in edit mode', () => {
    const { getByDisplayValue } = render(
      <TagForm
        visible
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        tag={mockTag}
      />
    );

    expect(getByDisplayValue('テストタグ')).toBeTruthy();
  });

  it('handles submit correctly', () => {
    const { getByPlaceholderText, getByText } = render(
      <TagForm visible onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const input = getByPlaceholderText('タグ名');
    fireEvent.changeText(input, 'テストタグ');

    const submitButton = getByText('作成');
    fireEvent.press(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith('テストタグ');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles close correctly', () => {
    const { getByText } = render(
      <TagForm visible onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const cancelButton = getByText('キャンセル');
    fireEvent.press(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('validates input before submit', () => {
    const { getByText } = render(
      <TagForm visible onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const submitButton = getByText('作成');
    fireEvent.press(submitButton);

    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('does not render when not visible', () => {
    const { queryByTestId } = render(
      <TagForm visible={false} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    expect(queryByTestId('dialog')).toBeNull();
  });
});
