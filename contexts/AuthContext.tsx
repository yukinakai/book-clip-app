import React, { createContext, useContext, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { User } from "@supabase/supabase-js";
import { MigrationProgress } from "../services/StorageMigrationService";
import { StorageMigrationService } from "../services/StorageMigrationService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  emailSent: boolean;
  migrationProgress: MigrationProgress;
  showMigrationProgress: boolean;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  migrateLocalDataToSupabase: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  // アプリ起動時にストレージを初期化
  useEffect(() => {
    const initStorage = async () => {
      try {
        await StorageMigrationService.initializeStorage();
        console.log("ストレージを初期化しました");
      } catch (error) {
        console.error("ストレージ初期化エラー:", error);
      }
    };

    initStorage();
  }, []);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
