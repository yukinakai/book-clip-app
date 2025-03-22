# 要件
ログイン関連機能を利用して以下を実現したい
- 会員登録時にsupabaseに端末に保存済みの書籍とクリップの情報を全て登録する
- ログイン状態の際には、新たに登録する書籍やクリップは端末に保存されず全てSupabaseに保存される
- ログイン状態の際には、supabaseから取得した書籍やクリップを表示する
- ログイン状態の際には、端末に保存されている書籍やクリプは参照しない＝supabaseのデータだけ参照する
- 会員登録・ログイン・ログアウトの際には端末に保存されている書籍やクリップデータを削除する

# 認証とデータ移行の実装仕様

## 概要
ログイン機能の実装に伴い、データストレージをローカルストレージからSupabaseに移行する機能を実装する。

## 基本方針
- ログイン状態では全てのデータをSupabaseで管理
- 未ログイン状態ではローカルストレージでデータを管理
- オフライン時はログイン状態での操作を制限

## 主要機能

### 1. データストレージの切り替え
```typescript
interface StorageService {
  isAuthenticated: boolean;
  switchToSupabase(): void;
  switchToLocal(): void;
  clearLocalData(): Promise<void>;
}
```

### 2. データ移行処理
```typescript
interface MigrationService {
  migrateToSupabase(): Promise<{
    total: number;
    processed: number;
    failed: number;
  }>;
}
```

### 3. 認証状態変更時の処理
- SIGNED_IN: Supabaseストレージに切り替え
- SIGNED_OUT: ローカルデータを削除し、ローカルストレージに切り替え
- 会員登録時: ローカルデータをSupabaseに移行

### 4. プログレス表示
```typescript
interface MigrationProgress {
  total: number;
  current: number;
  status: 'migrating' | 'completed' | 'failed';
  error?: Error;
}
```

### 5.オフライン制限
```typescript
const checkOnlineStatus = () => {
  if (!navigator.onLine && isAuthenticated) {
    return {
      canProceed: false,
      message: 'オンライン接続が必要です'
    };
  }
  return { canProceed: true };
};
```

## 実装順序
1. ストレージサービスの拡張
2. データ移行機能の実装
3. プログレス表示の実装
4. 認証状態変更時の処理実装
5. オフライン制限の実装

## 認証状態別の動作

### 未ログイン状態
- 書籍・クリップデータはローカルストレージに保存
- オフライン利用可能

### ログイン状態
- 書籍・クリップデータはSupabaseに保存
- オフライン利用不可
- ネットワークエラー時は適切なエラーメッセージを表示

### 状態変更時の処理

#### 会員登録時
1. ローカルデータの存在確認
2. プログレスバーの表示
3. データのSupabaseへの移行
4. ローカルデータの削除
5. Supabaseストレージへの切り替え

#### ログイン時
1. ローカルデータの削除
2. Supabaseストレージへの切り替え

#### ログアウト時
1. ローカルストレージへの切り替え
2. キャッシュデータのクリア

## エラーハンドリング
- データ移行失敗時は適切なエラーメッセージを表示
- ネットワークエラー時はリトライ機能を提供
- データ操作失敗時は操作をロールバック

## セキュリティ
- Supabaseの認証機能を利用したアクセス制御
- ユーザーごとのデータ分離

## 注意事項
- データ移行中のアプリケーション状態の整合性確保
- エラー発生時のユーザーデータ保護
- 適切なユーザーフィードバックの提供