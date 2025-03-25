import React from "react";
import { View, Text, Modal, StyleSheet, ActivityIndicator } from "react-native";
import { MigrationProgress } from "../services/StorageMigrationService";
import { Colors } from "../constants/Colors";
import { useColorScheme } from "../hooks/useColorScheme";

interface DataMigrationProgressProps {
  visible: boolean;
  progress: MigrationProgress;
}

/**
 * データ移行の進捗状況を表示するコンポーネント
 */
export function DataMigrationProgress({
  visible,
  progress,
}: DataMigrationProgressProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  // パーセンテージの計算（0分割を回避）
  const percentage =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  // 状態に応じたメッセージを表示
  let statusMessage = "";
  switch (progress.status) {
    case "migrating":
      statusMessage = "データを移行中です...";
      break;
    case "completed":
      statusMessage = "データの移行が完了しました！";
      break;
    case "failed":
      statusMessage = `エラーが発生しました: ${
        progress.error?.message || "不明なエラー"
      }`;
      break;
  }

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.centeredView}>
        <View
          style={[styles.modalView, { backgroundColor: colors.background }]}
          testID="migration-modal"
        >
          <Text style={[styles.title, { color: colors.text }]}>データ移行</Text>

          {progress.status === "migrating" && (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={styles.spinner}
              testID="migration-spinner"
            />
          )}

          <Text style={[styles.statusText, { color: colors.text }]}>
            {statusMessage}
          </Text>

          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                { backgroundColor: colors.primary },
                { width: `${percentage}%` },
              ]}
              testID="migration-progress-bar"
            />
          </View>

          <Text style={[styles.progressText, { color: colors.text }]}>
            {progress.current} / {progress.total} ({percentage}%)
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    borderRadius: 10,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  statusText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  progressContainer: {
    height: 10,
    width: "100%",
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
  },
  spinner: {
    marginBottom: 16,
  },
});
