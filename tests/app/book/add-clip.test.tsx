import React from "react";
import { render, fireEvent, waitFor } from "../../test-utils";
import AddClipScreen from "../../../app/book/add-clip";
import { ClipStorageService } from "../../../services/ClipStorageService";
import { Alert } from "react-native";
import { act } from "../../test-utils";

// モックの設定
jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn().mockReturnValue({
    bookId: "test-book-id",
    bookTitle: "テスト書籍",
  }),
  useRouter: jest.fn().mockReturnValue({
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons-Mock",
}));

// ClipStorageService全体をモック
jest.mock("../../../services/ClipStorageService");

jest.mock("../../../services/BookStorageService", () => ({
  BookStorageService: {
    getAllBooks: jest.fn().mockResolvedValue([
      {
        id: "test-book-id",
        title: "テスト書籍",
        author: "テスト著者",
        coverImage: null,
        createdAt: new Date().toISOString(),
      },
    ]),
    getLastClipBook: jest.fn().mockResolvedValue(null),
  },
}));

// Alertのモック
jest.spyOn(Alert, "alert").mockImplementation((_title, _message, buttons) => {
  // OKボタンのコールバックが存在する場合は実行
  if (buttons && buttons.length > 0 && buttons[0].onPress) {
    buttons[0].onPress();
  }
});

describe("AddClipScreen", () => {
  beforeEach(() => {
    // テスト前に各モックをリセット
    jest.clearAllMocks();

    // ClipStorageServiceのsaveClipメソッドを明示的にモック
    ClipStorageService.saveClip = jest.fn().mockResolvedValue(undefined);
  });

  it("クリップ追加画面が正しく表示されること", async () => {
    const { getByText } = render(<AddClipScreen />);

    // 画面タイトルが表示されていることを確認
    expect(getByText("クリップを追加")).toBeTruthy();

    // 書籍タイトルが表示されるまで待機
    await waitFor(() => {
      expect(getByText("テスト書籍")).toBeTruthy();
    });

    // 入力フィールドが表示されていることを確認
    expect(getByText("クリップするテキスト")).toBeTruthy();
    expect(getByText("ページ番号")).toBeTruthy();

    // ボタンが表示されていることを確認
    expect(getByText("保存する")).toBeTruthy();
  });

  it("テキスト入力とページ番号入力が機能すること", async () => {
    const { getByTestId } = render(<AddClipScreen />);

    // 書籍タイトルが表示されるまで待機
    await waitFor(() => {
      expect(getByTestId("change-book-button")).toBeTruthy();
    });

    // テキスト入力のテスト
    const textInput = getByTestId("clip-text-input");
    fireEvent.changeText(textInput, "テストクリップテキスト");

    // ページ番号入力のテスト
    const pageInput = getByTestId("page-number-input");
    fireEvent.changeText(pageInput, "42");

    // 入力値が更新されていることを確認
    expect(textInput.props.value).toBe("テストクリップテキスト");
    expect(pageInput.props.value).toBe("42");
  });

  it("空のテキストで保存しようとするとエラーが表示されること", async () => {
    const { getByTestId } = render(<AddClipScreen />);

    // 書籍タイトルが表示されるまで待機
    await waitFor(() => {
      expect(getByTestId("change-book-button")).toBeTruthy();
    });

    // 空のテキストでフォームを送信
    const saveButton = getByTestId("save-clip-button");
    fireEvent.press(saveButton);

    // Alertが呼ばれたことを確認
    expect(Alert.alert).toHaveBeenCalledWith(
      "エラー",
      "クリップするテキストを入力してください"
    );

    // ClipStorageService.saveClipが呼ばれていないことを確認
    expect(ClipStorageService.saveClip).not.toHaveBeenCalled();
  });

  it("無効なページ番号でエラーが表示されること", async () => {
    const { getByTestId } = render(<AddClipScreen />);

    // 書籍タイトルが表示されるまで待機
    await waitFor(() => {
      expect(getByTestId("change-book-button")).toBeTruthy();
    });

    // テキストを入力
    const textInput = getByTestId("clip-text-input");
    fireEvent.changeText(textInput, "テストクリップテキスト");

    // 無効なページ番号を入力
    const pageInput = getByTestId("page-number-input");
    fireEvent.changeText(pageInput, "abc");

    // 保存ボタンを押す
    const saveButton = getByTestId("save-clip-button");
    fireEvent.press(saveButton);

    // Alertが呼ばれたことを確認
    expect(Alert.alert).toHaveBeenCalledWith(
      "エラー",
      "ページ番号は数値で入力してください"
    );

    // ClipStorageService.saveClipが呼ばれていないことを確認
    expect(ClipStorageService.saveClip).not.toHaveBeenCalled();
  });

  it("有効な入力でクリップが保存され、前の画面に戻ること", async () => {
    const { getByTestId } = render(<AddClipScreen />);
    const router = require("expo-router").useRouter();

    // 書籍タイトルが表示されるまで待機
    await waitFor(() => {
      expect(getByTestId("change-book-button")).toBeTruthy();
    });

    // テキストを入力
    const textInput = getByTestId("clip-text-input");
    fireEvent.changeText(textInput, "テストクリップテキスト");

    // ページ番号を入力
    const pageInput = getByTestId("page-number-input");
    fireEvent.changeText(pageInput, "42");

    // 保存ボタンを押す
    const saveButton = getByTestId("save-clip-button");

    // act内で非同期イベントを処理
    await act(async () => {
      fireEvent.press(saveButton);
      // 非同期処理が完了するのを待つ
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // ClipStorageService.saveClipが正しく呼ばれたことを確認
    expect(ClipStorageService.saveClip).toHaveBeenCalledWith(
      expect.objectContaining({
        bookId: "test-book-id",
        text: "テストクリップテキスト",
        page: 42,
      })
    );

    // 成功メッセージが表示されたことを確認
    expect(Alert.alert).toHaveBeenCalledWith(
      "成功",
      "クリップを保存しました",
      expect.arrayContaining([
        expect.objectContaining({
          text: "OK",
          onPress: expect.any(Function),
        }),
      ])
    );

    // ホーム画面に遷移することを確認（Alertのコールバックをシミュレートしたので）
    expect(router.replace).toHaveBeenCalledWith("/");
  });

  it("戻るボタンを押すと前の画面に戻ること", async () => {
    const { getByTestId } = render(<AddClipScreen />);
    const router = require("expo-router").useRouter();

    // 書籍タイトルが表示されるまで待機
    await waitFor(() => {
      expect(getByTestId("change-book-button")).toBeTruthy();
    });

    // 戻るボタンを押す
    const backButton = getByTestId("back-button");
    fireEvent.press(backButton);

    // 前の画面に戻ることを確認
    expect(router.back).toHaveBeenCalled();
  });
});
