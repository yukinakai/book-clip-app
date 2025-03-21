# Supabase Edge Functions デプロイガイド

## 前提条件

1. Supabase CLI のインストール

```bash
# macOS
brew install supabase/tap/supabase

# Windows (requires scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

2. Supabase へのログイン

```bash
supabase login
```

## デプロイ手順

### 1. 単一の関数をデプロイする場合

```bash
# delete-account関数をデプロイする例
supabase functions deploy delete-account --project-ref your-project-ref
```

### 2. 全ての関数をデプロイする場合

```bash
# functionsディレクトリ内の全ての関数をデプロイ
supabase functions deploy --project-ref your-project-ref
```

## 環境変数の設定

1. プロジェクトの環境変数を設定

```bash
supabase secrets set --project-ref your-project-ref SUPABASE_URL=your-url SUPABASE_SERVICE_ROLE_KEY=your-key
```

2. 環境変数の一覧を確認

```bash
supabase secrets list --project-ref your-project-ref
```

## デプロイ後の確認

1. 関数の一覧を確認

```bash
supabase functions list --project-ref your-project-ref
```

2. ログの確認

```bash
supabase functions logs --project-ref your-project-ref
```

## トラブルシューティング

- デプロイに失敗する場合は、以下を確認してください：

  - Supabase CLI が最新バージョンか
  - プロジェクト ID が正しいか
  - 必要な環境変数が設定されているか
  - Deno のバージョンが互換性があるか

- ログを確認して具体的なエラーメッセージを確認することができます：

```bash
supabase functions logs delete-account --project-ref your-project-ref
```

## 注意事項

- Edge Functions は本番環境でのみ実行されます
- ローカルでのテストは `supabase start` で可能です
- 環境変数は暗号化されて保存されます
- デプロイ後の関数の URL は以下の形式になります：
  `https://<project-ref>.supabase.co/functions/v1/<function-name>`
