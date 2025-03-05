import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TouchableOpacity, Text } from 'react-native';
import { TagForm } from '../TagForm';

jest.mock('../../ui/Dialog', () => {
  const MockDialog = ({ content, actions }: any) => (
    <>
      {content}
      {actions}
    </>
  );
  MockDialog.Button = ({ label, onPress }: any) => (
    <TouchableOpacity testID={`dialog-button-${label}`} onPress={onPress}>
      <Text>{label}</Text>
    </TouchableOpacity>
  );
  return {
    Dialog: MockDialog,
  };
});

describe('TagForm', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();
  const defaultProps = {
    isVisible: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
    testID: 'tag-form',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with initial values', () => {
    const { getByTestId, getByText } = render(
      <TagForm {...defaultProps} initialValues={{ name: 'Test Tag' }} />
    );

    const input = getByTestId('tag-form-input');
    expect(input.props.value).toBe('Test Tag');
    expect(getByText('タグ名')).toBeTruthy();
  });

  it('shows error when submitting empty name', () => {
    const { getByTestId, getByText } = render(<TagForm {...defaultProps} />);

    fireEvent.press(getByTestId('dialog-button-作成'));

    expect(getByText('タグ名を入力してください')).toBeTruthy();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with name when submitting valid form', () => {
    const { getByTestId } = render(<TagForm {...defaultProps} />);

    const input = getByTestId('tag-form-input');
    fireEvent.changeText(input, 'New Tag');
    fireEvent.press(getByTestId('dialog-button-作成'));

    expect(mockOnSubmit).toHaveBeenCalledWith({ name: 'New Tag' });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when cancel button is pressed', () => {
    const { getByTestId } = render(<TagForm {...defaultProps} />);

    fireEvent.press(getByTestId('dialog-button-キャンセル'));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('uses update button label when editing', () => {
    const { getByTestId } = render(
      <TagForm {...defaultProps} initialValues={{ name: 'Test Tag' }} />
    );

    expect(getByTestId('dialog-button-更新')).toBeTruthy();
  });

  it('clears form when cancelling', () => {
    const { getByTestId } = render(<TagForm {...defaultProps} />);

    const input = getByTestId('tag-form-input');
    fireEvent.changeText(input, 'New Tag');
    fireEvent.press(getByTestId('dialog-button-キャンセル'));

    expect(input.props.value).toBe('');
  });
});
