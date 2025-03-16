// components/camera/BarcodeScanner.tsx
import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import { CameraView, BarcodeScanningResult } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

interface BarcodeScannerProps {
  onBarcodeScanned: (isbn: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onBarcodeScanned }) => {
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [lastScannedISBN, setLastScannedISBN] = useState<string | null>(null);
  
  // 画面の高さを取得
  const screenHeight = Dimensions.get('window').height;
  // 画面の中央のy座標
  const middleY = screenHeight / 2;
  
  // スキャンアニメーション用
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  
  const startScanning = () => {
    if (scanning || scanned) return;
    
    setScanning(true);
    
    // スキャンラインのアニメーションを開始
    scanLineAnim.setValue(0);
    Animated.timing(scanLineAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.linear,
      useNativeDriver: true
    }).start();
    
    // 3秒後にスキャンモードを自動終了
    setTimeout(() => {
      if (!scanned) {
        setScanning(false);
      }
    }, 3000);
  };

  const handleBarcodeScanned = (scanningResult: BarcodeScanningResult) => {
    if (!scanning || scanned) return;
    
    const { type, data, bounds } = scanningResult;
    
    // バーコードの位置情報をログに出力
    console.log(`バーコード: ${data}, 位置: ${JSON.stringify(bounds)}, 画面の高さ: ${screenHeight}`);
    
    // バーコードの位置をチェック（y座標が中央値より大きいかどうか）
    // boundsの値が0〜1の範囲の場合と、ピクセル値の場合の両方に対応
    let isBottomHalf = false;
    
    if (bounds && bounds.origin) {
      const y = bounds.origin.y;
      
      // yがピクセル値の場合（大きな値の場合）
      if (y > 1) {
        isBottomHalf = y > middleY;
      } 
      // yが0〜1の正規化された値の場合
      else {
        isBottomHalf = y > 0.5;
      }
    }
    
    // 下半分のバーコードはスキップ
    if (isBottomHalf) {
      console.log('下部のバーコードなのでスキップします', bounds?.origin?.y);
      return;
    }
    
    // 代替方法: 特定のプレフィックスをスキップ（必要に応じて有効化）
    // if (data.startsWith('192')) {
    //   console.log('商品バーコードなのでスキップします:', data);
    //   return;
    // }
    
    if (type === 'ean13' && (data.startsWith('978') || data.startsWith('979'))) {
      if (lastScannedISBN === data) return;
      
      console.log('ISBN検出:', data);
      setScanned(true);
      setScanning(false);
      setLastScannedISBN(data);
      onBarcodeScanned(data);
      
      // 2秒後にスキャン状態をリセット
      setTimeout(() => {
        setScanned(false);
      }, 2000);
    }
  };

  // スキャンラインのアニメーション設定
  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120]
  });

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13"],
        }}
        onBarcodeScanned={handleBarcodeScanned}
      >
        {scanned && (
          <View style={styles.scannedOverlay}>
            <Ionicons name="checkmark-circle" size={24} color="#FFF" style={styles.statusIcon} />
            <Text style={styles.scannedText}>ISBNを検出しました</Text>
          </View>
        )}
        
        <View style={styles.scannerTargetOverlay}>
          {/* ガイダンステキストを追加 */}
          <Text style={styles.guidanceText}>上部のISBNバーコードを枠内に収めてください</Text>
          
          <View style={[styles.scannerTarget, styles.scannerTargetTop]}>
            {scanning && (
              <Animated.View 
                style={[
                  styles.scanLine,
                  { transform: [{ translateY }] }
                ]}
              />
            )}
          </View>
          
          <TouchableOpacity 
            style={[
              styles.scanButton,
              scanning && styles.scanningButton,
              scanned && styles.scannedButton
            ]}
            onPress={startScanning}
            disabled={scanning || scanned}
          >
            <Text style={styles.scanButtonText}>
              {scanned 
                ? "検出済み" 
                : scanning 
                  ? "スキャン中..." 
                  : "タップしてスキャン"}
            </Text>
            {!scanning && !scanned && (
              <Ionicons name="scan-outline" size={20} color="white" style={styles.buttonIcon} />
            )}
          </TouchableOpacity>
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
    padding: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 10,
  },
  statusIcon: {
    marginRight: 8,
  },
  scannedText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
    overflow: 'hidden',
  },
  // 上部にスキャナーターゲットを配置
  scannerTargetTop: {
    marginBottom: 200, // 画面の上部に配置
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: '#00FF00',
    shadowColor: '#00FF00',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  guidanceText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180,
  },
  scanningButton: {
    backgroundColor: 'rgba(0, 100, 200, 0.7)',
  },
  scannedButton: {
    backgroundColor: 'rgba(0, 150, 0, 0.7)',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonIcon: {
    marginLeft: 8,
  },
});

export default BarcodeScanner;