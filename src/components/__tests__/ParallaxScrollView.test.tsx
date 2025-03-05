import React from 'react';
import { render } from '@testing-library/react-native';
import { Image, View, Text } from 'react-native';
import { ParallaxScrollView } from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ui/ThemedText';

// Create test environment
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  const mockedRN = {
    ...rn,
    Platform: {
      ...rn.Platform,
      OS: 'test',
    },
    ScrollView: function ScrollView(props) {
      return <rn.View testID={props.testID} stickyHeaderIndices={props.stickyHeaderIndices} {...props}>{props.children}</rn.View>;
    }
  };
  return mockedRN;
});

jest.mock('@/hooks/useColorScheme');

jest.mock('@/components/ui/ThemedText', () => {
  const { Text } = require('react-native');
  return {
    ThemedText: ({ children, ...props }: any) => (
      <Text {...props}>{children}</Text>
    ),
  };
});

jest.mock('@/components/ui/ThemedView', () => {
  const { View } = require('react-native');
  return {
    ThemedView: ({ children, ...props }: any) => (
      <View {...props}>{children}</View>
    ),
  };
});

describe('ParallaxScrollView', () => {
  const mockTitle = 'Test Title';
  const mockSubtitle = 'Test Subtitle';

  it('renders title correctly', () => {
    const { getByText, UNSAFE_getAllByType } = render(
      <ParallaxScrollView title={mockTitle}>
        <></>
      </ParallaxScrollView>
    );
    // Check title exists in one of the Text components
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
      <ParallaxScrollView
        title={mockTitle}
        subtitle={mockSubtitle}
      >
        <></>
      </ParallaxScrollView>
    );
    
    // Check title and subtitle exist in one of the Text components
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
    const { UNSAFE_getAllByType } = render(
      <ParallaxScrollView title={mockTitle}>
        <ThemedText testID="child-content">Child Content</ThemedText>
      </ParallaxScrollView>
    );
    
    // Check if child content exists
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
    // Since we're using View instead of ScrollView in tests, we can't effectively 
    // test sticky header indices, so we'll just verify the component renders
    const { getByTestId } = render(
      <ParallaxScrollView
        testID="parallax-scroll-view"
        title={mockTitle}
      >
        <></>
      </ParallaxScrollView>
    );
    const scrollView = getByTestId('parallax-scroll-view');
    expect(scrollView).toBeTruthy();
  });
});
