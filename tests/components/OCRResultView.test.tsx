import React from "react";
import { render, fireEvent, waitFor } from "../test-utils";
import { Alert } from "react-native";
import OCRResultView from "../../components/OCRResultView";
import { OCRService } from "../../services/OCRService";

// OCRServiceのモック
jest.mock("../../services/OCRService", () => ({
  OCRService: {
    extractTextFromImage: jest.fn(),
  },
}));

// Alertのモック
jest.spyOn(Alert, "alert").mockImplementation(() => undefined);

// Ioniconsのモック
jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name, _size, _color }) => {
    const React = require("react");
    const { Text } = require("react-native");
    return React.createElement(Text, { testID: `icon-${name}` }, name);
  },
}));

describe("OCRResultViewコンポーネント", () => {
  const mockImageUri = "file://test/image.jpg";
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // デフォルトのOCR結果を設定
    (OCRService.extractTextFromImage as jest.Mock).mockResolvedValue({
      text: "テスト抽出されたテキスト",
      confidence: 0.85,
    });
  });

  it("ローディング中の表示が正しく表示されること", async () => {
    // OCRServiceのレスポンスを遅延させる
    (OCRService.extractTextFromImage as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => {
            resolve({
              text: "テスト抽出されたテキスト",
              confidence: 0.85,
            });
          }, 100)
        )
    );

    const { getByText } = render(
      <OCRResultView
        imageUri={mockImageUri}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // ローディング表示が表示されることを確認
    expect(getByText("テキストを抽出中...")).toBeTruthy();
  });

  it("テキスト抽出が成功した場合、結果が正しく表示されること", async () => {
    const { getByText, findByText, getByDisplayValue } = render(
      <OCRResultView
        imageUri={mockImageUri}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // OCRの結果表示を待つ
    await findByText("抽出されたテキスト:");

    // 信頼度が表示されることを確認
    expect(getByText("信頼度: 85%")).toBeTruthy();

    // 抽出されたテキストがTextInputに表示されていることを確認
    expect(getByDisplayValue("テスト抽出されたテキスト")).toBeTruthy();

    // ボタンが表示されることを確認
    expect(getByText("範囲選択に戻る")).toBeTruthy();
    expect(getByText("テキストを使用")).toBeTruthy();
  });

  it("エラー発生時に適切なエラーメッセージが表示されること", async () => {
    // OCRServiceのエラーレスポンスを設定
    (OCRService.extractTextFromImage as jest.Mock).mockResolvedValue({
      text: "",
      error: "テスト用エラーメッセージ",
    });

    const { findByText, getByText } = render(
      <OCRResultView
        imageUri={mockImageUri}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // エラーメッセージが表示されることを確認
    const errorMessage = await findByText("テスト用エラーメッセージ");
    expect(errorMessage).toBeTruthy();

    // 再試行ボタンが表示されることを確認
    expect(getByText("再試行")).toBeTruthy();
  });

  it("キャンセルボタンを押すとonCancelが呼ばれること", async () => {
    const { getByText, findByText } = render(
      <OCRResultView
        imageUri={mockImageUri}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // コンポーネントのロード完了を待つ
    await findByText("抽出されたテキスト:");

    // キャンセルボタンを押す
    fireEvent.press(getByText("範囲選択に戻る"));

    // onCancelが呼ばれたことを確認
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it("戻るボタンを押すとonCancelが呼ばれること", async () => {
    const { getByTestId, findByText } = render(
      <OCRResultView
        imageUri={mockImageUri}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // コンポーネントのロード完了を待つ
    await findByText("抽出されたテキスト:");

    // 戻るボタンを押す
    fireEvent.press(getByTestId("icon-arrow-back"));

    // onCancelが呼ばれたことを確認
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it("テキストを編集して確定ボタンを押すと、編集されたテキストでonConfirmが呼ばれること", async () => {
    const { getByText, getByDisplayValue, findByText } = render(
      <OCRResultView
        imageUri={mockImageUri}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // コンポーネントのロード完了を待つ
    await findByText("抽出されたテキスト:");

    // テキスト入力を編集
    const textInput = getByDisplayValue("テスト抽出されたテキスト");
    fireEvent.changeText(textInput, "編集されたテキスト");

    // 確定ボタンを押す
    fireEvent.press(getByText("テキストを使用"));

    // onConfirmが編集されたテキストで呼ばれたことを確認
    expect(mockOnConfirm).toHaveBeenCalledWith("編集されたテキスト");
  });

  it("テキストが空の場合、確定ボタンを押してもonConfirmが呼ばれないこと", async () => {
    // OCR結果を空テキストに設定
    (OCRService.extractTextFromImage as jest.Mock).mockResolvedValue({
      text: "",
      confidence: 0.85,
    });

    const { getByText, findByText } = render(
      <OCRResultView
        imageUri={mockImageUri}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // コンポーネントのロード完了を待つ
    await findByText("抽出されたテキスト:");

    // 確定ボタンを取得して押す
    const confirmButton = getByText("テキストを使用");
    fireEvent.press(confirmButton);

    // テキストが空なので、onConfirmが呼ばれないことを確認
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it("再試行ボタンを押すと、OCRが再実行されること", async () => {
    // 最初はエラーを返し、2回目は成功するOCRServiceをモック
    (OCRService.extractTextFromImage as jest.Mock)
      .mockResolvedValueOnce({
        text: "",
        error: "テスト用エラーメッセージ",
      })
      .mockResolvedValueOnce({
        text: "再試行後のテキスト",
        confidence: 0.9,
      });

    const { getByText, findByText } = render(
      <OCRResultView
        imageUri={mockImageUri}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // エラーメッセージが表示されることを確認
    const errorMessage = await findByText("テスト用エラーメッセージ");
    expect(errorMessage).toBeTruthy();

    // 再試行ボタンを押す
    fireEvent.press(getByText("再試行"));

    // OCR抽出が再度呼ばれたことを確認
    expect(OCRService.extractTextFromImage).toHaveBeenCalledTimes(2);

    // 再試行後のテキストが表示されることを確認
    await findByText("抽出されたテキスト:");
  });

  it("選択領域が提供された場合、OCRServiceに渡されること", async () => {
    const mockSelectionArea = {
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      imageWidth: 300,
      imageHeight: 400,
    };

    render(
      <OCRResultView
        imageUri={mockImageUri}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        selectionArea={mockSelectionArea}
      />
    );

    // OCRServiceに選択領域が渡されたことを確認
    await waitFor(() => {
      expect(OCRService.extractTextFromImage).toHaveBeenCalledWith(
        mockImageUri,
        mockSelectionArea
      );
    });
  });
});
