import React, { ReactNode } from 'react';
import {
  ScrollView,
  View,
  Image,
  StyleSheet,
  Dimensions,
  ImageSourcePropType,
} from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

interface Props {
  children: ReactNode;
  headerImage?: string;
  title: string;
  subtitle?: string;
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
  subtitle,
  headerRight,
  testID,
}: Props) {
  return (
    <ScrollView testID={testID} stickyHeaderIndices={[1]}>
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
            <ThemedText numberOfLines={1} style={styles.title}>
              {title}
            </ThemedText>
            {subtitle && (
              <ThemedText numberOfLines={1} style={styles.subtitle}>
                {subtitle}
              </ThemedText>
            )}
          </View>
          {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
        </View>
      </ThemedView>

      {children}
    </ScrollView>
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
