import React from 'react';
import { View, Image, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Book } from '../constants/MockData';
import { useThemeColor } from '../hooks/useThemeColor';

interface BookItemProps {
  book: Book;
  onPress: (book: Book) => void;
}

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_WIDTH = width / COLUMN_COUNT - 16;
const ASPECT_RATIO = 1.5; // Standard book cover aspect ratio (height/width)

export default function BookItem({ book, onPress }: BookItemProps) {
  const textColor = useThemeColor({}, 'text');
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(book)}
      activeOpacity={0.7}
    >
      <Image 
        source={book.coverImage} 
        style={styles.coverImage} 
        resizeMode="cover"
      />
      <View style={styles.textContainer}>
        <Text 
          style={[styles.title, { color: textColor }]} 
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {book.title}
        </Text>
        <Text 
          style={[styles.author, { color: textColor }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {book.author}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: ITEM_WIDTH,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  coverImage: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * ASPECT_RATIO,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  textContainer: {
    marginTop: 4,
    width: ITEM_WIDTH,
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    lineHeight: 16,
  },
  author: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
});
