import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import { TagForm } from '../TagForm';

jest.mock('../../ui/Dialog', () => {
  const MockDialog = ({ visible, onClose, children }: any) => {
    if (!visible) return null;
    return (
      <div data-testid="dialog">
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    );
  };

  MockDialog.Button = ({ label, onPress }: any) => (
    <button data-testid={`dialog-button-${label}`} onClick={onPress}>
      {label}
    </button>
  );

  return MockDialog;
});

describe('TagForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly in create mode', () => {
    const { getByPlaceholderText, getByText } = render(
      <TagForm isVisible onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    expect(getByPlaceholderText('タグ名を入力')).toBeTruthy();
    expect(getByText('タグを追加')).toBeTruthy();
  });

  it('renders correctly in edit mode', () => {
    const { getByDisplayValue, getByText } = render(
      <TagForm
        isVisible
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        initialValues={{ name: '既存のタグ' }}
      />
    );

    expect(getByDisplayValue('既存のタグ')).toBeTruthy();
    expect(getByText('タグを更新')).toBeTruthy();
  });

  it('handles submit correctly', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <TagForm isVisible onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const input = getByPlaceholderText('タグ名を入力');
    fireEvent.changeText(input, 'テストタグ');

    const submitButton = getByTestId('dialog-button-追加');
    fireEvent.press(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith('テストタグ');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles close correctly', () => {
    const { getByTestId } = render(
      <TagForm isVisible onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const cancelButton = getByTestId('dialog-button-キャンセル');
    fireEvent.press(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates input before submit', () => {
    const { getByTestId } = render(
      <TagForm isVisible onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    const submitButton = getByTestId('dialog-button-追加');
    fireEvent.press(submitButton);

    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
