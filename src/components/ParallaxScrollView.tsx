import React, { useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Animated,
  StyleSheet,
  Image,
  ImageSourcePropType,
  ViewStyle,
} from 'react-native';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

const HEADER_MAX_HEIGHT = 300;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

interface Props {
  children: React.ReactNode;
  headerImage?: string;
  title: string;
  subtitle?: string;
  style?: ViewStyle;
}

export function ParallaxScrollView({ children, headerImage, title, subtitle, style }: Props) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.8, 0.7],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -20, -40],
    extrapolate: 'clamp',
  });

  const handleScroll = useCallback(
    Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      { useNativeDriver: true }
    ),
    [scrollY]
  );

  return (
    <ThemedView style={[styles.container, style]}>
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollView}
      >
        <View style={{ marginTop: HEADER_MAX_HEIGHT }}>
          {children}
        </View>
      </ScrollView>
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        {headerImage && (
          <Animated.Image
            style={[
              styles.headerImage,
              {
                opacity: imageOpacity,
                transform: [{ translateY: imageTranslateY }],
                width,
              },
            ]}
            source={{ uri: headerImage }}
            resizeMode="cover"
          />
        )}
        <View style={styles.headerOverlay} />
        <Animated.View
          style={[
            styles.headerContent,
            {
              transform: [
                { scale: titleScale },
                { translateY: titleTranslateY },
              ],
            },
          ]}
        >
          <ThemedText style={styles.headerTitle}>{title}</ThemedText>
          {subtitle && (
            <ThemedText style={styles.headerSubtitle}>{subtitle}</ThemedText>
          )}
        </Animated.View>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_MAX_HEIGHT,
    backgroundColor: '#e1e4e8',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
});
