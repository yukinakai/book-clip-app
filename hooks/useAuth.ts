import { useState, useEffect } from "react";
import { AuthService, supabase } from "../services/auth";
import { User } from "@supabase/supabase-js";
import {
  StorageMigrationService,
  MigrationProgress,
} from "../services/StorageMigrationService";

// 無視するエラーメッセージのリスト
const IGNORED_ERROR_MESSAGES = ["auth session missing", "session not found"];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // データ移行の状態
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress>(
    {
      total: 0,
      current: 0,
      status: "completed", // 初期状態では完了状態
    }
  );
  const [showMigrationProgress, setShowMigrationProgress] = useState(false);

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
    // ストレージを初期化
    StorageMigrationService.initializeStorage()
      .then(() => {
        console.log("Storage initialized");
      })
      .catch((error) => {
        console.error("Failed to initialize storage:", error);
      });

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
      const newUser = session?.user ?? null;

      // ユーザー状態の変更があった場合の処理
      if (
        (!user && newUser) ||
        (user && !newUser) ||
        user?.id !== newUser?.id
      ) {
        if (newUser) {
          // ログイン時の処理
          try {
            await StorageMigrationService.switchToSupabaseStorage(newUser.id);
          } catch (error) {
            console.error("Failed to switch to Supabase storage:", error);
          }
        } else if (user) {
          // ログアウト時の処理
          try {
            // ローカルデータをクリア
            await StorageMigrationService.clearLocalData();
            // ローカルストレージに切り替え
            await StorageMigrationService.switchToLocalStorage();
          } catch (error) {
            console.error("Failed to switch to local storage:", error);
          }
        }
      }

      setUser(newUser);

      // セッションがあり、イベントがSIGNED_INの場合、認証成功とする
      if (session && event === "SIGNED_IN") {
        setVerificationSuccess(true);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // OTPコードの検証
  const verifyOtp = async (email: string, otp: string) => {
    try {
      setLoading(true);
      setError(null);
      await AuthService.verifyOtp(email, otp);
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
    setLoading(true);
    try {
      await AuthService.deleteAccount();
      // アカウント削除が成功した場合、ユーザー状態をクリア
      setUser(null);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Account deletion error:", error);
      const filteredError = filterError(error as Error);
      if (filteredError) {
        setError(filteredError);
      }
      setLoading(false);
      return false;
    }
  };

  // 会員登録時のデータ移行処理
  const migrateLocalDataToSupabase = async () => {
    if (!user) return false;

    try {
      setShowMigrationProgress(true);

      const result = await StorageMigrationService.migrateLocalToSupabase(
        user.id,
        (progress) => {
          setMigrationProgress(progress);
        }
      );

      // 移行が完了したらローカルデータをクリア
      if (result.processed > 0) {
        await StorageMigrationService.clearLocalData();
      }

      setTimeout(() => {
        setShowMigrationProgress(false);
      }, 2000); // 完了メッセージを2秒間表示

      return true;
    } catch (error) {
      console.error("Data migration error:", error);
      return false;
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
    migrationProgress,
    showMigrationProgress,
    migrateLocalDataToSupabase,
  };
}
