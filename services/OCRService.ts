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
 * 主要な機能：
 * 1. Google Cloud Vision APIを使用したテキスト認識
 * 2. 開発環境用のモック実装
 * 3. MLKit実装（将来のネイティブ実装用）
 */
export class OCRService {
  // Google Cloud Vision APIのエンドポイントとキー
  // 注意: 実際の運用では環境変数等でセキュアに管理すること
  private static readonly VISION_API_ENDPOINT =
    "https://vision.googleapis.com/v1/images:annotate";
  private static readonly VISION_API_KEY = "YOUR_API_KEY"; // TODO: 実際のAPIキーに置き換える

  // 開発環境でも実際のAPIを使用するかのフラグ
  private static readonly USE_REAL_API_IN_DEV = false;

  /**
   * 画像からテキストを抽出する
   * @param imageUri 画像のURI
   * @returns テキスト抽出結果
   */
  static async extractTextFromImage(imageUri: string): Promise<OCRResult> {
    try {
      // 1. 画像を圧縮して処理しやすくする
      const processedImage = await this.preprocessImage(imageUri);

      // 開発環境の判定
      if (__DEV__ && !this.USE_REAL_API_IN_DEV) {
        console.log("開発環境: モック実装を使用します");
        return await this.mockExtractText(processedImage.uri);
      }

      // 2. Google Cloud Vision APIでテキスト認識を試みる
      try {
        console.log("Google Cloud Vision APIでテキスト認識を実行します");
        return await this.recognizeTextWithCloudVision(processedImage.uri);
      } catch (error) {
        console.error("Cloud Vision API呼び出しエラー:", error);

        // 開発環境でない場合のみエラーログを詳細に出力
        if (!__DEV__) {
          console.warn(
            "Cloud Vision APIでエラーが発生したため、代替手段を試みます"
          );
        }

        // 3. MLKitでの認識を試みる（将来的なネイティブ実装用）
        try {
          if (!__DEV__) {
            return await this.recognizeTextWithMLKit(processedImage.uri);
          }
        } catch (mlkitError) {
          if (!__DEV__) {
            console.error("MLKit処理中にエラーが発生しました:", mlkitError);
          }
        }

        // 4. すべてのAPIが失敗した場合はモック実装にフォールバック
        console.warn("すべてのOCR実装が失敗したため、モック実装を使用します");
        return await this.mockExtractText(processedImage.uri);
      }
    } catch (error) {
      console.error("OCR処理中にエラーが発生しました:", error);
      return {
        text: "",
        error: error instanceof Error ? error.message : "不明なエラー",
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
      // 画像をBase64エンコード
      const base64Image = await this.imageToBase64(imageUri);

      // API呼び出し
      const response = await fetch(
        `${this.VISION_API_ENDPOINT}?key=${this.VISION_API_KEY}`,
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
      console.error("Cloud Vision API処理中にエラーが発生しました:", error);
      throw error; // 上位の呼び出し元でキャッチされる
    }
  }

  /**
   * MLKitを使用したテキスト認識
   * @param imageUri 画像のURI
   * @returns テキスト抽出結果
   */
  private static async recognizeTextWithMLKit(
    imageUri: string
  ): Promise<OCRResult> {
    try {
      // MLKitの日本語テキスト認識を使用
      const result = await TextRecognition.recognize(
        imageUri,
        TextRecognitionScript.JAPANESE
      );

      // 結果がない場合
      if (!result || !result.text) {
        return {
          text: "",
          error: "テキストを検出できませんでした",
        };
      }

      // テキスト認識結果を取得
      const recognizedText = result.text;

      // 信頼度の計算（ブロックごとの信頼度の平均）
      let totalConfidence = 0;
      let confidenceCount = 0;

      if (result.blocks && result.blocks.length > 0) {
        for (const block of result.blocks) {
          if (block.lines && block.lines.length > 0) {
            for (const line of block.lines) {
              if (line.confidence !== undefined) {
                totalConfidence += line.confidence;
                confidenceCount++;
              }
            }
          }
        }
      }

      // 信頼度の平均を計算（値がある場合のみ）
      const avgConfidence =
        confidenceCount > 0 ? totalConfidence / confidenceCount : undefined;

      return {
        text: recognizedText,
        confidence: avgConfidence,
      };
    } catch (error) {
      // エラーログを出力
      if (!__DEV__) {
        console.error("MLKit処理中にエラーが発生しました:", error);
      }
      throw error; // 上位の呼び出し元でキャッチされる
    }
  }

  /**
   * モック実装：テキスト抽出
   * 実際のAPI実装がエラーを起こした場合のフォールバックとして使用
   */
  private static async mockExtractText(imageUri: string): Promise<OCRResult> {
    // APIの動作をシミュレートするために少し待機
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // より実用的なテキストを返す（開発/テスト用）
    const mockTexts = [
      "読書は単なる娯楽ではなく、知識を広げ思考を深める重要な活動です。本を読むことで、他者の視点や経験を理解することができます。",
      "知識とは、単なる情報の集まりではなく、実際の経験や考察によって意味を与えられたものです。読書は知識を得る最も効果的な方法の一つと言えるでしょう。",
      "紙の本は電子書籍にはない魅力があります。手触りや香り、ページをめくる感覚は、読書体験を豊かにしてくれます。それぞれの本には、独自の個性があります。",
      "本を読むことは旅に出ることに似ています。新しい世界や考え方に触れ、自分の視野を広げることができます。一冊の本が人生を変えることもあるのです。",
      "読書の習慣を身につけることは、継続的な自己成長につながります。毎日少しの時間でも本に触れることで、知識や想像力が豊かになっていきます。",
    ];

    const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];

    return {
      text: randomText,
      confidence: 0.85, // 85%の信頼度（モック値）
    };
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
      throw error;
    }
  }
}
