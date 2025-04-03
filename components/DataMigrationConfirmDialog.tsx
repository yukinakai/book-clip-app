import React from "react";
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Colors } from "../constants/Colors";
import { useColorScheme } from "../hooks/useColorScheme";
import { ThemedText } from "./ThemedText";

interface DataMigrationConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  hasLocalData: boolean;
}

export default function DataMigrationConfirmDialog({
  visible,
  onClose,
  onConfirm,
  loading,
  hasLocalData,
}: DataMigrationConfirmDialogProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  // ローカルデータがない場合はダイアログを表示しない
  if (!hasLocalData) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      testID="data-migration-confirm-dialog"
    >
      <View style={styles.centeredView}>
        <View
          style={[styles.modalView, { backgroundColor: colors.background }]}
        >
          <ThemedText style={styles.title}>データ移行の確認</ThemedText>
          <ThemedText style={styles.message}>
            端末に保存されているデータをクラウドに移行しますか？移行したデータはどの端末からでもアクセスできるようになります。
          </ThemedText>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                { borderColor: colors.divider },
              ]}
              onPress={onClose}
              disabled={loading}
              testID="data-migration-cancel-button"
            >
              <ThemedText style={styles.buttonText}>キャンセル</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={onConfirm}
              disabled={loading}
              testID="data-migration-confirm-button"
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <ThemedText style={[styles.buttonText, { color: "white" }]}>
                  移行する
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: width * 0.85,
    borderRadius: 12,
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
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  button: {
    width: "48%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    borderWidth: 0,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
