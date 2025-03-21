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
      console.error("認証ヘッダーが見つかりません", {
        headers: Object.fromEntries(req.headers.entries()),
      });
      throw new Error("認証情報がありません");
    }

    // 環境変数の確認
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("必要な環境変数が設定されていません", {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceRoleKey,
      });
      throw new Error("サーバー設定が不完全です");
    }

    // 管理者権限を持つクライアントを作成
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 認証トークンからユーザー情報を取得
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user: tokenUser },
      error: tokenError,
    } = await supabaseAdmin.auth.getUser(token);

    if (tokenError) {
      console.error("トークンからのユーザー取得に失敗:", {
        error: tokenError,
        token: token.substring(0, 20) + "...", // トークンの一部のみをログ
      });
      throw tokenError;
    }

    if (!tokenUser) {
      console.error("ユーザーが見つかりません");
      throw new Error("ユーザーが見つかりません");
    }

    console.log("削除するユーザーID:", tokenUser.id);

    // ユーザーアカウントを削除
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      tokenUser.id
    );

    if (deleteError) {
      console.error("ユーザー削除に失敗:", {
        error: deleteError,
        userId: tokenUser.id,
      });
      throw deleteError;
    }

    console.log("ユーザーが正常に削除されました:", tokenUser.id);

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
