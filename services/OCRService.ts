import * as ImageManipulator from "expo-image-manipulator";

// OCR結果のインターフェース
export interface OCRResult {
  text: string;
  confidence?: number;
  error?: string;
}

/**
 * OCRサービスクラス - 画像からテキストを抽出する機能を提供
 */
export class OCRService {
  /**
   * 画像からテキストを抽出する
   * @param imageUri 画像のURI
   * @returns テキスト抽出結果
   */
  static async extractTextFromImage(imageUri: string): Promise<OCRResult> {
    try {
      // 1. 画像を圧縮して処理しやすくする
      const processedImage = await this.preprocessImage(imageUri);

      // 2. テキスト抽出処理（実際にはGoogle Cloud Vision APIを使用）
      // 現時点ではモック実装
      return await this.mockExtractText(processedImage.uri);

      // 本番実装では以下のようになります
      // return await this.callGoogleVisionAPI(processedImage.uri);
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
   * モック実装：テキスト抽出
   * 実際のAPI実装の前に使用するテスト用関数
   */
  private static async mockExtractText(imageUri: string): Promise<OCRResult> {
    // APIの動作をシミュレートするために少し待機
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // ランダムなテキストを返す（開発/テスト用）
    const mockTexts = [
      "本を読むことは、他者の思考の中を旅することです。",
      "知識とは、経験によって意味を与えられた情報のことである。",
      "すべての本は、さらに別の本への扉である。",
      "良い本は心の糧となり、悪い本は毒となる。",
      "読書は思考のための栄養であり、考えるためのビタミン剤である。",
    ];

    const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];

    return {
      text: randomText,
      confidence: 0.85, // 85%の信頼度（モック値）
    };
  }

  /**
   * Google Cloud Vision APIを呼び出す
   * 注：実際の実装では、APIキーの設定やセキュリティ対策が必要です
   */
  private static async callGoogleVisionAPI(
    imageUri: string
  ): Promise<OCRResult> {
    // これは実際の実装の例です。APIキーなどの設定が必要です。
    // const apiKey = 'YOUR_GOOGLE_CLOUD_API_KEY';
    // const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

    // 画像をBase64エンコード
    // const base64Image = await this.imageToBase64(imageUri);

    // APIリクエストボディ
    // const requestBody = {
    //   requests: [
    //     {
    //       image: { content: base64Image },
    //       features: [{ type: 'TEXT_DETECTION' }]
    //     }
    //   ]
    // };

    // APIコール
    // const response = await fetch(apiUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(requestBody)
    // });

    // レスポンス処理
    // const data = await response.json();
    // if (data.responses && data.responses[0].fullTextAnnotation) {
    //   return {
    //     text: data.responses[0].fullTextAnnotation.text,
    //     confidence: data.responses[0].fullTextAnnotation.confidence || 0
    //   };
    // }

    // レスポンスに結果がない場合
    // return { text: '', error: 'テキストを検出できませんでした' };

    // モック実装を呼び出し（実際の実装と置き換えてください）
    return this.mockExtractText(imageUri);
  }

  /**
   * 画像をBase64エンコードする（API呼び出し用）
   * 注：実際の実装ではFileSystem.readAsStringAsyncなどを使用します
   */
  private static async imageToBase64(uri: string): Promise<string> {
    // Expoのライブラリを使ったBase64変換の例
    // const base64 = await FileSystem.readAsStringAsync(uri, {
    //   encoding: FileSystem.EncodingType.Base64
    // });
    // return base64;

    // モック実装ではダミー文字列を返す
    return "base64encodedstring";
  }
}
