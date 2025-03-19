import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { useAuthContext } from "../../contexts/AuthContext";

export default function LoginScreen() {
  const { signInWithEmail, loading, error, emailSent } = useAuthContext();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setEmailError("有効なメールアドレスを入力してください");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSignIn = () => {
    if (validateEmail(email)) {
      signInWithEmail(email);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Book Clip
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        本の名言を共有しよう
      </Text>

      {!emailSent ? (
        <View style={styles.formContainer}>
          <TextInput
            label="メールアドレス"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            error={!!emailError}
            disabled={loading}
          />
          {emailError ? <Text style={styles.error}>{emailError}</Text> : null}

          <Button
            mode="contained"
            onPress={handleSignIn}
            style={styles.button}
            disabled={loading}
          >
            ログインリンクを送信
          </Button>
        </View>
      ) : (
        <View style={styles.messageContainer}>
          <Text style={styles.successMessage}>
            {email}にログインリンクを送信しました。
            メールを確認してリンクをクリックしてください。
          </Text>
          <Button
            mode="outlined"
            onPress={() => setEmailSent(false)}
            style={styles.button}
          >
            戻る
          </Button>
        </View>
      )}

      {loading && <ActivityIndicator style={styles.loading} />}
      {error && <Text style={styles.error}>{error.message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    marginBottom: 10,
  },
  subtitle: {
    marginBottom: 40,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    maxWidth: 300,
  },
  messageContainer: {
    width: "100%",
    maxWidth: 300,
    alignItems: "center",
  },
  input: {
    marginBottom: 20,
  },
  button: {
    marginVertical: 10,
  },
  loading: {
    marginTop: 20,
  },
  error: {
    color: "red",
    marginTop: 5,
    marginBottom: 15,
    textAlign: "left",
  },
  successMessage: {
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
});
