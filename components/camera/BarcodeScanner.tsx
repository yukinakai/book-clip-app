// components/camera/BarcodeScanner.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { CameraView, BarcodeScanningResult } from 'expo-camera';

interface BarcodeScannerProps {
  onBarcodeScanned: (isbn: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onBarcodeScanned }) => {
  const [scanned, setScanned] = useState(false);
  const [lastScannedISBN, setLastScannedISBN] = useState<string | null>(null);

  // スキャン後のクールダウン処理
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (scanned) {
      timer = setTimeout(() => {
        setScanned(false);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [scanned]);

  const handleBarcodeScanned = (scanningResult: BarcodeScanningResult) => {
    if (scanned) return;
    
    const { type, data } = scanningResult;
    
    // ISBN-13は978または979で始まります
    if (type === 'ean13' && (data.startsWith('978') || data.startsWith('979'))) {
      // 同じISBNの重複スキャンを防止（前回と同じISBNなら無視）
      if (lastScannedISBN === data) return;
      
      console.log('ISBN検出:', data);
      setScanned(true);
      setLastScannedISBN(data);
      
      // 親コンポーネントにISBNを通知（ここでアラートは表示しない）
      onBarcodeScanned(data);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      >
        {scanned ? (
          <View style={styles.scannedOverlay}>
            <Text style={styles.scannedText}>ISBN検出しました</Text>
          </View>
        ) : (
          <View style={styles.scannerGuideContainer}>
            <View style={styles.scannerGuide}>
              <ActivityIndicator size="small" color="#00FF00" style={styles.spinner} />
              <Text style={styles.guideText}>バーコードをスキャン中...</Text>
            </View>
          </View>
        )}
        
        <View style={styles.scannerTargetOverlay}>
          <View style={styles.scannerTarget} />
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  scannedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 180, 0, 0.7)',
    padding: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  scannedText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scannerGuideContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  scannerGuide: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    marginRight: 10,
  },
  guideText: {
    color: 'white',
    fontSize: 14,
  },
  scannerTargetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerTarget: {
    width: 280,
    height: 120,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: '#00FF00',
    backgroundColor: 'rgba(0, 255, 0, 0.05)',
  },
});

export default BarcodeScanner;