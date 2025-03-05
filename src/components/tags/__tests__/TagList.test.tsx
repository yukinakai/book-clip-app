import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TagList } from '../TagList';

describe('TagList', () => {
  const mockTags = [
    {
      id: '1',
      name: 'tag1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      userId: 'user1',
    },
    {
      id: '2',
      name: 'tag2',
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
      userId: 'user1',
    },
  ];

  it('renders tags correctly', () => {
    const { getByText } = render(<TagList tags={mockTags} />);

    expect(getByText('tag1')).toBeTruthy();
    expect(getByText('tag2')).toBeTruthy();
  });

  it('calls onEditTag when edit button is pressed', () => {
    const mockOnEditTag = jest.fn();
    const { getByTestId } = render(
      <TagList tags={mockTags} onEditTag={mockOnEditTag} />
    );

    fireEvent.press(getByTestId('edit-tag-1'));
    expect(mockOnEditTag).toHaveBeenCalledWith(mockTags[0]);
  });

  it('calls onDeleteTag when delete button is pressed', () => {
    const mockOnDeleteTag = jest.fn();
    const { getByTestId } = render(
      <TagList tags={mockTags} onDeleteTag={mockOnDeleteTag} />
    );

    fireEvent.press(getByTestId('delete-tag-2'));
    expect(mockOnDeleteTag).toHaveBeenCalledWith(mockTags[1]);
  });

  it('does not render edit/delete buttons when handlers are not provided', () => {
    const { queryByTestId } = render(<TagList tags={mockTags} />);

    expect(queryByTestId('edit-tag-1')).toBeNull();
    expect(queryByTestId('delete-tag-1')).toBeNull();
  });
});
