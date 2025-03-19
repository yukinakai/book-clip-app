import { Tabs } from "expo-router";
import React from "react";
import {
  Platform,
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { AuthWrapper } from "../../components/AuthWrapper";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";

// カスタムの中央ボタンコンポーネント
function AddClipButton({ isLoggedIn }: { isLoggedIn?: boolean }) {
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();

  const handleAddClip = () => {
    // ログイン状態に関わらずカメラを開く
    router.push("/camera/ocr");
  };

  return (
    <View style={styles.centerButtonContainer}>
      <TouchableOpacity
        style={[
          styles.addButton,
          { backgroundColor: Colors[colorScheme].primary },
        ]}
        onPress={handleAddClip}
        activeOpacity={0.7}
        testID="add-clip-button"
      >
        <View style={styles.buttonContent}>
          <Ionicons name="camera" size={28} color="white" />
          <Text style={styles.buttonText}>クリップを追加</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function TabLayout({
  isLoggedIn,
  user,
}: {
  isLoggedIn?: boolean;
  user?: any;
}) {
  const colorScheme = useColorScheme();

  return (
    <AuthWrapper>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: {
            ...Platform.select({
              ios: {
                position: "absolute",
              },
              default: {},
            }),
            height: 70,
            paddingBottom: 10,
          },
          tabBarItemStyle: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "ホーム",
            tabBarIcon: ({ color }: { color: string }) => (
              <IconSymbol size={28} name="house.fill" color={color} />
            ),
          }}
          initialParams={{ isLoggedIn, user }}
        />

        {/* 中央の追加ボタンとダミータブ（タブとして機能しないが、スペースを確保するため） */}
        <Tabs.Screen
          name="add-clip-tab"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: () => <View style={styles.placeholder} />,
            tabBarButton: () => <AddClipButton isLoggedIn={isLoggedIn} />,
          }}
          listeners={{
            tabPress: (e) => {
              // タブとして機能させないようにタブのナビゲーションをキャンセル
              e.preventDefault();
            },
          }}
          initialParams={{ isLoggedIn, user }}
        />

        <Tabs.Screen
          name="search"
          options={{
            title: "検索",
          }}
          initialParams={{ isLoggedIn, user }}
        />

        <Tabs.Screen
          name="others"
          options={{
            title: "その他",
            tabBarIcon: ({ color }: { color: string }) => (
              <IconSymbol size={28} name="ellipsis.circle.fill" color={color} />
            ),
          }}
          initialParams={{ isLoggedIn, user }}
        />
      </Tabs>
    </AuthWrapper>
  );
}

const styles = StyleSheet.create({
  addButton: {
    width: 170,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 7,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
    marginLeft: 8,
  },
  centerButtonContainer: {
    position: "absolute",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    bottom: 20,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  placeholder: {
    width: 24,
    height: 24,
    opacity: 0,
  },
});
