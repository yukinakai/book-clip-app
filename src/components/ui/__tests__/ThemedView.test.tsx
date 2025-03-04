import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';

jest.mock('@/hooks/useColorScheme');
const mockUseColorScheme = useColorScheme as jest.MockedFunction<typeof useColorScheme>;

describe('ThemedView', () => {
  it('renders view with light theme colors', () => {
    mockUseColorScheme.mockReturnValue('light');
    const { getByTestId } = render(<ThemedView testID="themed-view" />);
    const view = getByTestId('themed-view');
    expect(view.props.style[0]).toEqual({ backgroundColor: '#fff' });
  });

  it('renders view with dark theme colors', () => {
    mockUseColorScheme.mockReturnValue('dark');
    const { getByTestId } = render(<ThemedView testID="themed-view" />);
    const view = getByTestId('themed-view');
    expect(view.props.style[0]).toEqual({ backgroundColor: '#000' });
  });

  it('applies custom styles', () => {
    mockUseColorScheme.mockReturnValue('light');
    const { getByTestId } = render(
      <ThemedView testID="themed-view" style={{ padding: 20 }} />
    );
    const view = getByTestId('themed-view');
    expect(view.props.style[1]).toEqual({ padding: 20 });
  });

  it('renders children correctly', () => {
    mockUseColorScheme.mockReturnValue('light');
    const { getByTestId } = render(
      <ThemedView>
        <ThemedText testID="child-text">Child Content</ThemedText>
      </ThemedView>
    );
    const textElement = getByTestId('child-text');
    expect(textElement.props.children).toBe('Child Content');
  });
});
