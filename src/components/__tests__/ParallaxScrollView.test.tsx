import React from 'react';
import { render } from '@testing-library/react-native';
import { Image, ScrollView } from 'react-native';
import { ParallaxScrollView } from '../ParallaxScrollView';
import { ThemedText } from '../ui/ThemedText';

jest.mock('@/hooks/useColorScheme');

// ScrollViewをモック
jest.mock('react-native/Libraries/Components/ScrollView/ScrollView', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: View,
  };
});

describe('ParallaxScrollView', () => {
  const mockTitle = 'Test Title';
  const mockSubtitle = 'Test Subtitle';

  it('renders title correctly', () => {
    const { getByTestId } = render(
      <ParallaxScrollView
        testID="parallax-scroll-view"
        title={mockTitle}
      >
        <></>
      </ParallaxScrollView>
    );
    expect(getByTestId('parallax-scroll-view')).toBeTruthy();
  });

  it('renders subtitle when provided', () => {
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

  it('renders children correctly', () => {
    const { getByText } = render(
      <ParallaxScrollView title={mockTitle}>
        <ThemedText>Child Content</ThemedText>
      </ParallaxScrollView>
    );
    expect(getByText('Child Content')).toBeTruthy();
  });
});
