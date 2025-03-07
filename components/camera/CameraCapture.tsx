import React, { useRef } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { CameraView } from 'expo-camera';

interface CameraCaptureProps {
  onCapture: (uri: string) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const cameraRef = useRef<CameraView>(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo && photo.uri) {
          onCapture(photo.uri);
        }
      } catch (error) {
        console.error('写真撮影エラー:', error);
      }
    }
  };

  return (
    <CameraView
      style={styles.camera}
      ref={cameraRef}
      barcodeScannerSettings={{
        barcodeTypes: ["ean13"],
      }}
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

const styles = StyleSheet.create({
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
});

export default CameraCapture;
