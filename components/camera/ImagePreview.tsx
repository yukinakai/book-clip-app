import React from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ImagePreviewProps {
  imageUri: string;
  onRetake: () => void;
  onUse: (imageUri: string) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUri, onRetake, onUse }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={onRetake}>
          <Text style={styles.buttonText}>撮り直す</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.confirmButton]}
          onPress={() => onUse(imageUri)}
        >
          <Text style={styles.buttonText}>使用する</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  image: {
    flex: 1,
    resizeMode: 'contain',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
  },
  button: {
    backgroundColor: '#333',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    minWidth: 120,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#FF4757',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default ImagePreview;
