import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "../contexts/AuthContext";
import { useColorScheme } from "../hooks/useColorScheme";
import { useThemeColor } from "../hooks/useThemeColor";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// オンボーディング完了のフラグをAsyncStorageに保存するキー
const ONBOARDING_COMPLETE_KEY = "@bookclip:onboarding_complete";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, "background");
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(
    null
  );
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    // アプリケーションのロード時にオンボーディングが完了しているか確認
    const checkOnboardingStatus = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        setOnboardingComplete(value === "true");
      } catch (error) {
        console.error("オンボーディング状態の取得に失敗しました", error);
        setOnboardingComplete(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (loaded && onboardingComplete !== null) {
      SplashScreen.hideAsync();
    }
  }, [loaded, onboardingComplete]);

  if (!loaded || onboardingComplete === null) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <PaperProvider>
          <AuthProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor },
              }}
              initialRouteName={onboardingComplete ? "(tabs)" : "onboarding"}
            >
              <Stack.Screen
                name="onboarding"
                options={{ headerShown: false, gestureEnabled: false }}
              />
              <Stack.Screen
                name="(auth)"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen name="book/[id]" options={{ headerShown: false }} />
              <Stack.Screen
                name="book/add-clip"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="book/edit" options={{ headerShown: false }} />
              <Stack.Screen
                name="book/select"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="camera" options={{ headerShown: false }} />
              <Stack.Screen name="clip/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </AuthProvider>
        </PaperProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
