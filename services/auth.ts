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
      console.log("アカウント削除開始");
      // 現在のセッションを取得
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("セッション取得エラー:", sessionError);
        throw sessionError;
      }

      if (!session) {
        console.error("セッションが見つかりません");
        throw new Error("認証セッションが見つかりません");
      }

      console.log("アクセストークンを取得しました");

      try {
        // Edge Functionを呼び出してアカウントを削除
        const { data, error: functionError } = await supabase.functions.invoke(
          "delete-account",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (functionError) {
          console.error("Edge Function呼び出しエラー:", {
            message: functionError.message,
            details: functionError.context,
            name: functionError.name,
            stack: functionError.stack,
          });
          throw new Error(
            `アカウント削除に失敗しました: ${functionError.message}`
          );
        }

        if (!data?.success) {
          console.error("アカウント削除失敗レスポンス:", data);
          throw new Error(
            data?.error ||
              "アカウント削除に失敗しました。管理者に連絡してください。"
          );
        }

        console.log("アカウント削除成功:", data);
        return data;
      } catch (functionCallError: unknown) {
        console.error("Edge Function処理エラー:", functionCallError);
        // FunctionInvocationErrorの場合はレスポンスのエラー内容も取得
        if (
          functionCallError instanceof Error &&
          functionCallError.message.includes("returned a non-2xx status code")
        ) {
          try {
            // エラーレスポンスのボディを解析（可能であれば）
            console.error(
              "サーバーエラーが発生しました。Edge Function処理に失敗しました。"
            );
          } catch (parseError) {
            console.error("エラーレスポンスの解析に失敗:", parseError);
          }
        }
        throw functionCallError;
      }
    } catch (error) {
      console.error("アカウント削除エラー:", error);
      throw error;
    }
  }
}
