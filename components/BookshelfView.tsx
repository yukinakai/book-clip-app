import React from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { Book } from '../constants/MockData';
import BookItem from './BookItem';
import { useThemeColor } from '../hooks/useThemeColor';

interface BookshelfViewProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  headerTitle?: string;
}

export default function BookshelfView({ books, onSelectBook, headerTitle }: BookshelfViewProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const renderHeader = () => {
    if (!headerTitle) return null;
    
    return (
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: textColor }]}>{headerTitle}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <FlatList
        data={books}
        renderItem={({ item }) => <BookItem book={item} onPress={onSelectBook} />}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
  },
  headerContainer: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
});
