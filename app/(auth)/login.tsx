import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { useAuthContext } from "../../contexts/AuthContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isRegisterMode = params.mode === "register";
  const returnTo = (params.returnTo as string) || "/(tabs)";
  const colorScheme = useColorScheme() ?? "light";

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

  // 認証成功時に指定された画面に遷移
  React.useEffect(() => {
    if (verificationSuccess) {
      router.replace(returnTo);
    }
  }, [verificationSuccess, returnTo]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <Text
        variant="headlineMedium"
        style={[styles.title, { color: Colors[colorScheme].text }]}
      >
        Book Clip
      </Text>
      <Text
        variant="bodyLarge"
        style={[styles.subtitle, { color: Colors[colorScheme].text }]}
      >
        {isRegisterMode ? "アカウント作成" : "ログイン"}
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
            theme={{ colors: { primary: Colors[colorScheme].primary } }}
          />
          {emailError ? (
            <Text style={[styles.error, { color: Colors[colorScheme].error }]}>
              {emailError}
            </Text>
          ) : null}

          <Button
            mode="contained"
            onPress={handleSignIn}
            style={styles.button}
            disabled={loading}
            testID="login-button"
            buttonColor={Colors[colorScheme].primary}
            textColor="white"
          >
            {isRegisterMode ? "会員登録" : "ログイン"}
          </Button>
          <Text
            style={[
              styles.infoText,
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            {isRegisterMode
              ? "メールアドレスを入力すると、認証コードが送信されます。"
              : "メールアドレスに認証コードを送信します。"}
          </Text>
        </View>
      ) : (
        <View style={styles.formContainer}>
          <Text style={[styles.message, { color: Colors[colorScheme].text }]}>
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
            theme={{ colors: { primary: Colors[colorScheme].primary } }}
          />
          {otpError ? (
            <Text style={[styles.error, { color: Colors[colorScheme].error }]}>
              {otpError}
            </Text>
          ) : null}

          <Button
            mode="contained"
            onPress={handleVerifyOtp}
            style={styles.button}
            disabled={loading}
            testID="verify-button"
            buttonColor={Colors[colorScheme].primary}
            textColor="white"
          >
            認証
          </Button>
          <Button
            mode="outlined"
            onPress={() => setEmailSent(false)}
            style={styles.button}
            testID="back-button"
            textColor={Colors[colorScheme].primary}
          >
            戻る
          </Button>
        </View>
      )}

      {loading && (
        <ActivityIndicator
          style={styles.loading}
          color={Colors[colorScheme].primary}
        />
      )}
      {error && error.message && (
        <Text
          style={[styles.error, { color: Colors[colorScheme].error }]}
          testID="error-message"
        >
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
  infoText: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 14,
    color: "#666",
  },
});
