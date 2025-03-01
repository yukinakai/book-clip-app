import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SignUpForm } from '../../components/auth/SignUpForm';

export default function SignUp() {
  const handleSignUpSuccess = () => {
    // サインアップ成功後、メール確認画面に遷移する予定
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <SignUpForm onSuccess={handleSignUpSuccess} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
