import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Image } from 'react-native';
import { ParallaxScrollView } from '../ParallaxScrollView';
import { ThemedText } from '../ThemedText';

describe('ParallaxScrollView', () => {
  it('renders title correctly', () => {
    render(
      <ParallaxScrollView title="Test Title">
        <ThemedText>Content</ThemedText>
      </ParallaxScrollView>
    );

    expect(screen.getByText('Test Title')).toBeTruthy();
  });

  it('renders subtitle when provided', () => {
    render(
      <ParallaxScrollView title="Test Title" subtitle="Test Subtitle">
        <ThemedText>Content</ThemedText>
      </ParallaxScrollView>
    );

    expect(screen.getByText('Test Subtitle')).toBeTruthy();
  });

  it('renders header right component when provided', () => {
    render(
      <ParallaxScrollView
        title="Test Title"
        headerRight={<ThemedText testID="header-right">Right</ThemedText>}
      >
        <ThemedText>Content</ThemedText>
      </ParallaxScrollView>
    );

    expect(screen.getByTestId('header-right')).toBeTruthy();
  });

  it('renders children content', () => {
    render(
      <ParallaxScrollView title="Test Title">
        <ThemedText testID="content">Content</ThemedText>
      </ParallaxScrollView>
    );

    expect(screen.getByTestId('content')).toBeTruthy();
  });

  it('renders header image when provided', () => {
    render(
      <ParallaxScrollView
        title="Test Title"
        headerImage="https://example.com/image.jpg"
      >
        <ThemedText>Content</ThemedText>
      </ParallaxScrollView>
    );

    expect(screen.UNSAFE_getByType(Image).props.source.uri).toBe(
      'https://example.com/image.jpg'
    );
  });

  it('uses testID when provided', () => {
    render(
      <ParallaxScrollView title="Test Title" testID="scroll-view">
        <ThemedText>Content</ThemedText>
      </ParallaxScrollView>
    );

    expect(screen.getByTestId('scroll-view')).toBeTruthy();
  });
});
