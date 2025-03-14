import { OCRService } from "../../services/OCRService";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { SelectionArea } from "../../components/ImageSelectionView";

// モック
jest.mock("expo-image-manipulator", () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: {
    JPEG: "jpeg",
  },
}));

jest.mock("expo-file-system", () => ({
  readAsStringAsync: jest.fn(),
  EncodingType: {
    Base64: "base64",
  },
}));

// global.fetchのモック
global.fetch = jest.fn();

// モック用のprivateメソッドへのアクセス
const originalGetApiKey = OCRService["getApiKey"];
const originalFormatRecognizedText = OCRService["formatRecognizedText"];

describe("OCRServiceのテスト", () => {
  // テスト前の共通設定
  beforeEach(() => {
    jest.clearAllMocks();

    // APIキーのモック（直接privateメソッドを一時的に書き換え）
    OCRService["getApiKey"] = jest.fn().mockReturnValue("mock-api-key");

    // ImageManipulatorのモック実装
    (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
      uri: "file://manipulated-image.jpg",
      width: 1600,
      height: 1200,
    });

    // FileSystem.readAsStringAsyncのモック実装
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(
      "base64-image-data"
    );

    // global.fetchのモック実装（成功ケース）
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        responses: [
          {
            fullTextAnnotation: {
              text: "テスト文章です。これはOCRテストです。",
              pages: [
                {
                  blocks: [{ confidence: 0.95 }, { confidence: 0.85 }],
                },
              ],
            },
          },
        ],
      }),
    });
  });

  // テスト後のクリーンアップ
  afterEach(() => {
    jest.clearAllMocks();

    // 元のメソッドに戻す
    OCRService["getApiKey"] = originalGetApiKey;
    OCRService["formatRecognizedText"] = originalFormatRecognizedText;
  });

  it("extractTextFromImageが正しくテキストを抽出すること", async () => {
    // サービスの実行
    const result = await OCRService.extractTextFromImage(
      "file://test-image.jpg"
    );

    // テスト検証
    expect(ImageManipulator.manipulateAsync).toHaveBeenCalled();
    expect(FileSystem.readAsStringAsync).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalled();

    // 結果の検証
    expect(result).toEqual({
      text: expect.any(String),
      confidence: expect.any(Number),
    });
  });

  it("選択領域が指定された場合に正しく処理されること", async () => {
    // 選択領域の定義
    const selectionArea: SelectionArea = {
      x: 100,
      y: 100,
      width: 400,
      height: 300,
      imageWidth: 1000,
      imageHeight: 800,
    };

    // サービスの実行
    await OCRService.extractTextFromImage(
      "file://test-image.jpg",
      selectionArea
    );

    // ImageManipulatorが正しいパラメータで呼ばれていることを確認
    expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
      "file://test-image.jpg",
      expect.arrayContaining([
        expect.objectContaining({
          crop: expect.any(Object),
        }),
        { resize: { width: 1600 } },
      ]),
      expect.any(Object)
    );
  });

  it("APIのレスポンスがエラーの場合、適切なエラーメッセージを返すこと", async () => {
    // fetchのモックをエラーレスポンスに変更
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      text: jest.fn().mockResolvedValue("Bad Request"),
    });

    // サービスの実行
    const result = await OCRService.extractTextFromImage(
      "file://test-image.jpg"
    );

    // エラー結果の検証
    expect(result).toEqual({
      text: "",
      error: expect.stringContaining("テキスト認識に失敗しました"),
    });
  });

  it("OCR結果がテキストを含まない場合、適切なエラーメッセージを返すこと", async () => {
    // テキストを含まないレスポンスをモック
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        responses: [{}],
      }),
    });

    // サービスの実行
    const result = await OCRService.extractTextFromImage(
      "file://test-image.jpg"
    );

    // エラー結果の検証
    expect(result).toEqual({
      text: "",
      error: expect.stringContaining("テキスト"), // "テキストが検出できませんでした"などのメッセージが含まれていることを確認
    });
  });

  it("テキスト整形機能が正しく動作すること", async () => {
    // formatRecognizedTextメソッドの動作を直接テスト
    const formatRecognizedText = OCRService["formatRecognizedText"];

    // 改行を含むテキスト
    const unformattedText = "こんにちは。\nこれは\nテスト\nです。さようなら。";

    // メソッドを実行
    const formattedText = formatRecognizedText(unformattedText);

    // 整形されたテキストの検証
    expect(formattedText).toBe(
      "こんにちは。\n これは テスト です。\nさようなら。"
    );
  });

  it("API呼び出し中に例外が発生した場合、適切なエラーメッセージを返すこと", async () => {
    // ネットワークエラーをシミュレート
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    // サービスの実行
    const result = await OCRService.extractTextFromImage(
      "file://test-image.jpg"
    );

    // エラー結果の検証
    expect(result).toEqual({
      text: "",
      error: expect.stringContaining("テキスト認識に失敗しました"),
    });
  });

  it("APIキーが設定されていない場合、適切なエラーメッセージを返すこと", async () => {
    // APIキーのモックを空に設定
    OCRService["getApiKey"] = jest.fn().mockImplementation(() => {
      throw new Error(
        "Google Cloud Vision APIキーが設定されていません。.envファイルにEXPO_PUBLIC_GOOGLE_CLOUD_VISION_API_KEYを設定してください。"
      );
    });

    // サービスの実行
    const result = await OCRService.extractTextFromImage(
      "file://test-image.jpg"
    );

    // エラー結果の検証
    expect(result).toEqual({
      text: "",
      error: expect.stringContaining("APIキーが設定されていません"),
    });
  });

  it("画像のBase64エンコード中にエラーが発生した場合、適切なエラーメッセージを返すこと", async () => {
    // FileSystem.readAsStringAsyncにエラーを発生させる
    (FileSystem.readAsStringAsync as jest.Mock).mockRejectedValue(
      new Error("File read error")
    );

    // サービスの実行
    const result = await OCRService.extractTextFromImage(
      "file://test-image.jpg"
    );

    // エラー結果の検証
    expect(result).toEqual({
      text: "",
      error: expect.stringContaining("テキスト認識に失敗しました"),
    });
  });
});
