import { renderHook, act } from "@testing-library/react";
import { Alert } from "react-native";
import { useBookScanner } from "../../hooks/useBookScanner";
import { RakutenBookService } from "../../services/RakutenBookService";
import { BookStorageService } from "../../services/BookStorageService";
import { Book } from "../../constants/MockData";
import { router } from "expo-router";

// RakutenBookServiceのモック
jest.mock("../../services/RakutenBookService", () => ({
  RakutenBookService: {
    searchByIsbn: jest.fn(),
    searchAndSaveBook: jest.fn(),
  },
}));

// BookStorageServiceのモック
jest.mock("../../services/BookStorageService", () => ({
  BookStorageService: {
    saveBook: jest.fn(),
  },
}));

// expo-routerのモック
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

// 非同期イベントをシミュレートするためのsetTimeout
jest.useFakeTimers();

// Alertのモック
jest.spyOn(Alert, "alert").mockImplementation((_title, _message, buttons) => {
  // ボタンが存在する場合、最後のボタンのonPressを実行（最後のボタンは通常「OK」や「追加する」など）
  if (buttons && buttons.length > 0) {
    const lastButton = buttons[buttons.length - 1];
    if (lastButton.onPress) {
      lastButton.onPress();
    }
  }
  return 0;
});

// サンプルの書籍データ
const mockBook: Book = {
  id: "test-id-1",
  title: "テスト書籍",
  author: "テスト著者",
  coverImage: "https://example.com/cover.jpg",
  isbn: "9784000000000",
};

describe("useBookScanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it("初期状態で適切な値が提供されること", () => {
    const mockOnClose = jest.fn();
    const { result } = renderHook(() =>
      useBookScanner({ onClose: mockOnClose })
    );

    // フックが適切な値を返すことを確認
    expect(result.current.isLoading).toBe(false);
    expect(result.current.showManualEntryForm).toBe(false);
    expect(result.current.bookTitle).toBe("");
    expect(result.current.bookAuthor).toBe("");
    expect(typeof result.current.handleBarcodeScanned).toBe("function");
    expect(typeof result.current.resetScanner).toBe("function");
    expect(typeof result.current.showManualForm).toBe("function");
    expect(typeof result.current.hideManualForm).toBe("function");
    expect(typeof result.current.handleManualSave).toBe("function");
  });

  it("showManualFormで手動入力フォームが表示されること", () => {
    const mockOnClose = jest.fn();
    const { result } = renderHook(() =>
      useBookScanner({ onClose: mockOnClose })
    );

    // 初期状態を確認
    expect(result.current.showManualEntryForm).toBe(false);

    // 手動入力フォームを表示
    act(() => {
      result.current.showManualForm();
    });

    // 手動入力フォームが表示されていることを確認
    expect(result.current.showManualEntryForm).toBe(true);
  });

  it("hideManualFormで手動入力フォームが非表示になり、入力値がリセットされること", () => {
    const mockOnClose = jest.fn();
    const { result } = renderHook(() =>
      useBookScanner({ onClose: mockOnClose })
    );

    // 初期状態でフォームを表示し、値を設定
    act(() => {
      result.current.showManualForm();
      result.current.setBookTitle("テスト書籍");
      result.current.setBookAuthor("テスト著者");
    });

    // 値が設定されていることを確認
    expect(result.current.showManualEntryForm).toBe(true);
    expect(result.current.bookTitle).toBe("テスト書籍");
    expect(result.current.bookAuthor).toBe("テスト著者");

    // フォームを非表示にする
    act(() => {
      result.current.hideManualForm();
    });

    // フォームが非表示になり、値がリセットされていることを確認
    expect(result.current.showManualEntryForm).toBe(false);
    expect(result.current.bookTitle).toBe("");
    expect(result.current.bookAuthor).toBe("");
  });

  it("resetScannerで全ての状態がリセットされること", () => {
    const mockOnClose = jest.fn();
    const { result } = renderHook(() =>
      useBookScanner({ onClose: mockOnClose })
    );

    // 状態を変更
    act(() => {
      result.current.showManualForm();
      result.current.setBookTitle("テスト書籍");
      result.current.setBookAuthor("テスト著者");
      // 内部状態も変更（直接アクセスはできないので関数を呼ぶ）
    });

    // リセットする
    act(() => {
      result.current.resetScanner();
    });

    // 全ての状態がリセットされていることを確認
    expect(result.current.showManualEntryForm).toBe(false);
    expect(result.current.bookTitle).toBe("");
    expect(result.current.bookAuthor).toBe("");
    expect(result.current.isLoading).toBe(false);
  });

  it("手動入力から書籍が保存され、詳細画面に遷移すること", async () => {
    const mockOnClose = jest.fn();
    const mockSaveBook = jest.mocked(BookStorageService.saveBook);
    mockSaveBook.mockResolvedValue(undefined);

    // Alert.alertのモックをオーバーライド（「詳細を見る」ボタンを選択するケース）
    jest
      .spyOn(Alert, "alert")
      .mockImplementation((_title, _message, buttons) => {
        if (buttons && buttons.length > 0 && _title === "保存完了") {
          const viewDetailsButton = buttons[0]; // 「詳細を見る」ボタン
          if (viewDetailsButton.onPress) {
            viewDetailsButton.onPress();
          }
        }
        return 0;
      });

    const { result } = renderHook(() =>
      useBookScanner({ onClose: mockOnClose })
    );

    // 手動入力フォームを表示して値を設定
    act(() => {
      result.current.showManualForm();
      result.current.setBookTitle("テスト書籍");
      result.current.setBookAuthor("テスト著者");
    });

    // 書籍を保存
    await act(async () => {
      await result.current.handleManualSave();
    });

    // BookStorageService.saveBookが呼ばれたことを確認
    expect(mockSaveBook).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "テスト書籍",
        author: "テスト著者",
      })
    );

    // onCloseが呼ばれること
    expect(mockOnClose).toHaveBeenCalled();

    // タイマーを実行して非同期処理を完了させる
    act(() => {
      jest.runAllTimers();
    });

    // router.pushが呼ばれたことを確認（詳細画面に遷移）
    expect(router.push).toHaveBeenCalledWith(
      expect.stringMatching(/^\/book\/.+/)
    );
  });

  it("ISBN検出時に楽天APIで検索され、書籍が保存されること", async () => {
    const mockOnClose = jest.fn();
    const mockSearchByIsbn = jest.mocked(RakutenBookService.searchByIsbn);
    const mockSearchAndSaveBook = jest.mocked(
      RakutenBookService.searchAndSaveBook
    );

    // 楽天APIの検索結果をモック
    mockSearchByIsbn.mockResolvedValue(mockBook);
    mockSearchAndSaveBook.mockResolvedValue({
      book: mockBook,
      isExisting: false,
    });

    // Alert.alertのモックをオーバーライド（「検索する」→「追加する」→「詳細を見る」の順で選択するケース）
    jest
      .spyOn(Alert, "alert")
      .mockImplementation((_title, _message, buttons) => {
        if (!buttons || buttons.length === 0) return 0;

        if (_title === "ISBN検出" && buttons.length > 1) {
          const searchButton = buttons[1]; // 「検索する」ボタン
          if (searchButton.onPress) {
            searchButton.onPress();
          }
        } else if (_title === "書籍情報" && buttons.length > 1) {
          const addButton = buttons[1]; // 「追加する」ボタン
          if (addButton.onPress) {
            addButton.onPress();
          }
        } else if (_title === "保存完了" && buttons.length > 0) {
          const viewDetailsButton = buttons[0]; // 「詳細を見る」ボタン
          if (viewDetailsButton.onPress) {
            viewDetailsButton.onPress();
          }
        }
        return 0;
      });

    const { result } = renderHook(() =>
      useBookScanner({ onClose: mockOnClose })
    );

    // ISBNをスキャン
    await act(async () => {
      await result.current.handleBarcodeScanned("9784000000000");
    });

    // 楽天APIの検索が呼ばれたことを確認
    expect(mockSearchByIsbn).toHaveBeenCalledWith("9784000000000");

    // 書籍の保存が呼ばれたことを確認
    expect(mockSearchAndSaveBook).toHaveBeenCalledWith("9784000000000");

    // onCloseが呼ばれること
    expect(mockOnClose).toHaveBeenCalled();

    // タイマーを実行して非同期処理を完了させる
    act(() => {
      jest.runAllTimers();
    });

    // router.pushが呼ばれたことを確認（詳細画面に遷移）
    expect(router.push).toHaveBeenCalledWith(`/book/${mockBook.id}`);
  });

  it("既存の書籍がスキャンされた場合、適切なアラートが表示されること", async () => {
    const mockOnClose = jest.fn();
    const mockSearchByIsbn = jest.mocked(RakutenBookService.searchByIsbn);
    const mockSearchAndSaveBook = jest.mocked(
      RakutenBookService.searchAndSaveBook
    );

    // 楽天APIの検索結果をモック（既存の書籍）
    mockSearchByIsbn.mockResolvedValue(mockBook);
    mockSearchAndSaveBook.mockResolvedValue({
      book: mockBook,
      isExisting: true, // 既存の書籍
    });

    // Alert.alertのモックをオーバーライド
    jest
      .spyOn(Alert, "alert")
      .mockImplementation((_title, _message, buttons) => {
        if (!buttons || buttons.length === 0) return 0;

        if (_title === "ISBN検出" && buttons.length > 1) {
          const searchButton = buttons[1]; // 「検索する」ボタン
          if (searchButton.onPress) {
            searchButton.onPress();
          }
        } else if (_title === "書籍情報" && buttons.length > 1) {
          const addButton = buttons[1]; // 「追加する」ボタン
          if (addButton.onPress) {
            addButton.onPress();
          }
        } else if (_title === "登録済みの本" && buttons.length > 0) {
          const viewDetailsButton = buttons[0]; // 「詳細を見る」ボタン
          if (viewDetailsButton.onPress) {
            viewDetailsButton.onPress();
          }
        }
        return 0;
      });

    const { result } = renderHook(() =>
      useBookScanner({ onClose: mockOnClose })
    );

    // ISBNをスキャン
    await act(async () => {
      await result.current.handleBarcodeScanned("9784000000000");
    });

    // 楽天APIの検索が呼ばれたことを確認
    expect(mockSearchByIsbn).toHaveBeenCalledWith("9784000000000");

    // 書籍の保存が呼ばれたことを確認
    expect(mockSearchAndSaveBook).toHaveBeenCalledWith("9784000000000");

    // onCloseが呼ばれること
    expect(mockOnClose).toHaveBeenCalled();

    // タイマーを実行して非同期処理を完了させる
    act(() => {
      jest.runAllTimers();
    });

    // router.pushが呼ばれたことを確認（詳細画面に遷移）
    expect(router.push).toHaveBeenCalledWith(`/book/${mockBook.id}`);
  });

  it("書籍が見つからない場合、手動入力フォームが表示されること", async () => {
    const mockOnClose = jest.fn();
    const mockSearchByIsbn = jest.mocked(RakutenBookService.searchByIsbn);

    // 楽天APIの検索結果をモック（書籍なし）
    mockSearchByIsbn.mockResolvedValue(null);

    // Alert.alertのモックをオーバーライド
    jest
      .spyOn(Alert, "alert")
      .mockImplementation((_title, _message, buttons) => {
        if (!buttons || buttons.length === 0) return 0;

        if (_title === "ISBN検出" && buttons.length > 1) {
          const searchButton = buttons[1]; // 「検索する」ボタン
          if (searchButton.onPress) {
            searchButton.onPress();
          }
        } else if (_title === "書籍が見つかりません" && buttons.length > 1) {
          const yesButton = buttons[1]; // 「はい」ボタン（手動入力）
          if (yesButton.onPress) {
            yesButton.onPress();
          }
        }
        return 0;
      });

    const { result } = renderHook(() =>
      useBookScanner({ onClose: mockOnClose })
    );

    // ISBNをスキャン
    await act(async () => {
      await result.current.handleBarcodeScanned("9784000000000");
    });

    // 楽天APIの検索が呼ばれたことを確認
    expect(mockSearchByIsbn).toHaveBeenCalledWith("9784000000000");

    // 手動入力フォームが表示されていることを確認
    expect(result.current.showManualEntryForm).toBe(true);
  });

  it("検索中にエラーが発生した場合、エラーアラートが表示されること", async () => {
    const mockOnClose = jest.fn();
    const mockSearchByIsbn = jest.mocked(RakutenBookService.searchByIsbn);

    // 楽天APIのエラーをモック
    mockSearchByIsbn.mockRejectedValue(new Error("API接続エラー"));

    // Alert.alertのモックをオーバーライド
    const mockAlert = jest
      .spyOn(Alert, "alert")
      .mockImplementation((_title, _message, buttons) => {
        if (!buttons || buttons.length === 0) return 0;

        if (_title === "ISBN検出" && buttons.length > 1) {
          const searchButton = buttons[1]; // 「検索する」ボタン
          if (searchButton.onPress) {
            searchButton.onPress();
          }
        } else if (_title === "エラー" && buttons.length > 0) {
          const okButton = buttons[0]; // 「OK」ボタン
          if (okButton.onPress) {
            okButton.onPress();
          }
        }
        return 0;
      });

    const { result } = renderHook(() =>
      useBookScanner({ onClose: mockOnClose })
    );

    // ISBNをスキャン
    await act(async () => {
      await result.current.handleBarcodeScanned("9784000000000");
    });

    // 楽天APIの検索が呼ばれたことを確認
    expect(mockSearchByIsbn).toHaveBeenCalledWith("9784000000000");

    // エラーアラートが表示されたことを確認
    expect(mockAlert).toHaveBeenCalledWith(
      "エラー",
      "本の検索中にエラーが発生しました。",
      expect.any(Array)
    );
  });

  it("同じISBNが連続でスキャンされた場合、2回目は処理されないこと", async () => {
    const mockOnClose = jest.fn();
    const mockSearchByIsbn = jest.mocked(RakutenBookService.searchByIsbn);

    // Alert.alertのモックをリセット
    jest.spyOn(Alert, "alert").mockImplementation(() => 0);

    const { result } = renderHook(() =>
      useBookScanner({ onClose: mockOnClose })
    );

    // 1回目のスキャン
    await act(async () => {
      await result.current.handleBarcodeScanned("9784000000000");
    });

    // アラートが1回呼ばれたことを確認
    expect(Alert.alert).toHaveBeenCalledTimes(1);

    // 同じISBNで2回目のスキャン
    await act(async () => {
      await result.current.handleBarcodeScanned("9784000000000");
    });

    // アラートが追加で呼ばれないことを確認
    expect(Alert.alert).toHaveBeenCalledTimes(1);
    expect(mockSearchByIsbn).not.toHaveBeenCalled(); // APIが呼ばれない
  });

  it("デバウンスとスキャナーリセット後は新たなISBNが処理されること", async () => {
    const mockOnClose = jest.fn();
    // RakutenBookServiceのモック
    const searchByIsbnMock = jest.mocked(RakutenBookService.searchByIsbn);
    searchByIsbnMock.mockResolvedValue(mockBook);

    // Alert.alertのモックをリセット
    const alertMock = jest.spyOn(Alert, "alert").mockImplementation(() => 0);

    const { result } = renderHook(() =>
      useBookScanner({ onClose: mockOnClose })
    );

    // 1回目のスキャン
    await act(async () => {
      await result.current.handleBarcodeScanned("9784000000001");
    });

    // アラートが表示されることを確認
    expect(alertMock).toHaveBeenCalledWith(
      "ISBN検出",
      expect.stringContaining("9784000000001"),
      expect.any(Array)
    );

    // スキャナーをリセット
    act(() => {
      result.current.resetScanner();
    });

    // mockをリセット
    jest.clearAllMocks();

    // リセット後の2回目のスキャン（同じISBN）
    await act(async () => {
      await result.current.handleBarcodeScanned("9784000000001");
    });

    // リセット後は再び処理されることを確認
    expect(alertMock).toHaveBeenCalledWith(
      "ISBN検出",
      expect.stringContaining("9784000000001"),
      expect.any(Array)
    );
  });

  it("手動入力で書籍名が空の場合、エラーアラートが表示されること", async () => {
    const mockOnClose = jest.fn();
    const mockSaveBook = jest.mocked(BookStorageService.saveBook);

    // Alert.alertのモックをリセット
    jest.spyOn(Alert, "alert").mockImplementation((_title, _message) => {
      // ボタン引数なしのモック実装
      return 0;
    });

    const { result } = renderHook(() =>
      useBookScanner({ onClose: mockOnClose })
    );

    // 手動入力フォームを表示して書籍名を空のままにする
    act(() => {
      result.current.showManualForm();
      result.current.setBookTitle("");
      result.current.setBookAuthor("テスト著者");
    });

    // 書籍を保存
    await act(async () => {
      await result.current.handleManualSave();
    });

    // BookStorageService.saveBookが呼ばれないことを確認
    expect(mockSaveBook).not.toHaveBeenCalled();

    // エラーアラートが表示されたことを確認
    expect(Alert.alert).toHaveBeenCalledWith("エラー", "書籍名は必須です");
  });

  it("手動入力で保存中にエラーが発生した場合、エラーアラートが表示されること", async () => {
    const mockOnClose = jest.fn();
    const mockSaveBook = jest.mocked(BookStorageService.saveBook);

    // 保存時のエラーをモック
    mockSaveBook.mockRejectedValue(new Error("保存エラー"));

    // Alert.alertのモックをリセット
    const mockAlert = jest.spyOn(Alert, "alert").mockImplementation(() => 0);

    const { result } = renderHook(() =>
      useBookScanner({ onClose: mockOnClose })
    );

    // 手動入力フォームを表示して値を設定
    act(() => {
      result.current.showManualForm();
      result.current.setBookTitle("テスト書籍");
      result.current.setBookAuthor("テスト著者");
    });

    // 書籍を保存
    await act(async () => {
      await result.current.handleManualSave();
    });

    // BookStorageService.saveBookが呼ばれたことを確認
    expect(mockSaveBook).toHaveBeenCalled();

    // エラーアラートが表示されたことを確認
    expect(mockAlert).toHaveBeenCalledWith(
      "エラー",
      "書籍の保存中にエラーが発生しました。",
      expect.any(Array)
    );
  });
});
