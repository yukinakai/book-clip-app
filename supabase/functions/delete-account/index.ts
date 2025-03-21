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
    // リクエストの認証情報を取得
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("認証ヘッダーが見つかりません");
      throw new Error("認証情報がありません");
    }

    // 環境変数の確認
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      console.error("必要な環境変数が設定されていません");
      throw new Error("サーバー設定が不完全です");
    }

    // ユーザーコンテキストを使用してSupabaseクライアントを作成
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // 現在のユーザー情報を取得
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
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // ユーザーアカウントを削除
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      console.error("ユーザー削除に失敗:", deleteError);
      throw deleteError;
    }

    console.log("ユーザーが正常に削除されました:", user.id);

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
    console.error("エラーが発生しました:", error);
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
