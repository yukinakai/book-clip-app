import React from 'react';
import { StyleSheet } from 'react-native';
import { MOCK_BOOKS } from '../../constants/MockData';
import BookshelfView from '../../components/BookshelfView';

interface Book {
  id: string;
  title: string;
}

export default function HomeScreen() {
  const handleBookSelect = (book: Book) => {
    // In the future, this would navigate to a book detail screen
    console.log('Selected book:', book.title);
    // Example: router.push(`/book-details/${book.id}`);
  };

  return (
    <BookshelfView 
      books={MOCK_BOOKS} 
      onSelectBook={handleBookSelect} 
      headerTitle="マイライブラリ"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
