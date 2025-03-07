import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MOCK_BOOKS } from '../../constants/MockData';
import BookshelfView from '../../components/BookshelfView';
import { Ionicons } from '@expo/vector-icons'; // Expoのアイコンライブラリをインポート

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
    <View style={styles.container}>
      <View style={styles.bookshelfContainer}>
        <BookshelfView 
          books={MOCK_BOOKS} 
          onSelectBook={handleBookSelect} 
          headerTitle="マイライブラリ"
        />
      </View>
      
      <View style={styles.buttonWrapper}>
        <TouchableOpacity 
          style={styles.addButton}
          activeOpacity={0.8}
          onPress={() => {
            // 現時点では何もしない
            console.log('Add button pressed');
          }}
          testID="add-book-button"
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  bookshelfContainer: {
    flex: 1,
    width: '100%',
  },
  buttonWrapper: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    pointerEvents: 'box-none',
    zIndex: 5000, // 高い値を設定してボトムバーより前面に表示
  },
  addButton: {
    position: 'absolute',
    bottom: 90, // ボトムバーの高さ + 余白を考慮して上に移動
    right: 30,
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: '#FF4757',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    zIndex: 5000, // 高い値を設定
  },
});
