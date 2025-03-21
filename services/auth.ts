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
      const { error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      // ユーザーに関連するデータを削除する処理
      // 注: 関連テーブルにRLSポリシーが適切に設定されていれば、
      // ON DELETEのカスケード処理やRLSポリシーによって自動的に削除されます

      // ユーザー自身を削除
      const { error: deleteError } = await supabase.auth.admin
        .deleteUser
        // この実装方法はセキュリティ上の理由から実際には機能しません
        // サーバーサイドのEdge Functionなどで実装する必要があります
        // これはあくまでデモンストレーション用のコードです
        ();
      if (deleteError) throw deleteError;
    } catch (error) {
      console.error("アカウント削除エラー:", error);
      throw error;
    }
  }
}
