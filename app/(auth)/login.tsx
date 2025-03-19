import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { useAuthContext } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();
  const {
    signInWithEmail,
    verifyOtp,
    loading,
    error,
    emailSent,
    verificationSuccess,
  } = useAuthContext();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");

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

  const validateOtp = (otp: string): boolean => {
    if (!otp || otp.length !== 6) {
      setOtpError("6桁のコードを入力してください");
      return false;
    }
    setOtpError("");
    return true;
  };

  const handleVerifyOtp = () => {
    if (validateOtp(otp)) {
      verifyOtp(otp);
    }
  };

  // 認証成功時にホーム画面に遷移
  React.useEffect(() => {
    if (verificationSuccess) {
      router.replace("/(tabs)");
    }
  }, [verificationSuccess]);

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
            testID="email-input"
            accessibilityLabel="メールアドレス"
          />
          {emailError ? <Text style={styles.error}>{emailError}</Text> : null}

          <Button
            mode="contained"
            onPress={handleSignIn}
            style={styles.button}
            disabled={loading}
            testID="login-button"
          >
            OTPコードを送信
          </Button>
        </View>
      ) : (
        <View style={styles.formContainer}>
          <Text style={styles.message}>
            {email}に送信された6桁のコードを入力してください
          </Text>
          <TextInput
            label="認証コード"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            style={styles.input}
            error={!!otpError}
            disabled={loading}
            testID="otp-input"
            accessibilityLabel="認証コード"
          />
          {otpError ? <Text style={styles.error}>{otpError}</Text> : null}

          <Button
            mode="contained"
            onPress={handleVerifyOtp}
            style={styles.button}
            disabled={loading}
            testID="verify-button"
          >
            認証
          </Button>
          <Button
            mode="outlined"
            onPress={() => setEmailSent(false)}
            style={styles.button}
            testID="back-button"
          >
            戻る
          </Button>
        </View>
      )}

      {loading && <ActivityIndicator style={styles.loading} />}
      {error && (
        <Text style={styles.error} testID="error-message">
          {error.message}
        </Text>
      )}
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
  message: {
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
});
