import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { AuthService } from "../../services/auth";

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isRegisterMode = params.mode === "register";
  const returnTo = (params.returnTo as string) || "/(tabs)";
  const colorScheme = useColorScheme() ?? "light";

  // TextInputへの参照を作成
  const emailInputRef = useRef<any>(null);
  const otpInputRef = useRef<any>(null);

  // 状態管理をcontextから独立して行う
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // 画面表示時に適切なフィールドに自動フォーカス
  useEffect(() => {
    const focusTimeout = setTimeout(() => {
      if (!emailSent && emailInputRef.current) {
        emailInputRef.current.focus();
      } else if (emailSent && otpInputRef.current) {
        otpInputRef.current.focus();
      }
    }, 300); // 短い遅延を設定してUIがレンダリングされるのを待つ

    return () => clearTimeout(focusTimeout);
  }, [emailSent]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setEmailError("有効なメールアドレスを入力してください");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSignIn = async () => {
    if (validateEmail(email)) {
      try {
        setLoading(true);
        setError(null);
        await AuthService.signInWithEmail(email);
        setEmailSent(true);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
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

  const handleVerifyOtp = async () => {
    if (validateOtp(otp)) {
      try {
        setLoading(true);
        setError(null);
        await AuthService.verifyOtp(email, otp);
        setVerificationSuccess(true);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
  };

  // 認証成功時に指定された画面に遷移
  useEffect(() => {
    if (verificationSuccess) {
      router.replace(returnTo as any);
    }
  }, [verificationSuccess, returnTo, router]);

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      {/* ヘッダー */}
      <View style={[styles.header, { borderBottomColor: "#ddd" }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          testID="back-button"
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={Colors[colorScheme].text}
          />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text
            style={[styles.headerTitle, { color: Colors[colorScheme].text }]}
          >
            {isRegisterMode ? "会員登録" : "ログイン"}
          </Text>
        </View>
        <View style={styles.rightPlaceholder} />
      </View>

      {/* キーボード表示時の調整 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* コンテンツ部分 */}
            <View style={styles.content}>
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
                    ref={emailInputRef}
                    theme={{
                      colors: {
                        primary: "#ffffff",
                        onSurfaceVariant: Colors[colorScheme].text,
                        onBackground: Colors[colorScheme].text,
                        background: Colors[colorScheme].background,
                        error: Colors[colorScheme].error,
                      },
                    }}
                  />
                  {emailError ? (
                    <Text
                      style={[
                        styles.error,
                        { color: Colors[colorScheme].error },
                      ]}
                    >
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
                  <Text
                    style={[
                      styles.message,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
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
                    ref={otpInputRef}
                    theme={{
                      colors: {
                        primary: "#ffffff",
                        onSurfaceVariant: Colors[colorScheme].text,
                        onBackground: Colors[colorScheme].text,
                        background: Colors[colorScheme].background,
                        error: Colors[colorScheme].error,
                      },
                    }}
                  />
                  {otpError ? (
                    <Text
                      style={[
                        styles.error,
                        { color: Colors[colorScheme].error },
                      ]}
                    >
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
                    testID="back-to-email-button"
                    textColor={Colors[colorScheme].text}
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
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    height: 56,
  },
  backButton: {
    marginRight: 10,
    zIndex: 1,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  rightPlaceholder: {
    width: 24,
    marginLeft: 10,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 400, // 最小高さを設定してスクロール可能にする
  },
  formContainer: {
    width: "100%",
    maxWidth: 300,
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
  message: {
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  infoText: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 14,
  },
});
