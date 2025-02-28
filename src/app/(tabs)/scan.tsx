import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
import { BarcodeScannerView } from '../../components/BarcodeScanner';

export default function ScanScreen() {
  const [scannedBook, setScannedBook] = useState<{
    isbn: string;
    loading: boolean;
    error?: string;
  } | null>(null);

  const handleBarcodeScan = async (isbn: string) => {
    setScannedBook({
      isbn,
      loading: true,
    });

    try {
      // TODO: ISBNから書籍情報を取得する処理を実装
      // 例: const bookInfo = await fetchBookInfo(isbn);
      console.log('Scanned ISBN:', isbn);
    } catch (error) {
      setScannedBook(prev => prev ? {
        ...prev,
        loading: false,
        error: '書籍情報の取得に失敗しました'
      } : null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {!scannedBook ? (
        <BarcodeScannerView onScan={handleBarcodeScan} />
      ) : (
        <View testID="result-container" style={styles.resultContainer}>
          {scannedBook.loading ? (
            <Text>書籍情報を取得中...</Text>
          ) : scannedBook.error ? (
            <Text style={styles.errorText}>{scannedBook.error}</Text>
          ) : (
            <Text>ISBN: {scannedBook.isbn}</Text>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
  },
});
