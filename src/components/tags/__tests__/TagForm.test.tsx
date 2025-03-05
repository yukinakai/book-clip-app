import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TagForm } from '../TagForm';
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
    const { getByTestId } = render(
      <TagForm visible onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const input = getByTestId('tag-name-input');
    expect(input.props.placeholder).toBe('タグの名前を入力');
    expect(input.props.value).toBe('');
  });

  it('renders correctly in edit mode', () => {
    const { getByTestId } = render(
      <TagForm
        visible
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        tag={mockTag}
      />
    );

    const input = getByTestId('tag-name-input');
    expect(input.props.value).toBe('テストタグ');
  });

  it('handles submit correctly', () => {
    const { getByTestId } = render(
      <TagForm visible onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const input = getByTestId('tag-name-input');
    fireEvent.changeText(input, 'テストタグ');

    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith('テストタグ');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles close correctly', () => {
    const { getByTestId } = render(
      <TagForm visible onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const cancelButton = getByTestId('cancel-button');
    fireEvent.press(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('validates input before submit', () => {
    const { getByTestId } = render(
      <TagForm visible onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const submitButton = getByTestId('submit-button');
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
