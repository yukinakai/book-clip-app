import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '@lib/supabase';

type SignUpFormProps = {
  onSuccess: () => void;
  onSignInPress: () => void;
};

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess, onSignInPress }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    auth?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    let isValid = true;

    if (!email) {
      newErrors.email = 'メールアドレスを入力してください';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'パスワードを入力してください';
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'パスワード（確認）を入力してください';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setErrors({ auth: error.message });
        return;
      }

      if (data.user) {
        onSuccess();
      }
    } catch (error) {
      setErrors({ auth: 'サインアップに失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container} testID="signup-form">
      <TextInput
        style={styles.input}
        placeholder="メールアドレス"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        testID="email-input"
      />
      {errors.email && (
        <Text style={styles.errorText} testID="email-error">
          {errors.email}
        </Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="パスワード"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        testID="password-input"
      />
      {errors.password && (
        <Text style={styles.errorText} testID="password-error">
          {errors.password}
        </Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="パスワード（確認）"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        testID="confirm-password-input"
      />
      {errors.confirmPassword && (
        <Text style={styles.errorText} testID="confirm-password-error">
          {errors.confirmPassword}
        </Text>
      )}

      {errors.auth && (
        <Text style={styles.errorText} testID="auth-error">
          {errors.auth}
        </Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSignUp}
        disabled={loading}
        testID="signup-button"
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>サインアップ</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.linkButton} 
        testID="signin-link"
        onPress={onSignInPress}
      >
        <Text style={styles.linkText}>アカウントをお持ちの方はこちら</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#0066cc',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 14,
    marginBottom: 8,
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#0066cc',
    fontSize: 14,
  },
});
