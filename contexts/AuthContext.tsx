import React, { createContext, useContext } from "react";
import { useAuth } from "../hooks/useAuth";
import { User } from "@supabase/supabase-js";
import {
  MigrationProgress,
  StorageMigrationService,
} from "../services/StorageMigrationService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  emailSent: boolean;
  migrationProgress: MigrationProgress;
  showMigrationProgress: boolean;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;
  migrateLocalDataToSupabase: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  // useAuthフックで認証状態の変更を監視し、ストレージを初期化
  // useAuthフック内で既にStorageMigrationService.initializeStorageが呼ばれているため、
  // ここでの初期化は不要

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
