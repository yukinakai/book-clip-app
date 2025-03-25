import React, { createContext, useContext, useEffect } from "react";
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
  isNewUser: boolean;
  hasLocalData: boolean;
  showMigrationConfirm: boolean;
  cancelMigration: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  // AuthProvider内でも明示的にinitializeStorageを呼び出し
  useEffect(() => {
    StorageMigrationService.initializeStorage().catch((error) => {
      console.error("Failed to initialize storage in AuthContext:", error);
    });
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
