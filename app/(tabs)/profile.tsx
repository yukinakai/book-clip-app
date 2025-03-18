import React from "react";
import { StyleSheet, Text, View, SafeAreaView } from "react-native";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? "light";

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme].text }]}>
          プロフィール
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.contentText, { color: Colors[colorScheme].text }]}>
          プロフィール画面の内容をここに表示します。
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E0D1",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  contentText: {
    fontSize: 16,
    textAlign: "center",
  },
});
