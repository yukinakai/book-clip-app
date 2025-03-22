import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthContext } from "@/contexts/AuthContext";
import WithdrawConfirmDialog from "@/components/WithdrawConfirmDialog";
import { DataMigrationProgress } from "../../components/DataMigrationProgress";

// メニュー項目の型定義
type MenuItem = {
  id: string;
  title: string;
  icon: string;
};

export default function OthersScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const {
    user,
    signOut,
    deleteAccount,
    migrateLocalDataToSupabase,
    migrationProgress,
    showMigrationProgress,
  } = useAuthContext();
  const [withdrawDialogVisible, setWithdrawDialogVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // メニュー項目の定義
  const menuItems: MenuItem[] = user
    ? [
        // ログイン済みのメニュー項目
        { id: "logout", title: "ログアウト", icon: "log-out-outline" },
        { id: "withdraw", title: "退会", icon: "trash-outline" },
        { id: "terms", title: "利用規約", icon: "document-text-outline" },
        {
          id: "privacy",
          title: "プライバシーポリシー",
          icon: "shield-checkmark-outline",
        },
        {
          id: "contact",
          title: "不具合報告・問い合わせ",
          icon: "chatbox-ellipses-outline",
        },
      ]
    : [
        // 未ログインのメニュー項目
        { id: "register", title: "会員登録", icon: "person-add-outline" },
        { id: "login", title: "ログイン", icon: "log-in-outline" },
        { id: "terms", title: "利用規約", icon: "document-text-outline" },
        {
          id: "privacy",
          title: "プライバシーポリシー",
          icon: "shield-checkmark-outline",
        },
        {
          id: "contact",
          title: "不具合報告・問い合わせ",
          icon: "chatbox-ellipses-outline",
        },
      ];

  const handleWithdraw = async () => {
    setIsLoading(true);
    try {
      await deleteAccount();
      setWithdrawDialogVisible(false);
      // 退会後はホーム画面に戻る
      router.replace("/(tabs)");
    } catch (error) {
      console.error("退会処理エラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // データ移行処理
  const handleMigrateData = async () => {
    if (!user) return;

    try {
      await migrateLocalDataToSupabase();
    } catch (error) {
      console.error("データ移行エラー:", error);
    }
  };

  const handleMenuPress = (id: string) => {
    console.log(`メニュー「${id}」が押されました`);

    switch (id) {
      case "register":
        // 会員登録画面に遷移（returnToパラメータをつけて戻り先を指定）
        router.push("/login?mode=register&returnTo=/(tabs)/others");
        break;
      case "login":
        // ログイン画面に遷移
        router.push("/login?returnTo=/(tabs)/others");
        break;
      case "logout":
        // ログアウト処理
        signOut();
        break;
      case "withdraw":
        // 退会確認ダイアログを表示
        setWithdrawDialogVisible(true);
        break;
      case "terms":
        // 利用規約画面に遷移
        break;
      case "privacy":
        // プライバシーポリシー画面に遷移
        break;
      case "contact":
        // 問い合わせ画面に遷移
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme].text }]}>
          その他
        </Text>
      </View>

      <View style={styles.content}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleMenuPress(item.id)}
            testID={`menu-item-${item.id}`}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons
                name={item.icon as any}
                size={24}
                color={Colors[colorScheme].text}
              />
            </View>
            <Text
              style={[styles.menuText, { color: Colors[colorScheme].text }]}
            >
              {item.title}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors[colorScheme].text}
              style={styles.arrowIcon}
            />
          </TouchableOpacity>
        ))}

        {/* ログイン済みかつデバッグモードの場合のみ表示（開発環境でのテスト用） */}
        {user && __DEV__ && (
          <TouchableOpacity
            style={[styles.menuItem, styles.devMenuItem]}
            onPress={handleMigrateData}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons
                name="cloud-upload-outline"
                size={24}
                color={Colors[colorScheme].text}
              />
            </View>
            <Text
              style={[styles.menuText, { color: Colors[colorScheme].text }]}
            >
              ローカルデータを同期（開発用）
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 退会確認ダイアログ */}
      <WithdrawConfirmDialog
        visible={withdrawDialogVisible}
        onClose={() => setWithdrawDialogVisible(false)}
        onConfirm={handleWithdraw}
        loading={isLoading}
      />

      {/* データ移行進捗ダイアログ */}
      <DataMigrationProgress
        visible={showMigrationProgress}
        progress={migrationProgress}
      />
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
    padding: 16,
  },
  contentText: {
    fontSize: 16,
    textAlign: "center",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E0D1",
  },
  devMenuItem: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: "#E8E0D1",
    opacity: 0.7,
  },
  menuIconContainer: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
  },
  arrowIcon: {
    marginLeft: 8,
  },
});
