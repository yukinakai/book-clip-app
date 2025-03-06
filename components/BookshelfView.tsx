import React from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <FlatList
        data={books}
        renderItem={({ item }) => <BookItem book={item} onPress={onSelectBook} />}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
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
