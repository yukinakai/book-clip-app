import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TagList } from '../TagList';
import { Tag } from '@/types/tag';

jest.mock('@/hooks/useColorScheme');

jest.mock('@/components/ui/ThemedText', () => ({
  ThemedText: ({ children }: any) => children,
}));

jest.mock('@/components/ui/ThemedView', () => ({
  ThemedView: ({ children, testID }: any) => (
    <div data-testid={testID}>{children}</div>
  ),
}));

jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: ({ name, onPress, testID }: any) => (
    <button data-testid={testID} onClick={onPress}>
      {name}
    </button>
  ),
}));

describe('TagList', () => {
  const mockTags: Tag[] = [
    {
      id: '1',
      name: 'タグ1',
      createdAt: '2024-03-05T00:00:00Z',
      updatedAt: '2024-03-05T00:00:00Z',
      userId: 'user1',
    },
    {
      id: '2',
      name: 'タグ2',
      createdAt: '2024-03-05T00:00:00Z',
      updatedAt: '2024-03-05T00:00:00Z',
      userId: 'user1',
    },
  ];

  it('renders tags correctly', () => {
    const { getByText } = render(<TagList tags={mockTags} />);

    expect(getByText('タグ1')).toBeTruthy();
    expect(getByText('タグ2')).toBeTruthy();
  });

  it('handles edit button click', () => {
    const mockOnEditTag = jest.fn();
    const { getByTestId } = render(
      <TagList tags={mockTags} onEditTag={mockOnEditTag} />
    );

    const editButton = getByTestId('edit-tag-1');
    fireEvent.press(editButton);

    expect(mockOnEditTag).toHaveBeenCalledWith(mockTags[0]);
  });

  it('handles delete button click', () => {
    const mockOnDeleteTag = jest.fn();
    const { getByTestId } = render(
      <TagList tags={mockTags} onDeleteTag={mockOnDeleteTag} />
    );

    const deleteButton = getByTestId('delete-tag-1');
    fireEvent.press(deleteButton);

    expect(mockOnDeleteTag).toHaveBeenCalledWith(mockTags[0]);
  });

  it('does not render edit/delete buttons when handlers are not provided', () => {
    const { queryByTestId } = render(<TagList tags={mockTags} />);

    expect(queryByTestId('edit-tag-1')).toBeNull();
    expect(queryByTestId('delete-tag-1')).toBeNull();
  });

  it('renders empty list when no tags are provided', () => {
    const { toJSON } = render(<TagList tags={[]} />);
    expect(toJSON()).toBeTruthy();
  });

  it('accepts testID prop', () => {
    const { getByTestId } = render(
      <TagList tags={mockTags} testID="test-tag-list" />
    );
    expect(getByTestId('test-tag-list')).toBeTruthy();
  });
});
