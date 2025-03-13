import React from "react";
import { render, fireEvent, waitFor } from "../../test-utils";
import ClipDetailScreen from "../../../app/clip/[id]";
import { ClipStorageService } from "../../../services/ClipStorageService";
import { Alert } from "react-native";

// モックの設定
jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn().mockReturnValue({
    id: "test-clip-id",
  }),
  useRouter: jest.fn().mockReturnValue({
    back: jest.fn(),
    push: jest.fn(),
  }),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons-Mock",
}));

// ClipStorageServiceのモック
const mockClip = {
  id: "test-clip-id",
  bookId: "test-book-id",
  text: "テストクリップテキスト",
  page: 42,
  createdAt: "2023-06-15T10:30:00Z",
};

jest.mock("../../../services/ClipStorageService", () => ({
  ClipStorageService: {
    getAllClips: jest.fn().mockResolvedValue([mockClip]),
    updateClip: jest.fn().mockResolvedValue(undefined),
    removeClip: jest.fn().mockResolvedValue(undefined),
  },
}));

// Alertのモック
jest.spyOn(Alert, "alert").mockImplementation((title, message, buttons) => {
  // 削除確認アラートの場合、削除を実行
  if (title === "確認" && buttons && buttons.length > 1) {
    const deleteButton = buttons.find((b) => b.text === "削除");
    if (deleteButton && deleteButton.onPress) {
      deleteButton.onPress();
    }
  }
});

describe("ClipDetailScreen", () => {
  beforeEach(() => {
    // テスト前に各モックをリセット
    jest.clearAllMocks();
  });

  it("クリップ詳細画面が正しく表示されること", async () => {
    const { getByText, getByTestId } = render(<ClipDetailScreen />);

    // データが読み込まれるのを待つ
    await waitFor(() => {
      // 画面タイトルが表示されていることを確認
      expect(getByText("クリップ編集")).toBeTruthy();

      // 入力フィールドが表示されていることを確認
      expect(getByText("クリップテキスト")).toBeTruthy();
      expect(getByText("ページ")).toBeTruthy();

      // ボタンが表示されていることを確認
      expect(getByText("更新")).toBeTruthy();
      expect(getByText("削除")).toBeTruthy();

      // 初期値が正しく設定されていることを確認
      const textInput = getByTestId("clip-text-input");
      const pageInput = getByTestId("clip-page-input");
      expect(textInput.props.value).toBe("テストクリップテキスト");
      expect(pageInput.props.value).toBe("42");
    });
  });

  it("テキスト入力とページ番号入力が機能すること", async () => {
    const { getByTestId } = render(<ClipDetailScreen />);

    await waitFor(() => {
      // テキスト入力のテスト
      const textInput = getByTestId("clip-text-input");
      fireEvent.changeText(textInput, "更新されたクリップテキスト");

      // ページ番号入力のテスト
      const pageInput = getByTestId("clip-page-input");
      fireEvent.changeText(pageInput, "100");

      // 入力値が更新されていることを確認
      expect(textInput.props.value).toBe("更新されたクリップテキスト");
      expect(pageInput.props.value).toBe("100");
    });
  });

  it("空のテキストで更新しようとするとエラーが表示されること", async () => {
    const { getByTestId } = render(<ClipDetailScreen />);

    await waitFor(async () => {
      // テキストを空にする
      const textInput = getByTestId("clip-text-input");
      fireEvent.changeText(textInput, "");

      // 更新ボタンを押す
      const updateButton = getByTestId("update-clip-button");
      fireEvent.press(updateButton);

      // エラーアラートが表示されることを確認
      expect(Alert.alert).toHaveBeenCalledWith(
        "エラー",
        "クリップテキストを入力してください"
      );

      // updateClipが呼ばれていないことを確認
      expect(ClipStorageService.updateClip).not.toHaveBeenCalled();
    });
  });

  it("無効なページ番号でエラーが表示されること", async () => {
    const { getByTestId } = render(<ClipDetailScreen />);

    await waitFor(async () => {
      // ページ番号を無効な値に変更
      const pageInput = getByTestId("clip-page-input");
      fireEvent.changeText(pageInput, "0");

      // 更新ボタンを押す
      const updateButton = getByTestId("update-clip-button");
      fireEvent.press(updateButton);

      // エラーアラートが表示されることを確認
      expect(Alert.alert).toHaveBeenCalledWith(
        "エラー",
        "有効なページ番号を入力してください"
      );

      // updateClipが呼ばれていないことを確認
      expect(ClipStorageService.updateClip).not.toHaveBeenCalled();
    });
  });

  it("有効な入力でクリップが更新され、前の画面に戻ること", async () => {
    const { getByTestId } = render(<ClipDetailScreen />);
    const router = require("expo-router").useRouter();

    await waitFor(async () => {
      // テキストを更新
      const textInput = getByTestId("clip-text-input");
      fireEvent.changeText(textInput, "更新されたクリップテキスト");

      // ページ番号を更新
      const pageInput = getByTestId("clip-page-input");
      fireEvent.changeText(pageInput, "100");

      // 更新ボタンを押す
      const updateButton = getByTestId("update-clip-button");
      fireEvent.press(updateButton);

      // 非同期処理の完了を待つ
      await waitFor(() => {
        // updateClipが正しく呼ばれたことを確認
        expect(ClipStorageService.updateClip).toHaveBeenCalledWith(
          expect.objectContaining({
            id: "test-clip-id",
            text: "更新されたクリップテキスト",
            page: 100,
          })
        );

        // 前の画面に戻ることを確認
        expect(router.back).toHaveBeenCalled();
      });
    });
  });

  it("削除ボタンを押すと確認ダイアログが表示され、削除が実行されること", async () => {
    const { getByTestId } = render(<ClipDetailScreen />);
    const router = require("expo-router").useRouter();

    await waitFor(async () => {
      // 削除ボタンを押す
      const deleteButton = getByTestId("delete-clip-button");
      fireEvent.press(deleteButton);

      // 確認ダイアログが表示されることを確認
      expect(Alert.alert).toHaveBeenCalledWith(
        "確認",
        "このクリップを削除してもよろしいですか？",
        expect.arrayContaining([
          expect.objectContaining({ text: "キャンセル" }),
          expect.objectContaining({ text: "削除" }),
        ]),
        { cancelable: true }
      );

      // 非同期処理の完了を待つ
      await waitFor(() => {
        // removeClipが正しく呼ばれたことを確認
        expect(ClipStorageService.removeClip).toHaveBeenCalledWith(
          "test-clip-id"
        );

        // 前の画面に戻ることを確認
        expect(router.back).toHaveBeenCalled();
      });
    });
  });

  it("戻るボタンを押すと前の画面に戻ること", async () => {
    const { getByTestId } = render(<ClipDetailScreen />);
    const router = require("expo-router").useRouter();

    await waitFor(() => {
      // 戻るボタンを押す
      const backButton = getByTestId("back-button");
      fireEvent.press(backButton);

      // 前の画面に戻ることを確認
      expect(router.back).toHaveBeenCalled();
    });
  });

  it("ボタンスタイルが正しく適用されていること", async () => {
    const { getByTestId } = render(<ClipDetailScreen />);

    await waitFor(() => {
      // 更新ボタンのスタイルを確認
      const updateButton = getByTestId("update-clip-button");
      expect(updateButton.props.style[0]).toMatchObject({
        backgroundColor: "#4CAF50",
        borderRadius: 8,
        padding: 15,
        alignItems: "center",
        marginBottom: 15,
      });

      // 削除ボタンのスタイルを確認
      const deleteButton = getByTestId("delete-clip-button");
      expect(deleteButton.props.style[0]).toMatchObject({
        borderWidth: 1,
        borderColor: "#4CAF50",
        borderRadius: 8,
        padding: 15,
        alignItems: "center",
      });

      // ボタンが縦に並んでいることを確認するために、
      // buttonContainerのスタイルを確認
      const updateButtonParent = updateButton.parent;
      expect(updateButtonParent.props.style).toMatchObject({
        flexDirection: "column",
        marginTop: 30,
      });
    });
  });
});
