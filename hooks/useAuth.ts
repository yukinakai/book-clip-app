import { useState, useEffect } from "react";
import { AuthService, supabase } from "../services/auth";
import { User } from "@supabase/supabase-js";

// 無視するエラーメッセージのリスト
const IGNORED_ERROR_MESSAGES = ["auth session missing", "session not found"];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // エラーをフィルタリングする関数
  const filterError = (error: Error | null): Error | null => {
    if (!error) return null;

    // 無視するエラーメッセージの場合はnullを返す
    if (
      IGNORED_ERROR_MESSAGES.some((msg) =>
        error.message.toLowerCase().includes(msg.toLowerCase())
      )
    ) {
      console.log("Ignoring error:", error.message);
      return null;
    }

    return error;
  };

  // 認証状態の監視
  useEffect(() => {
    // 初期状態の取得
    AuthService.getCurrentUser()
      .then((user) => {
        setUser(user);
        setLoading(false);
      })
      .catch((error) => {
        // 無視すべきエラーはセットしない
        setError(filterError(error));
        setLoading(false);
      });

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      // セッションがあり、イベントがSIGNED_INの場合、認証成功とする
      if (session && event === "SIGNED_IN") {
        setVerificationSuccess(true);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // OTPコードの検証
  const verifyOtp = async (otp: string) => {
    try {
      setLoading(true);
      setError(null);
      await AuthService.verifyOtp(otp);
      setVerificationSuccess(true);
    } catch (error) {
      setError(filterError(error as Error));
    } finally {
      setLoading(false);
    }
  };

  // メールによるパスワードレス認証
  const signInWithEmail = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      setEmailSent(false);
      await AuthService.signInWithEmail(email);
      setEmailSent(true);
    } catch (error) {
      setError(filterError(error as Error));
      setEmailSent(false);
    } finally {
      setLoading(false);
    }
  };

  // ログアウト
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await AuthService.signOut();
      setUser(null);
      setVerificationSuccess(false);
    } catch (error) {
      setError(filterError(error as Error));
    } finally {
      setLoading(false);
    }
  };

  // アカウント削除（退会処理）
  const deleteAccount = async () => {
    try {
      setLoading(true);
      setError(null);
      // 現時点ではサーバーサイド実装が必要なため、実際の削除は行われません
      // await AuthService.deleteAccount();
      // ダミー処理として、ログアウトだけ行います
      await AuthService.signOut();
      setUser(null);
      setVerificationSuccess(false);
    } catch (error) {
      setError(filterError(error as Error));
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    emailSent,
    verificationSuccess,
    signInWithEmail,
    verifyOtp,
    signOut,
    deleteAccount,
  };
}
