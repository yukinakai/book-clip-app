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
      throw new Error("認証情報がありません");
    }

    // ユーザーコンテキストを使用してSupabaseクライアントを作成
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // 現在のユーザー情報を取得
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw userError || new Error("ユーザーが見つかりません");
    }

    // 管理者権限を持つクライアントを作成
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 関連データがあれば削除（例：ユーザープロフィール画像など）
    // const { error: storageError } = await supabaseAdmin
    //   .storage
    //   .from('avatars')
    //   .remove([`${user.id}.jpg`])

    // ユーザーアカウントを削除
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) throw deleteError;

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
    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
