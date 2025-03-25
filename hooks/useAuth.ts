import { useState, useEffect } from "react";
import { AuthService, supabase } from "../services/auth";
import { User } from "@supabase/supabase-js";
import {
  StorageMigrationService,
  MigrationProgress,
} from "../services/StorageMigrationService";
import { LocalStorageService } from "../services/LocalStorageService";

// 無視するエラーメッセージのリスト
const IGNORED_ERROR_MESSAGES = ["auth session missing", "session not found"];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // 会員登録検出のための状態
  const [isNewUser, setIsNewUser] = useState(false);
  const [hasLocalData, setHasLocalData] = useState(false);
  const [showMigrationConfirm, setShowMigrationConfirm] = useState(false);

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

  // ローカルデータの存在確認
  const checkLocalData = async () => {
    try {
      const localStorage = new LocalStorageService();
      const books = await localStorage.getAllBooks();
      const clips = await localStorage.getAllClips();
      return books.length > 0 || clips.length > 0;
    } catch (error) {
      console.error("Failed to check local data:", error);
      return false;
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
      const previousUser = user;

      // 新規会員登録の検出（ユーザーが不在→存在に変わった場合）
      if (!previousUser && newUser && event === "SIGNED_IN") {
        setIsNewUser(true);

        // ローカルデータがあるか確認
        const hasData = await checkLocalData();
        setHasLocalData(hasData);

        if (hasData) {
          // データ移行確認ダイアログを表示
          setShowMigrationConfirm(true);
        }
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
      console.log("ログアウト処理を開始");

      // 1. 認証サービスでのログアウト処理
      console.log("認証サービスのログアウト処理を呼び出し");
      await AuthService.signOut();

      // 2. ユーザー状態のクリア
      console.log("ユーザー状態をクリア");
      setUser(null);
      setVerificationSuccess(false);

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
      setLoading(false);

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

  // データ移行のキャンセル
  const cancelMigration = () => {
    setShowMigrationConfirm(false);
  };

  // 会員登録時のデータ移行処理
  const migrateLocalDataToSupabase = async () => {
    if (!user) return false;

    try {
      setShowMigrationConfirm(false);
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
    isNewUser,
    hasLocalData,
    showMigrationConfirm,
    cancelMigration,
  };
}
