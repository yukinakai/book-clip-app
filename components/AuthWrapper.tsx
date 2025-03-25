import React, { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuthContext } from "../contexts/AuthContext";
import DataMigrationConfirmDialog from "./DataMigrationConfirmDialog";
import { DataMigrationProgress } from "./DataMigrationProgress";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const {
    user,
    loading,
    showMigrationConfirm,
    hasLocalData,
    cancelMigration,
    migrateLocalDataToSupabase,
    migrationProgress,
    showMigrationProgress,
  } = useAuthContext();
  const [migrationLoading, setMigrationLoading] = useState(false);

  // データ移行処理
  const handleMigrateData = async () => {
    setMigrationLoading(true);
    try {
      await migrateLocalDataToSupabase();
    } catch (error) {
      console.error("データ移行エラー:", error);
    } finally {
      setMigrationLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" testID="activity-indicator" />
      </View>
    );
  }

  // リダイレクトの代わりに、isLoggedInとuserの情報を子コンポーネントに渡す
  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isLoggedIn: !!user,
            user: user,
          });
        }
        return child;
      })}

      {/* データ移行確認ダイアログ */}
      <DataMigrationConfirmDialog
        visible={showMigrationConfirm}
        onClose={cancelMigration}
        onConfirm={handleMigrateData}
        loading={migrationLoading}
        hasLocalData={hasLocalData}
      />

      {/* データ移行進捗ダイアログ */}
      <DataMigrationProgress
        visible={showMigrationProgress}
        progress={migrationProgress}
      />
    </>
  );
}
