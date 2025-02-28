import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// 環境変数の型定義
type Env = {
  EXPO_PUBLIC_SUPABASE_URL: string;
  EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
};

// 環境変数の取得と検証
const getEnvVar = (name: keyof Env): string => {
  const value = Constants.expoConfig?.extra?.[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

// Supabaseクライアントの設定
const supabaseUrl = getEnvVar('EXPO_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY');

// Supabaseクライアントの作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

// Supabaseの型定義（必要に応じて拡張）
export type Database = {
  public: {
    tables: {
      // テーブルの型定義をここに追加
    };
  };
};
