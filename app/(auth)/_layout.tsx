import { Stack } from "expo-router";
import { useThemeColor } from "../../hooks/useThemeColor";

export default function AuthLayout() {
  const backgroundColor = useThemeColor({}, "background");

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor },
      }}
    />
  );
}
