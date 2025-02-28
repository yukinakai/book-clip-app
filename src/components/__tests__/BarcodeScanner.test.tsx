// グローバル変数に onBarCodeScanned のコールバックを保持
let onBarCodeScannedCallback:
  | ((event: { data: string; type: string | number }) => void)
  | undefined;

jest.mock("expo-camera", () => {
  const React = require("react");

  // Camera コンポーネントのモック定義
  const MockCamera = (props: any) => {
    onBarCodeScannedCallback = props.onBarCodeScanned;
    return null;
  };

  // 静的メソッドとして requestCameraPermissionsAsync を定義
  MockCamera.requestCameraPermissionsAsync = jest
    .fn()
    .mockResolvedValue({ status: "granted" });

  return {
    Camera: MockCamera,
    CameraType: {
      back: "back",
      front: "front",
    },
  };
});

import React from "react";
import { render, waitFor, act } from "@testing-library/react-native";
import { BarcodeScannerView } from "../BarcodeScanner";
import { Camera } from "expo-camera";

describe("BarcodeScannerView with expo-camera", () => {
  const mockOnScan = jest.fn();

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    onBarCodeScannedCallback = undefined;
  });

  it("カメラのパーミッションを要求する", async () => {
    render(<BarcodeScannerView onScan={mockOnScan} />);
    await waitFor(() => {
      expect(Camera.requestCameraPermissionsAsync).toHaveBeenCalled();
    });
  });

  it("パーミッションが拒否された場合エラーメッセージを表示する (toJSON を利用)", async () => {
    (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: "denied",
    });
    const { toJSON, queryByText } = render(
      <BarcodeScannerView onScan={mockOnScan} />
    );

    // 「カメラのアクセス許可を確認中...」が消えるのを待機
    await waitFor(
      () => {
        expect(queryByText("カメラのアクセス許可を確認中...")).toBeNull();
      },
      { timeout: 3000 }
    );

    /* 
    queryByText や getByTestId を使って直接要素を取得しようとしましたが、
    内部のテキスト構造や余分な空白、改行などの影響で、期待する要素がうまく取得できませんでした。
    debug() ではレンダリングツリーの内容は確認できましたが、debug() はコンソール出力のみで値を返さないため、
    toJSON() を利用して JSON 表現に変換し、その文字列中に「カメラの使用を許可してください」が含まれているかを検証する方法に変更しました。
  */

    // toJSON() を使ってレンダリング結果を文字列に変換
    const renderedOutput = toJSON();
    const renderedOutputString = JSON.stringify(renderedOutput);

    // 出力された文字列に「カメラの使用を許可してください」が含まれているか検証
    expect(renderedOutputString).toContain("カメラの使用を許可してください");
  });

  it("バーコードスキャン時にコールバックを呼び出す", async () => {
    render(<BarcodeScannerView onScan={mockOnScan} />);
    await waitFor(() => {
      expect(onBarCodeScannedCallback).toBeDefined();
    });

    // モックイベント（必要なプロパティのみ）
    const mockEvent = {
      data: "9784167158057",
      type: "ean13",
    };
    onBarCodeScannedCallback?.(mockEvent);
    expect(mockOnScan).toHaveBeenCalledWith("9784167158057");
  });
});
