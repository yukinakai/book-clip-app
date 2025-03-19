# Book Clip App

本の名言を共有するためのアプリケーション

## 機能

- メールアドレスによるパスワードレス認証（マジックリンク）
- 本の名言の保存
- 名言の共有
- 検索機能

## 開発環境のセットアップ

1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/book-clip-app.git
cd book-clip-app
```

2. 依存パッケージのインストール

```bash
npm install
```

3. 環境変数の設定

```bash
cp .env.sample .env
```

`.env`ファイルを編集し、必要な環境変数を設定してください。

### 必要な環境変数

- `EXPO_PUBLIC_SUPABASE_URL`: Supabase プロジェクトの URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase プロジェクトの匿名キー
- `EXPO_PUBLIC_AUTH_REDIRECT_URL`: 認証後のリダイレクト URL
- `EXPO_PUBLIC_RAKUTEN_APP_ID`: 楽天 API のアプリケーション ID（書籍情報の取得に使用）
- `EXPO_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY`: Google Cloud Vision API キー（OCR 機能に使用）

### Supabase の設定

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. Authentication > Email providers で Email 認証を有効化
3. Email Template を必要に応じてカスタマイズ
4. 本番環境では適切なリダイレクト URL を設定

## 開発サーバーの起動

```bash
npm start
```

## テストの実行

```bash
npm test
```

## ライセンス

MIT
