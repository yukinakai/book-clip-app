// components/camera/CameraModal.tsx
import React, { useState } from 'react';
import { Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import BarcodeScanner from './BarcodeScanner';
import ImagePreview from './ImagePreview';
import PermissionRequest from './PermissionRequest';

interface CameraModalProps {
  isVisible: boolean;
  onClose: () => void;
  onImageCaptured: (imageUri: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isVisible, onClose, onImageCaptured }) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [processedISBNs, setProcessedISBNs] = useState<Set<string>>(new Set());

  const handleBarcodeScanned = (isbn: string) => {
    // 既に処理済みのISBNなら無視
    if (processedISBNs.has(isbn)) return;
    
    console.log('ISBN検出:', isbn);
    
    // このISBNを処理済みとしてマーク
    setProcessedISBNs(prev => new Set(prev).add(isbn));
    
    // アラートを1回だけ表示
    Alert.alert('ISBN検出', `ISBN: ${isbn}\n\nこのISBNを使って書籍情報を検索しますか？`, [
      {
        text: 'キャンセル',
        style: 'cancel',
        onPress: () => {
          // モーダルを閉じずに継続可能に
        }
      },
      {
        text: '検索する',
        onPress: () => {
          // ここでISBNを使った書籍検索処理を実行
          onClose();
          // モーダルが閉じる際に状態をリセット
          setProcessedISBNs(new Set());
        }
      }
    ]);
  };

  const handleClose = () => {
    setCapturedImage(null);
    onClose();
  };

  const renderContent = () => {
    if (!permission) {
      return <PermissionRequest loading={true} requestPermission={() => {}} />;
    }

    if (!permission.granted) {
      return <PermissionRequest requestPermission={requestPermission} />;
    }

    if (capturedImage) {
      return (
        <ImagePreview 
          imageUri={capturedImage} 
          onRetake={() => setCapturedImage(null)} 
          onUse={(uri) => {
            onImageCaptured(uri);
            onClose();
            setTimeout(() => setCapturedImage(null), 500);
          }} 
        />
      );
    }

    return <BarcodeScanner onBarcodeScanned={handleBarcodeScanned} />;
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={handleClose}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {capturedImage ? "プレビュー" : "バーコードスキャン"}
          </Text>
        </View>
        
        {renderContent()}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    left: 15,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CameraModal;