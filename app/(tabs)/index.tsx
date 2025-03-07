// app/(tabs)/index.tsx
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { MOCK_BOOKS } from '../../constants/MockData';
import BookshelfView from '../../components/BookshelfView';
import { Ionicons } from '@expo/vector-icons';
import CameraModal from '../../components/camera/CameraModal';

interface Book {
  id: string;
  title: string;
}

export default function HomeScreen() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleBookSelect = (book: Book) => {
    console.log('Selected book:', book.title);
  };

  const handleImageCaptured = (imageUri: string) => {
    console.log('画像が選択されました:', imageUri);
    // ここで画像を利用する処理を追加（例：本の検索APIを呼び出すなど）
    Alert.alert('画像キャプチャ', '写真の処理が完了しました。この後、OCRやバーコードスキャンなどの処理を追加できます。');
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
          onPress={() => setIsCameraOpen(true)}
          testID="add-book-button"
        >
          <Ionicons name="barcode-outline" size={26} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* カメラモーダル */}
      <CameraModal 
        isVisible={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onImageCaptured={handleImageCaptured}
      />
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
    zIndex: 5000,
  },
  addButton: {
    position: 'absolute',
    bottom: 90,
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
    zIndex: 5000,
  },
});