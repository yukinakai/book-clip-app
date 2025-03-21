import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Colors } from "../constants/Colors";
import { useColorScheme } from "../hooks/useColorScheme";

interface WithdrawConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export default function WithdrawConfirmDialog({
  visible,
  onClose,
  onConfirm,
  loading,
}: WithdrawConfirmDialogProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View
          style={[styles.modalView, { backgroundColor: colors.cardBackground }]}
        >
          <Text style={[styles.title, { color: colors.text }]}>退会の確認</Text>
          <Text style={[styles.message, { color: colors.text }]}>
            退会すると、アカウントに関連するすべてのデータが削除され、元に戻すことはできません。
            本当に退会しますか？
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
              testID="withdraw-cancel-button"
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
              disabled={loading}
              testID="withdraw-confirm-button"
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                  testID="withdraw-loading"
                />
              ) : (
                <Text style={styles.confirmButtonText}>退会する</Text>
              )}
            </TouchableOpacity>
          </View>
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
    backgroundColor: "rgba(0, 0, 0, 0.8)",
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
    width: "85%",
    maxWidth: 500,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    minWidth: "45%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
  },
  confirmButton: {
    backgroundColor: "#FF3B30",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 16,
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
