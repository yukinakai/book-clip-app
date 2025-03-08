import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface PermissionRequestProps {
  requestPermission: () => void;
  loading?: boolean;
}

const PermissionRequest: React.FC<PermissionRequestProps> = ({ requestPermission, loading }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {loading 
          ? 'カメラの権限を確認中...' 
          : 'カメラの使用には権限が必要です'
        }
      </Text>
      {!loading && (
        <TouchableOpacity 
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>権限を許可する</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  text: {
    color: 'white',
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  button: {
    backgroundColor: '#FF4757',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default PermissionRequest;
