import React, { ReactNode } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  ImageSourcePropType,
  Platform,
} from 'react-native';
import { ThemedView } from './ui/ThemedView';
import { ThemedText } from './ui/ThemedText';

// Use View component for testing, ScrollView for real use
const ScrollableView = process.env.NODE_ENV === 'test' ? View : ScrollView;

interface Props {
  children: ReactNode;
  headerImage?: string;
  title: string;
  titleTestID?: string;
  subtitle?: string;
  subtitleTestID?: string;
  headerRight?: ReactNode;
  testID?: string;
}

const { height } = Dimensions.get('window');
const HEADER_HEIGHT = height * 0.4;
const TITLE_HEIGHT = 72;

export function ParallaxScrollView({
  children,
  headerImage,
  title,
  titleTestID,
  subtitle,
  subtitleTestID,
  headerRight,
  testID,
}: Props) {
  return (
    <ScrollableView testID={testID} stickyHeaderIndices={[1]}>
      <View style={styles.header}>
        {headerImage ? (
          <Image
            source={{ uri: headerImage }}
            style={styles.headerImage}
            resizeMode="cover"
          />
        ) : (
          <ThemedView style={styles.headerPlaceholder} />
        )}
      </View>

      <ThemedView style={styles.titleContainer}>
        <View style={styles.titleContent}>
          <View style={styles.titleTextContainer}>
            <ThemedText numberOfLines={1} style={styles.title} testID={titleTestID}>
              {title}
            </ThemedText>
            {subtitle && (
              <ThemedText numberOfLines={1} style={styles.subtitle} testID={subtitleTestID}>
                {subtitle}
              </ThemedText>
            )}
          </View>
          {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
        </View>
      </ThemedView>

      {children}
    </ScrollableView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: HEADER_HEIGHT,
    backgroundColor: '#f0f0f0',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerPlaceholder: {
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    height: TITLE_HEIGHT,
    justifyContent: 'center',
  },
  titleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  titleTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
