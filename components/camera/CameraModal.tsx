import React, { useState } from 'react';
import { Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import CameraCapture from './CameraCapture';
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

  const handleCapture = (uri: string) => {
    console.log('写真撮影成功:', uri);
    setCapturedImage(uri);
  };

  const handleUseImage = (uri: string) => {
    onImageCaptured(uri);
    onClose();
    // モーダルが閉じた後に状態をリセット
    setTimeout(() => setCapturedImage(null), 500);
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
          onUse={handleUseImage} 
        />
      );
    }

    return <CameraCapture onCapture={handleCapture} />;
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
            {capturedImage ? "プレビュー" : "カメラ"}
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
