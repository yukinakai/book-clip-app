import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { IconSymbol } from '../IconSymbol';

describe('IconSymbol', () => {
  it('renders with default props', () => {
    render(<IconSymbol name="pencil" testID="icon" />);
    expect(screen.getByTestId('icon')).toBeTruthy();
  });

  it('handles onPress callback', () => {
    const onPressMock = jest.fn();
    render(<IconSymbol name="pencil" onPress={onPressMock} testID="icon" />);

    fireEvent.press(screen.getByTestId('icon'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('is disabled when no onPress is provided', () => {
    render(<IconSymbol name="pencil" testID="icon" />);
    const touchable = screen.getByTestId('icon');
    expect(touchable.props.disabled).toBe(true);
  });

  it('renders with custom size', () => {
    render(<IconSymbol name="pencil" size={32} testID="icon" />);
    const icon = screen.getByTestId('ionicon-pencil');
    expect(icon.props.style.fontSize).toBe(32);
  });

  it('renders with custom color', () => {
    render(<IconSymbol name="pencil" color="#FF0000" testID="icon" />);
    const icon = screen.getByTestId('ionicon-pencil');
    expect(icon.props.style.color).toBe('#FF0000');
  });

  it.each([
    'pencil',
    'add',
    'trash',
    'chevron-back',
    'chevron-forward',
    'close',
    'search',
    'scan',
  ] as const)('renders %s icon correctly', (name) => {
    render(<IconSymbol name={name} testID="icon" />);
    expect(screen.getByTestId('icon')).toBeTruthy();
  });
});
