import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import TextRecognition, {
  TextRecognitionScript,
} from "@react-native-ml-kit/text-recognition";

// OCR結果のインターフェース
export interface OCRResult {
  text: string;
  confidence?: number;
  error?: string;
}

/**
 * OCRサービスクラス - 画像からテキストを抽出する機能を提供
 *
 * Google Cloud Vision APIを使用したテキスト認識を実行します。
 * APIキーは環境変数で管理されます。
 */
export class OCRService {
  // Google Cloud Vision APIのエンドポイント
  private static readonly VISION_API_ENDPOINT =
    "https://vision.googleapis.com/v1/images:annotate";

  // 環境変数からAPIキーを取得
  private static getApiKey(): string {
    // 環境変数から直接APIキーを取得
    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;

    if (!apiKey) {
      throw new Error(
        "Google Cloud Vision APIキーが設定されていません。.envファイルにGOOGLE_CLOUD_VISION_API_KEYを設定してください。"
      );
    }

    return apiKey;
  }

  /**
   * 画像からテキストを抽出する
   * @param imageUri 画像のURI
   * @returns テキスト抽出結果
   */
  static async extractTextFromImage(imageUri: string): Promise<OCRResult> {
    try {
      // 1. 画像を圧縮して処理しやすくする
      const processedImage = await this.preprocessImage(imageUri);

      // 2. Google Cloud Vision APIでテキスト認識を実行
      return await this.recognizeTextWithCloudVision(processedImage.uri);
    } catch (error) {
      console.error("OCR処理中にエラーが発生しました:", error);

      // エラー詳細を返す
      return {
        text: "",
        error:
          error instanceof Error
            ? `テキスト認識に失敗しました: ${error.message}`
            : "テキスト認識中に不明なエラーが発生しました。",
      };
    }
  }

  /**
   * 画像の前処理（サイズ変更・圧縮など）
   * @param imageUri 元画像のURI
   * @returns 処理済み画像情報
   */
  private static async preprocessImage(imageUri: string) {
    // 画像サイズを調整し、品質を下げて処理しやすくする
    return await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 1000 } }], // 幅1000pxにリサイズ
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG } // 圧縮率80%
    );
  }

  /**
   * Google Cloud Vision APIを使用したテキスト認識
   * @param imageUri 画像のURI
   * @returns テキスト抽出結果
   */
  private static async recognizeTextWithCloudVision(
    imageUri: string
  ): Promise<OCRResult> {
    try {
      // APIキーを取得
      const apiKey = this.getApiKey();

      // 画像をBase64エンコード
      const base64Image = await this.imageToBase64(imageUri);

      // API呼び出し
      const response = await fetch(
        `${this.VISION_API_ENDPOINT}?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  content: base64Image,
                },
                features: [
                  {
                    type: "TEXT_DETECTION",
                    maxResults: 1,
                  },
                ],
                imageContext: {
                  languageHints: ["ja"], // 日本語を優先
                },
              },
            ],
          }),
        }
      );

      // レスポンスが成功したか確認
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API応答エラー (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      // エラーチェック
      if (data.error) {
        throw new Error(
          `Cloud Vision API エラー: ${
            data.error.message || JSON.stringify(data.error)
          }`
        );
      }

      // レスポンスからテキストを抽出
      if (
        !data.responses ||
        !data.responses[0] ||
        !data.responses[0].fullTextAnnotation
      ) {
        return {
          text: "",
          error: "テキストが検出できませんでした",
        };
      }

      const recognizedText = data.responses[0].fullTextAnnotation.text;

      // 信頼度の計算（個別の検出結果から平均値を算出）
      let confidenceValue = 0.9; // デフォルト値
      if (
        data.responses[0].textAnnotations &&
        data.responses[0].textAnnotations.length > 0
      ) {
        // 一部のレスポンスに信頼度情報が含まれる場合に対応
        if (data.responses[0].textAnnotations[0].confidence) {
          confidenceValue = data.responses[0].textAnnotations[0].confidence;
        }
      }

      return {
        text: recognizedText,
        confidence: confidenceValue,
      };
    } catch (error) {
      // エラーを詳細に記録
      console.error("Cloud Vision API処理中にエラーが発生しました:", error);

      // 具体的なエラーメッセージを生成
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Cloud Vision APIとの通信中に不明なエラーが発生しました";

      // エラー情報を含めた結果を返す
      throw new Error(errorMessage);
    }
  }

  /**
   * 画像をBase64エンコードする
   */
  private static async imageToBase64(uri: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error("Base64エンコード中にエラーが発生しました:", error);
      throw new Error("画像のエンコードに失敗しました");
    }
  }
}
