import React from 'react';
import { render } from '@testing-library/react-native';
import { Image, ScrollView, View, Text } from 'react-native';
import { ParallaxScrollView } from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';

jest.mock('@/hooks/useColorScheme');

jest.mock('react-native/Libraries/Components/ScrollView/ScrollView', () => {
  const { View } = require('react-native');
  return View;
});

jest.mock('@/components/ui/ThemedText', () => ({
  ThemedText: ({ children, ...props }: { children: React.ReactNode }) => (
    <Text {...props}>{children}</Text>
  ),
}));

jest.mock('@/components/ui/ThemedView', () => ({
  ThemedView: ({ children, ...props }: { children: React.ReactNode }) => (
    <View {...props}>{children}</View>
  ),
}));

describe('ParallaxScrollView', () => {
  const mockTitle = 'Test Title';
  const mockSubtitle = 'Test Subtitle';

  it('renders title correctly', () => {
    const { getByText } = render(
      <ParallaxScrollView title={mockTitle}>
        <></>
      </ParallaxScrollView>
    );
    expect(getByText(mockTitle)).toBeTruthy();
  });

  it('renders title and subtitle when subtitle is provided', () => {
    const { getByText } = render(
      <ParallaxScrollView
        title={mockTitle}
        subtitle={mockSubtitle}
      >
        <></>
      </ParallaxScrollView>
    );
    expect(getByText(mockTitle)).toBeTruthy();
    expect(getByText(mockSubtitle)).toBeTruthy();
  });

  it('renders header image when provided', () => {
    const mockHeaderImage = 'https://example.com/image.jpg';
    const { UNSAFE_getByType } = render(
      <ParallaxScrollView
        title={mockTitle}
        headerImage={mockHeaderImage}
      >
        <></>
      </ParallaxScrollView>
    );
    const image = UNSAFE_getByType(Image);
    expect(image.props.source.uri).toBe(mockHeaderImage);
  });

  it('renders headerRight when provided', () => {
    const mockHeaderRight = <View testID="header-right" />;
    const { getByTestId } = render(
      <ParallaxScrollView
        title={mockTitle}
        headerRight={mockHeaderRight}
      >
        <></>
      </ParallaxScrollView>
    );
    expect(getByTestId('header-right')).toBeTruthy();
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <ParallaxScrollView title={mockTitle}>
        <ThemedText>Child Content</ThemedText>
      </ParallaxScrollView>
    );
    expect(getByText('Child Content')).toBeTruthy();
  });

  it('applies sticky header styles', () => {
    const { getByTestId } = render(
      <ParallaxScrollView
        testID="parallax-scroll-view"
        title={mockTitle}
      >
        <></>
      </ParallaxScrollView>
    );
    const scrollView = getByTestId('parallax-scroll-view');
    expect(scrollView.props.stickyHeaderIndices).toEqual([1]);
  });
});
