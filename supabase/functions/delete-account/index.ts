import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// CORSヘッダー設定
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // OPTIONSリクエスト（プリフライト）の場合は成功を返す
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("delete-account Edge Function が呼び出されました");

    // リクエストの認証情報を取得
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("認証ヘッダーが見つかりません", {
        headers: Object.fromEntries(req.headers.entries()),
      });
      throw new Error("認証情報がありません");
    }

    // 環境変数の確認 - Supabaseが自動的に提供する環境変数を使用
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("必要な環境変数が設定されていません", {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceRoleKey,
        hasAnonKey: !!supabaseAnonKey,
      });
      throw new Error("サーバー設定が不完全です");
    }

    // 認証トークンを取得
    const token = authHeader.replace("Bearer ", "");
    console.log("認証トークンを取得しました");

    // クライアントの初期化 - 認証ヘッダーを使用
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey || "", {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    console.log("認証されたユーザー情報を取得します");
    // 認証されたユーザー情報を取得
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError) {
      console.error("ユーザー情報の取得に失敗:", userError);
      throw userError;
    }

    if (!user) {
      console.error("ユーザーが見つかりません");
      throw new Error("ユーザーが見つかりません");
    }

    console.log("削除するユーザーID:", user.id);

    // 管理者権限を持つクライアントを作成
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // エラー発生フラグ（データ削除のいずれかのステップでエラーが発生した場合にtrue）
    let hasDataDeletionError = false;
    const errors = [];

    // ユーザーに関連するデータを削除
    try {
      console.log("ユーザーのクリップデータ削除を試みます");
      // 1. ユーザーのクリップデータを削除
      const { error: clipsError } = await supabaseAdmin
        .from("clips")
        .delete()
        .eq("user_id", user.id);

      if (clipsError) {
        console.error("ユーザーのクリップデータ削除に失敗:", clipsError);
        hasDataDeletionError = true;
        errors.push({
          type: "clips_deletion",
          message: clipsError.message,
          details: clipsError.details,
        });
      } else {
        console.log("ユーザーのクリップデータを削除しました");
      }

      console.log("ユーザーの書籍データ削除を試みます");
      // 2. ユーザーの書籍データを削除
      const { error: booksError } = await supabaseAdmin
        .from("books")
        .delete()
        .eq("user_id", user.id);

      if (booksError) {
        console.error("ユーザーの書籍データ削除に失敗:", booksError);
        hasDataDeletionError = true;
        errors.push({
          type: "books_deletion",
          message: booksError.message,
          details: booksError.details,
        });
      } else {
        console.log("ユーザーの書籍データを削除しました");
      }

      // 3. その他のユーザー関連データの削除（必要に応じて追加）
    } catch (dataError) {
      console.error("ユーザーデータの削除中にエラーが発生:", dataError);
      hasDataDeletionError = true;
      errors.push({
        type: "general_data_deletion",
        message:
          dataError instanceof Error ? dataError.message : String(dataError),
      });
      // データ削除エラーは致命的ではないため、続行します
    }

    // ユーザーアカウントを削除
    console.log("ユーザーアカウント削除を試みます");
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      console.error("ユーザー削除に失敗:", {
        error: deleteError,
        userId: user.id,
      });

      // ユーザー削除エラーは致命的なため、エラーレスポンスを返す
      return new Response(
        JSON.stringify({
          success: false,
          error: `ユーザーアカウントの削除に失敗しました: ${deleteError.message}`,
          errors: [
            ...errors,
            {
              type: "user_deletion",
              message: deleteError.message,
              code: deleteError.code,
              status: deleteError.status,
            },
          ],
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log("ユーザーが正常に削除されました:", user.id);

    // データ削除でエラーが発生したが、ユーザー削除は成功した場合
    if (hasDataDeletionError) {
      return new Response(
        JSON.stringify({
          success: true,
          warning: "ユーザーは削除されましたが、一部のデータ削除に失敗しました",
          errors,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // 全て成功
    return new Response(
      JSON.stringify({
        success: true,
        message: "アカウントが正常に削除されました",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("エラーが発生しました:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
