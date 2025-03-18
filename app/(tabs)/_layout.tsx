import { Tabs } from "expo-router";
import React from "react";
import { Platform, TouchableOpacity, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";

// カスタムの中央ボタンコンポーネント
function AddClipButton() {
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();

  const handleAddClip = () => {
    // カメラを開いてクリップ追加画面に遷移するロジック
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
      >
        <Ionicons name="camera" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
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
      />

      {/* 中央の追加ボタンとダミータブ（タブとして機能しないが、スペースを確保するため） */}
      <Tabs.Screen
        name="add-clip-tab"
        options={{
          title: "",
          headerShown: false,
          tabBarIcon: () => <View style={styles.placeholder} />,
          tabBarButton: () => <AddClipButton />,
        }}
        listeners={{
          tabPress: (e) => {
            // タブとして機能させないようにタブのナビゲーションをキャンセル
            e.preventDefault();
          },
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "プロフィール",
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  centerButtonContainer: {
    position: "absolute",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    bottom: 12, // タブバーからの距離を調整
    left: 0,
    right: 0,
    zIndex: 1000, // 確実に他の要素の上に表示
  },
  placeholder: {
    width: 24,
    height: 24,
    opacity: 0, // 完全に透明にする
  },
});
