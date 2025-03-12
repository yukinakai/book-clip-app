import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import BarcodeScanner from "../../components/BarcodeScanner";

// BarCodeScannerのモック
jest.mock("expo-barcode-scanner", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    BarCodeScanner: jest.fn(({ onBarCodeScanned, style }) => {
      return (
        <View
          testID="barcode-scanner"
          style={style}
          onPress={(data) => onBarCodeScanned({ data })}
        />
      );
    }),
  };
});

// RakutenBookServiceのモック
jest.mock("../../services/RakutenBookService", () => ({
  RakutenBookService: {
    searchAndSaveBook: jest.fn(),
  },
}));

// Alertのモック
jest.spyOn(Alert, "alert").mockImplementation((title, message, buttons) => {
  // ボタンが押されたときのコールバックをシミュレート
  if (buttons && buttons.length > 0 && buttons[0].onPress) {
    buttons[0].onPress();
  }
  return 0;
});

describe("BarcodeScanner", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders BarCodeScanner component", () => {
    const { getByTestId } = render(<BarcodeScanner onClose={mockOnClose} />);
    expect(getByTestId("barcode-scanner")).toBeTruthy();
  });

  it("handles new book scan successfully", async () => {
    const mockBook = {
      id: "123",
      title: "テスト本",
      author: "テスト著者",
      coverImage: "https://example.com/test.jpg",
    };

    // 新しい本を見つけた場合の戻り値をモック
    require("../../services/RakutenBookService").RakutenBookService.searchAndSaveBook.mockResolvedValueOnce(
      {
        book: mockBook,
        isExisting: false,
      }
    );

    const { getByTestId } = render(<BarcodeScanner onClose={mockOnClose} />);

    // バーコードスキャンをシミュレート
    fireEvent.press(getByTestId("barcode-scanner"), "9784167158057");

    await waitFor(() => {
      // 保存成功のアラートが表示され、onCloseが呼ばれることを確認
      expect(Alert.alert).toHaveBeenCalledWith(
        "保存完了",
        `「${mockBook.title}」を本棚に追加しました。`,
        expect.arrayContaining([
          expect.objectContaining({
            text: "OK",
            onPress: expect.any(Function),
          }),
        ])
      );

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("handles existing book scan", async () => {
    const mockBook = {
      id: "123",
      title: "テスト本",
      author: "テスト著者",
      coverImage: "https://example.com/test.jpg",
    };

    // 既存の本を見つけた場合の戻り値をモック
    require("../../services/RakutenBookService").RakutenBookService.searchAndSaveBook.mockResolvedValueOnce(
      {
        book: mockBook,
        isExisting: true,
      }
    );

    // setHasScannedの状態をリセットするため、Alertのモックを一時的に変更
    jest
      .spyOn(Alert, "alert")
      .mockImplementationOnce((title, message, buttons) => {
        if (buttons && buttons.length > 0 && buttons[0].onPress) {
          buttons[0].onPress();
        }
        return 0;
      });

    const { getByTestId } = render(<BarcodeScanner onClose={mockOnClose} />);

    // バーコードスキャンをシミュレート
    fireEvent.press(getByTestId("barcode-scanner"), "9784167158057");

    await waitFor(() => {
      // 既存の本のアラートが表示されることを確認
      expect(Alert.alert).toHaveBeenCalledWith(
        "登録済みの本",
        `「${mockBook.title}」は既に本棚に登録されています。`,
        expect.anything()
      );

      // onCloseは呼ばれないはず
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it("handles book not found error", async () => {
    // 本が見つからない場合の戻り値をモック
    require("../../services/RakutenBookService").RakutenBookService.searchAndSaveBook.mockResolvedValueOnce(
      {
        book: null,
        isExisting: false,
      }
    );

    const { getByTestId } = render(<BarcodeScanner onClose={mockOnClose} />);

    // バーコードスキャンをシミュレート
    fireEvent.press(getByTestId("barcode-scanner"), "9784167158057");

    await waitFor(() => {
      // エラーアラートが表示されることを確認
      expect(Alert.alert).toHaveBeenCalledWith(
        "エラー",
        "本が見つかりませんでした。",
        expect.anything()
      );

      // onCloseは呼ばれないはず
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it("handles service error", async () => {
    // サービスエラーをシミュレート
    require("../../services/RakutenBookService").RakutenBookService.searchAndSaveBook.mockRejectedValueOnce(
      new Error("API error")
    );

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { getByTestId } = render(<BarcodeScanner onClose={mockOnClose} />);

    // バーコードスキャンをシミュレート
    fireEvent.press(getByTestId("barcode-scanner"), "9784167158057");

    await waitFor(() => {
      // エラーがログに記録されることを確認
      expect(consoleSpy).toHaveBeenCalled();

      // エラーアラートが表示されることを確認
      expect(Alert.alert).toHaveBeenCalledWith(
        "エラー",
        "本の検索中にエラーが発生しました。",
        expect.anything()
      );

      // onCloseは呼ばれないはず
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it("prevents multiple scans", async () => {
    const mockBook = {
      id: "123",
      title: "テスト本",
      author: "テスト著者",
      coverImage: "https://example.com/test.jpg",
    };

    // 新しい本を見つけた場合の戻り値をモック
    require("../../services/RakutenBookService").RakutenBookService.searchAndSaveBook.mockResolvedValueOnce(
      {
        book: mockBook,
        isExisting: false,
      }
    );

    const { getByTestId } = render(<BarcodeScanner onClose={mockOnClose} />);

    // バーコードスキャンを2回シミュレート
    fireEvent.press(getByTestId("barcode-scanner"), "9784167158057");
    fireEvent.press(getByTestId("barcode-scanner"), "9784167158057");

    await waitFor(() => {
      // searchAndSaveBookは1回だけ呼ばれるはず
      expect(
        require("../../services/RakutenBookService").RakutenBookService
          .searchAndSaveBook
      ).toHaveBeenCalledTimes(1);
    });
  });
});
