import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SignInForm } from '../../components/auth/SignInForm';

export default function SignInScreen() {
  const handleSignInSuccess = () => {
    // サインイン成功時にメイン画面に遷移
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <SignInForm onSuccess={handleSignInSuccess} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
});
