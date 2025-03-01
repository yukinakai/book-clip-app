import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SignUpForm } from '../../components/auth/SignUpForm';

export default function SignUp() {
  const handleSignUpSuccess = () => {
    // サインアップ成功時にメイン画面に遷移
    router.replace('/(tabs)');
  };

  const handleSignInPress = () => {
    router.push('/sign-in');
  };

  return (
    <View style={styles.container}>
      <SignUpForm 
        onSuccess={handleSignUpSuccess}
        onSignInPress={handleSignInPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
