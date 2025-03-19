import { useState, useEffect } from "react";
import { AuthService, supabase } from "../services/auth";
import { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  // 認証状態の監視
  useEffect(() => {
    // 初期状態の取得
    AuthService.getCurrentUser()
      .then((user) => {
        setUser(user);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // メールによるパスワードレス認証
  const signInWithEmail = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      setEmailSent(false);
      await AuthService.signInWithEmail(email);
      setEmailSent(true);
    } catch (error) {
      setError(error as Error);
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
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    emailSent,
    signInWithEmail,
    signOut,
  };
}
