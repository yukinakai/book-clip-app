import React from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuthContext } from "../contexts/AuthContext";

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

  // リダイレクトの代わりに、isLoggedInとuserの情報を子コンポーネントに渡す
  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            isLoggedIn: !!user,
            user: user,
          });
        }
        return child;
      })}
    </>
  );
}
