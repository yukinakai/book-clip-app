import React from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuthContext } from "../contexts/AuthContext";
import { Redirect } from "expo-router";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" testID="activity-indicator" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" testID="redirect" />;
  }

  return <>{children}</>;
}
