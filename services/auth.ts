import { createClient } from "@supabase/supabase-js";

// Supabaseの設定
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Supabaseクライアントの初期化
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 認証サービスクラス
export class AuthService {
  // 匿名サインイン
  static async signInAnonymously() {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("匿名サインインエラー:", error);
      throw error;
    }
  }

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

  // アノニマスユーザーにメールアドレスを紐付ける
  static async linkEmailToAnonymousUser(email: string) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        email,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("メールアドレス紐付けエラー:", error);
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
        // 直接fetchを使用してEdge Functionを呼び出す
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error("環境変数が設定されていません");
        }

        console.log("Edge Function直接呼び出し開始");
        const response = await fetch(
          `${supabaseUrl}/functions/v1/delete-account`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
              apikey: supabaseAnonKey,
            },
            body: JSON.stringify({
              userId: session.user.id,
              action: "delete_account",
            }),
          }
        );

        console.log("Edge Function呼び出し完了", {
          status: response.status,
          statusText: response.statusText,
        });

        // レスポンスを解析
        const data = await response.json();
        console.log("レスポンスデータ:", data);

        if (!response.ok) {
          console.error("アカウント削除失敗レスポンス:", data);
          throw new Error(data?.error || "アカウント削除に失敗しました");
        }

        console.log("アカウント削除成功:", data);
        return data;
      } catch (functionCallError) {
        console.error("Edge Function処理エラー:", functionCallError);
        if (functionCallError instanceof Error) {
          console.error("エラーメッセージ:", functionCallError.message);
          console.error("エラースタック:", functionCallError.stack);
        }
        throw functionCallError;
      }
    } catch (error) {
      console.error("アカウント削除エラー:", error);
      throw error;
    }
  }
}
