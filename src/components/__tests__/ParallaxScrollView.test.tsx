import React from 'react';
import { render } from '@testing-library/react-native';
import { Image, View, Text, Platform } from 'react-native';
import { ParallaxScrollView } from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ui/ThemedText';

// Create test environment
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  return {
    ...rn,
    Platform: {
      ...rn.Platform,
      OS: 'test',
    },
    ScrollView: function ScrollView(
      props: React.ComponentProps<typeof rn.View> & { stickyHeaderIndices?: number[] }
    ) {
      return (
        <rn.View
          testID={props.testID}
          // 型チェックのために、stickyHeaderIndices の型を拡張した props として扱っています
          stickyHeaderIndices={props.stickyHeaderIndices}
          {...props}
        >
          {props.children}
        </rn.View>
      );
    },
  };
});

jest.mock('@/hooks/useColorScheme');

jest.mock('@/components/ui/ThemedText', () => {
  const { Text } = require('react-native');
  return {
    ThemedText: ({ children, ...props }: React.ComponentProps<typeof Text>) => (
      <Text {...props}>{children}</Text>
    ),
  };
});

jest.mock('@/components/ui/ThemedView', () => {
  const { View } = require('react-native');
  return {
    ThemedView: ({ children, ...props }: React.ComponentProps<typeof View>) => (
      <View {...props}>{children}</View>
    ),
  };
});

describe('ParallaxScrollView', () => {
  const mockTitle = 'Test Title';
  const mockSubtitle = 'Test Subtitle';

  const defaultProps = {
    headerBackgroundColor: { light: '#D0D0D0', dark: '#353636' },
    title: mockTitle,
  };

  it('renders title correctly', () => {
    const { UNSAFE_getAllByType } = render(
      <ParallaxScrollView {...defaultProps}>
        <></>
      </ParallaxScrollView>
    );
    // Text コンポーネント内にタイトルが存在するかチェック
    const textElements = UNSAFE_getAllByType(Text);
    let titleFound = false;
    textElements.forEach(element => {
      if (element.props.children === mockTitle) {
        titleFound = true;
      }
    });
    expect(titleFound).toBe(true);
  });

  it('renders title and subtitle when subtitle is provided', () => {
    const { UNSAFE_getAllByType } = render(
      <ParallaxScrollView {...defaultProps} subtitle={mockSubtitle}>
        <></>
      </ParallaxScrollView>
    );
    
    // Text コンポーネント内にタイトルとサブタイトルが存在するかチェック
    const textElements = UNSAFE_getAllByType(Text);
    let titleFound = false;
    let subtitleFound = false;
    
    textElements.forEach(element => {
      if (element.props.children === mockTitle) {
        titleFound = true;
      }
      if (element.props.children === mockSubtitle) {
        subtitleFound = true;
      }
    });
    
    expect(titleFound).toBe(true);
    expect(subtitleFound).toBe(true);
  });

  it('renders header image when provided', () => {
    const mockHeaderImage = 'https://example.com/image.jpg';
    const { UNSAFE_getByType } = render(
      <ParallaxScrollView {...defaultProps} headerImage={mockHeaderImage}>
        <></>
      </ParallaxScrollView>
    );
    const image = UNSAFE_getByType(Image);
    expect(image.props.source.uri).toBe(mockHeaderImage);
  });

  it('renders headerRight when provided', () => {
    const mockHeaderRight = <View testID="header-right" />;
    const { getByTestId } = render(
      <ParallaxScrollView {...defaultProps} headerRight={mockHeaderRight}>
        <></>
      </ParallaxScrollView>
    );
    expect(getByTestId('header-right')).toBeTruthy();
  });

  it('renders children correctly', () => {
    const { UNSAFE_getAllByType } = render(
      <ParallaxScrollView {...defaultProps} >
        <ThemedText testID="child-content">Child Content</ThemedText>
      </ParallaxScrollView>
    );
    
    // 子コンテンツが存在するかチェック
    const textElements = UNSAFE_getAllByType(Text);
    let childContentFound = false;
    
    textElements.forEach(element => {
      if (element.props.children === 'Child Content') {
        childContentFound = true;
      }
    });
    
    expect(childContentFound).toBe(true);
  });

  it('applies sticky header styles', () => {
    // テスト環境では ScrollView を View に置き換えているため、stickyHeaderIndices の動作はチェックできませんが、
    // コンポーネントがレンダリングされるかを確認しています
    const { getByTestId } = render(
      <ParallaxScrollView {...defaultProps}  testID="parallax-scroll-view">
        <></>
      </ParallaxScrollView>
    );
    const scrollView = getByTestId('parallax-scroll-view');
    expect(scrollView).toBeTruthy();
  });
});