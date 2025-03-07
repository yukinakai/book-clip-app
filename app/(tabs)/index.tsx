import React, { useState, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Modal, SafeAreaView, Alert, Image } from 'react-native';
import { MOCK_BOOKS } from '../../constants/MockData';
import BookshelfView from '../../components/BookshelfView';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

interface Book {
  id: string;
  title: string;
}

export default function HomeScreen() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const handleBookSelect = (book: Book) => {
    console.log('Selected book:', book.title);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          console.log('写真撮影成功:', photo.uri);
          setCapturedImage(photo.uri);
        }
      } catch (error) {
        console.error('写真撮影エラー:', error);
        Alert.alert('エラー', '写真の撮影に失敗しました。');
      }
    }
  };

  const resetCamera = () => {
    setCapturedImage(null);
  };

  const renderCameraContent = () => {
    if (!permission) {
      // カメラ権限がまだロード中
      return (
        <View style={styles.cameraMock}>
          <Text style={styles.cameraMockText}>カメラの権限を確認中...</Text>
        </View>
      );
    }

    if (!permission.granted) {
      // カメラ権限が許可されていない
      return (
        <View style={styles.cameraMock}>
          <Text style={styles.cameraMockText}>カメラの使用には権限が必要です</Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>権限を許可する</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (capturedImage) {
      return (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          <View style={styles.previewButtons}>
            <TouchableOpacity style={styles.previewButton} onPress={resetCamera}>
              <Text style={styles.previewButtonText}>撮り直す</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.previewButton, styles.previewButtonConfirm]}
              onPress={() => {
                console.log('写真を利用:', capturedImage);
                setIsCameraOpen(false);
                // ここで写真を利用する処理（例：本の検索など）
                setTimeout(() => setCapturedImage(null), 500); // モーダルが閉じた後にリセット
              }}
            >
              <Text style={styles.previewButtonText}>使用する</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <CameraView
        style={styles.camera}
        ref={cameraRef}
      >
        <TouchableOpacity 
          style={styles.captureButton}
          onPress={takePicture}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      </CameraView>
    );
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
            setIsCameraOpen(true);
          }}
          testID="add-book-button"
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      </View>
      
      <Modal
        animationType="slide"
        transparent={false}
        visible={isCameraOpen}
        onRequestClose={() => {
          setCapturedImage(null);
          setIsCameraOpen(false);
        }}
      >
        <SafeAreaView style={styles.cameraContainer}>
          <View style={styles.cameraHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setCapturedImage(null);
                setIsCameraOpen(false);
              }}
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
            <Text style={styles.cameraTitle}>
              {capturedImage ? "プレビュー" : "カメラ"}
            </Text>
          </View>
          
          {renderCameraContent()}
        </SafeAreaView>
      </Modal>
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
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraHeader: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
  },
  cameraTitle: {
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
  cameraMock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  cameraMockText: {
    color: 'white',
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: 'white',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
  },
  permissionButton: {
    backgroundColor: '#FF4757',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
  },
  previewButton: {
    backgroundColor: '#333',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    minWidth: 120,
    alignItems: 'center',
  },
  previewButtonConfirm: {
    backgroundColor: '#FF4757',
  },
  previewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
