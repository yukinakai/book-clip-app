import { useState, useEffect } from "react";
import { AuthService, supabase } from "../services/auth";
import { User } from "@supabase/supabase-js";
import { StorageMigrationService } from "../services/StorageMigrationService";

// 無視するエラーメッセージのリスト
const IGNORED_ERROR_MESSAGES = ["auth session missing", "session not found"];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // 会員登録検出のための状態
  const [isNewUser, setIsNewUser] = useState(false);

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

  // 自動匿名サインイン
  const autoSignInAnonymously = async () => {
    try {
      console.log("匿名サインインを試行中...");
      const data = await AuthService.signInAnonymously();
      console.log("匿名サインイン成功:", data);
      // 認証状態の変更はonAuthStateChangeで管理するため、ここではユーザー状態を更新しない
      setIsAnonymous(true);
    } catch (error) {
      console.error("匿名サインイン自動実行エラー:", error);
      const filteredError = filterError(error as Error);
      if (filteredError) {
        setError(filteredError);
      }
    }
  };

  // 匿名ユーザーにメールアドレスを紐付ける
  const linkEmailToUser = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      setEmailSent(false);
      await AuthService.linkEmailToAnonymousUser(email);
      setEmailSent(true);
    } catch (error) {
      setError(filterError(error as Error));
      setEmailSent(false);
    } finally {
      setLoading(false);
    }
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
        console.log("現在のユーザー:", user);
        if (user) {
          setUser(user);
          // JWT内のis_anonymousクレームでユーザーが匿名かどうかを判断
          setIsAnonymous(!!user.app_metadata?.is_anonymous);
        } else {
          // ユーザーがいない場合は匿名サインインを実行
          autoSignInAnonymously();
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("ユーザー取得エラー:", error);
        // 無視すべきエラーはセットしない
        setError(filterError(error));
        setLoading(false);
        // エラーの場合でも匿名サインインを試行
        autoSignInAnonymously();
      });

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const newUser = session?.user ?? null;
      const previousUser = user;

      console.log("認証状態変更イベント:", event, "新しいユーザー:", !!newUser);

      // 匿名サインインの検出
      if (newUser && event === "SIGNED_IN") {
        const isAnonymousUser = !!newUser.app_metadata?.is_anonymous;
        setIsAnonymous(isAnonymousUser);

        if (isAnonymousUser) {
          console.log("匿名ユーザーでサインインしました");
        }
      }

      // 新規会員登録の検出（ユーザーが不在→存在に変わった場合）
      if (!previousUser && newUser && event === "SIGNED_IN") {
        setIsNewUser(true);
      }

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
          // ログアウト時の処理はsignOutメソッドに一元化
          console.log(
            "ログアウト検出: ユーザー状態の変更をsignOutメソッドで処理"
          );
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
      // OTP検証が成功したら匿名状態を解除
      setIsAnonymous(false);
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

      // ユーザーが匿名ですでにログインしている場合
      if (user && isAnonymous) {
        // メールアドレスの紐付けを行う
        await linkEmailToUser(email);
      } else {
        // 通常のメールサインイン
        await AuthService.signInWithEmail(email);
      }

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
      console.log("ログアウト処理を開始");

      // 1. 認証サービスでのログアウト処理
      console.log("認証サービスのログアウト処理を呼び出し");
      await AuthService.signOut();

      // 2. ユーザー状態のクリア
      console.log("ユーザー状態をクリア");
      setUser(null);
      setVerificationSuccess(false);
      setIsAnonymous(false);

      // 3. ストレージ切り替え処理
      console.log("ローカルストレージに切り替え");
      try {
        // ローカルデータをクリア
        console.log("ローカルデータをクリア");
        await StorageMigrationService.clearLocalData();

        // ローカルストレージに切り替え
        console.log("ストレージをローカルに切り替え");
        await StorageMigrationService.switchToLocalStorage();
        console.log("ストレージの切り替え完了");
      } catch (storageError) {
        console.error("ストレージ切り替えエラー:", storageError);
        // ストレージエラーが発生しても認証自体は続行
      }

      // 4. 自動的に新しい匿名アカウントでサインイン
      await autoSignInAnonymously();

      console.log("ログアウト処理が完了");
    } catch (error) {
      console.error("ログアウトエラー:", error);
      setError(filterError(error as Error));
    } finally {
      setLoading(false);
    }
  };

  // アカウント削除（退会処理）
  const deleteAccount = async () => {
    setLoading(true);
    try {
      console.log("アカウント削除処理を開始");
      const result = await AuthService.deleteAccount();
      console.log("アカウント削除の結果:", result);

      // アカウント削除が成功した場合、ユーザー状態をクリア
      setUser(null);
      setIsAnonymous(false);
      setLoading(false);

      // 自動的に新しい匿名アカウントでサインイン
      await autoSignInAnonymously();

      // 明示的に成功を返す
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
  // 匿名認証を使用する場合は常に成功を返す
  const migrateLocalDataToSupabase = async () => {
    return true;
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
    migrateLocalDataToSupabase,
    isNewUser,
    isAnonymous,
    linkEmailToUser,
  };
}
