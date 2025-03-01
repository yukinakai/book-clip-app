import { useState, useEffect } from 'react';
import { User, AuthSession } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 現在のセッションを取得
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('セッションの取得に失敗しました:', error.message);
        return;
      }

      if (data.session?.user) {
        setUser(data.session.user);
        setIsAuthenticated(true);
      }
    };

    checkSession();

    // 認証状態の変更を監視
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );

    // クリーンアップ関数
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('ログアウトに失敗しました:', error.message);
      return;
    }

    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    signOut,
  };
};
