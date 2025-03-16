import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";


import { SelectionArea } from "../components/ImageSelectionView";

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
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY;

    if (!apiKey) {
      throw new Error(
        "Google Cloud Vision APIキーが設定されていません。.envファイルにEXPO_PUBLIC_GOOGLE_CLOUD_VISION_API_KEYを設定してください。"
      );
    }

    return apiKey;
  }

  /**
   * 画像からテキストを抽出する
   * @param imageUri 画像のURI
   * @param selectionArea 選択された領域（指定がない場合は画像全体を処理）
   * @returns テキスト抽出結果
   */
  static async extractTextFromImage(
    imageUri: string,
    selectionArea?: SelectionArea
  ): Promise<OCRResult> {
    try {
      // 1. 画像を処理 (選択領域があればトリミング)
      const processedImage = await this.preprocessImage(
        imageUri,
        selectionArea
      );

      // 2. Google Cloud Vision APIでテキスト認識を実行
      const ocrResult = await this.recognizeTextWithCloudVision(
        processedImage.uri
      );

      // 3. テキストを整形：改行を削除し、句点「。」ごとに改行を挿入
      if (ocrResult.text) {
        ocrResult.text = this.formatRecognizedText(ocrResult.text);
      }

      return ocrResult;
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
   * 画像の前処理（サイズ変更・圧縮・トリミングなど）
   * @param imageUri 元画像のURI
   * @param selectionArea 選択された領域（指定がない場合は画像全体を処理）
   * @returns 処理済み画像情報
   */
  private static async preprocessImage(
    imageUri: string,
    selectionArea?: SelectionArea
  ) {
    // アクションの配列を作成
    const actions: ImageManipulator.Action[] = [];

    // 選択領域がある場合はトリミング
    if (selectionArea) {
      // 元画像のサイズを取得
      const imageWidth = selectionArea.imageWidth;
      const imageHeight = selectionArea.imageHeight;

      // 左右のマージンを非対称に設定（左側により多くのマージン）
      // 縦書きテキストの場合、左側が行の始まりになるため、左側により大きなマージンを適用
      const marginLeft = Math.min(Math.round(selectionArea.width * 0.25), 50); // 左側は25%、最大50px
      const marginRight = Math.min(Math.round(selectionArea.width * 0.15), 30); // 右側は15%、最大30px

      // 上下のマージンも非対称に設定
      const marginTop = Math.min(Math.round(selectionArea.height * 0.2), 40); // 上部は20%、最大40px
      const marginBottom = Math.min(
        Math.round(selectionArea.height * 0.15),
        30
      ); // 下部は15%、最大30px

      // 端数を丸めて整数値にする
      let originX = Math.max(0, Math.round(selectionArea.x - marginLeft));
      let originY = Math.max(0, Math.round(selectionArea.y - marginTop));
      let width = Math.min(
        imageWidth - originX,
        Math.round(selectionArea.width + marginLeft + marginRight)
      );
      let height = Math.min(
        imageHeight - originY,
        Math.round(selectionArea.height + marginTop + marginBottom)
      );

      // 選択範囲が有効（幅と高さが正の値）かチェック
      if (width > 0 && height > 0) {
        actions.push({
          crop: {
            originX,
            originY,
            width,
            height,
          },
        });

        console.log("トリミング範囲:", {
          originX,
          originY,
          width,
          height,
          marginLeft,
          marginRight,
          marginTop,
          marginBottom,
          originalSelection: {
            x: selectionArea.x,
            y: selectionArea.y,
            width: selectionArea.width,
            height: selectionArea.height,
          },
        });
      }
    }

    // リサイズ（選択領域がある場合はトリミング後にリサイズ）
    // 解像度を高めに保持してテキスト認識精度を向上
    actions.push({ resize: { width: 1600 } });

    // 画像処理を実行
    return await ImageManipulator.manipulateAsync(
      imageUri,
      actions,
      { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG } // 圧縮率を95%に向上
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
                  {
                    type: "DOCUMENT_TEXT_DETECTION", // ドキュメントテキスト検出も追加（縦書きに有効）
                    maxResults: 1,
                  },
                ],
                imageContext: {
                  languageHints: ["ja", "ja-t-i0-handwrit"], // 日本語と日本語手書き認識を優先
                  textDetectionParams: {
                    enableTextDetectionConfidenceScore: true, // 信頼度スコアを有効化
                  },
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
      console.log(
        "Google Vision API レスポンス:",
        JSON.stringify(data, null, 2)
      );

      // エラーチェック
      if (data.error) {
        throw new Error(
          `Cloud Vision API エラー: ${
            data.error.message || JSON.stringify(data.error)
          }`
        );
      }

      // レスポンスからテキストを抽出
      // DOCUMENT_TEXT_DETECTIONの結果を優先的に使用（縦書きに対応）
      const docResponse = data.responses && data.responses[0];
      let recognizedText = "";
      let confidenceValue = 0.9; // デフォルト値

      if (docResponse && docResponse.fullTextAnnotation) {
        recognizedText = docResponse.fullTextAnnotation.text;

        // 信頼度の計算
        if (docResponse.fullTextAnnotation.pages) {
          const blocks = docResponse.fullTextAnnotation.pages[0]?.blocks || [];
          let totalConfidence = 0;
          let blockCount = 0;

          for (const block of blocks) {
            if (block.confidence) {
              totalConfidence += block.confidence;
              blockCount++;
            }
          }

          if (blockCount > 0) {
            confidenceValue = totalConfidence / blockCount;
          }
        }
      } else if (
        docResponse &&
        docResponse.textAnnotations &&
        docResponse.textAnnotations.length > 0
      ) {
        recognizedText = docResponse.textAnnotations[0].description;

        if (docResponse.textAnnotations[0].confidence) {
          confidenceValue = docResponse.textAnnotations[0].confidence;
        }
      } else {
        return {
          text: "",
          error: "テキストが検出できませんでした",
        };
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

  /**
   * OCR認識テキストを整形する
   * @param text 元のテキスト
   * @returns 整形されたテキスト（改行を削除し、句点「。」ごとに改行を挿入）
   */
  private static formatRecognizedText(text: string): string {
    if (!text) return "";

    // 1. 既存の改行をすべて半角スペースに置換
    let formattedText = text.replace(/\n/g, " ");

    // 2. 複数の連続したスペースを1つに置換
    formattedText = formattedText.replace(/\s+/g, " ");

    // 3. 句点「。」の後に改行を挿入（ただし、文末の場合は改行しない）
    formattedText = formattedText.replace(/。(?!$)/g, "。\n");

    // 4. 前後の余分なスペースを削除
    formattedText = formattedText.trim();

    return formattedText;
  }
}
