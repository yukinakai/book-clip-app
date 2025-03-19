import { createClient } from "@supabase/supabase-js";

// Supabaseの設定
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Supabaseクライアントの初期化
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 認証サービスクラス
export class AuthService {
  // メールによるパスワードレス認証リンクの送信
  static async signInWithEmail(email: string) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL,
        },
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
  static async verifyOtp(otp: string) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
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
}
