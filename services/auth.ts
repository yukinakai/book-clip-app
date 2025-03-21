import { createClient } from "@supabase/supabase-js";

// Supabaseの設定
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Supabaseクライアントの初期化
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 認証サービスクラス
export class AuthService {
  // メールによるパスワードレス認証（OTP）の送信
  static async signInWithEmail(email: string) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        // OTP認証ではリダイレクトURLは不要
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("メール認証リンク送信エラー:", error);
      throw error;
    }
  }

  // ログアウト
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("ログアウトエラー:", error);
      throw error;
    }
  }

  // OTPコードの検証
  static async verifyOtp(email: string, otp: string) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        type: "email",
        token: otp,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("OTP検証エラー:", error);
      throw error;
    }
  }

  // 現在の認証状態を取得
  static async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error("ユーザー取得エラー:", error);
      throw error;
    }
  }

  // ユーザーアカウントの削除（退会処理）
  static async deleteAccount() {
    try {
      // 現在のセッションを取得
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) throw new Error("認証セッションが見つかりません");

      // Edge Functionを呼び出してアカウントを削除
      const { data, error: functionError } = await supabase.functions.invoke(
        "delete-account",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (functionError) {
        console.error("Edge Function error:", functionError);
        throw new Error(
          `アカウント削除に失敗しました: ${functionError.message}`
        );
      }

      if (!data?.success) {
        console.error("Account deletion failed:", data);
        throw new Error(
          "アカウント削除に失敗しました。管理者に連絡してください。"
        );
      }

      return data;
    } catch (error) {
      console.error("アカウント削除エラー:", error);
      throw error;
    }
  }
}
