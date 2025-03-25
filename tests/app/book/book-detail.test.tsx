import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import BookDetailScreen from "../../../app/book/[id]";
import { Alert, Platform, ActionSheetIOS } from "react-native";

// モックデータ
const mockBook = {
  id: "1",
  title: "テスト書籍1",
  author: "テスト著者1",
  coverImage: "https://example.com/cover1.jpg",
};

const mockClips = [
  {
    id: "clip1",
    bookId: "1",
    text: "テストクリップ1",
    page: 42,
    createdAt: "2023-06-15T10:30:00Z",
  },
  {
    id: "clip2",
    bookId: "1",
    text: "テストクリップ2",
    page: 50,
    createdAt: "2023-06-16T15:45:00Z",
  },
];

// BookStorageServiceのモック
jest.mock("../../../services/BookStorageService", () => ({
  BookStorageService: {
    getBookById: jest.fn().mockResolvedValue(mockBook),
    deleteBook: jest.fn().mockResolvedValue(true),
  },
}));

// ClipStorageServiceのモック
jest.mock("../../../services/ClipStorageService", () => ({
  ClipStorageService: {
    getClipsByBookId: jest.fn().mockResolvedValue(mockClips),
    deleteClipsByBookId: jest.fn().mockResolvedValue(true),
  },
}));

// NoImagePlaceholderのモック
jest.mock(
  "../../../components/NoImagePlaceholder",
  () => "NoImagePlaceholder-Mock"
);

// expo-routerのモック
const mockBack = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn().mockReturnValue({ id: "1" }),
  useRouter: jest.fn().mockReturnValue({
    back: mockBack,
    push: mockPush,
    replace: mockReplace,
  }),
  useFocusEffect: jest.fn((callback) => {
    // useFocusEffectをシミュレート - コールバックを即時実行
    const cb = callback();
    if (typeof cb === "function") {
      cb();
    }
  }),
}));

// Alertのモック
jest.spyOn(Alert, "alert").mockImplementation((title, message, buttons) => {
  // 削除確認ボタンが渡された場合、削除処理を実行
  if (buttons && buttons.length > 1 && buttons[1].text === "削除") {
    buttons[1].onPress && buttons[1].onPress();
  }
});

// ActionSheetIOSのモック
jest.mock("react-native/Libraries/ActionSheetIOS/ActionSheetIOS", () => ({
  showActionSheetWithOptions: jest.fn((options, callback) => {
    // 編集（インデックス1）または削除（インデックス2）を選択したときの処理をシミュレート
    callback(2); // デフォルトで削除を選択
  }),
}));

// Platformのモック
jest.mock("react-native/Libraries/Utilities/Platform", () => ({
  OS: "ios",
  select: jest.fn((obj) => obj.ios),
}));

// アイコンのモック
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons-Mock",
}));

// コンソールエラーの抑制（オプション）
jest.spyOn(console, "error").mockImplementation(() => {});
// ログ出力の抑制（オプション）
jest.spyOn(console, "log").mockImplementation(() => {});

describe("BookDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("書籍データとクリップが正しく読み込まれること", async () => {
    const { getByText, queryByText } = render(<BookDetailScreen />);

    // 初期状態では読み込み中と表示される
    expect(queryByText("読み込み中...")).toBeTruthy();

    // データが読み込まれると書籍情報が表示される
    await waitFor(() => {
      expect(getByText("テスト書籍1")).toBeTruthy();
      expect(getByText("テスト著者1")).toBeTruthy();
    });

    // APIが呼ばれたことを確認
    const {
      BookStorageService,
    } = require("../../../services/BookStorageService");
    const {
      ClipStorageService,
    } = require("../../../services/ClipStorageService");

    expect(BookStorageService.getBookById).toHaveBeenCalledWith("1");
    expect(ClipStorageService.getClipsByBookId).toHaveBeenCalledWith("1");
  });

  it("バックボタンを押すと前の画面に戻ること", async () => {
    const { getByTestId } = render(<BookDetailScreen />);

    // データの読み込みを待つ
    await waitFor(() => {
      expect(getByTestId("back-button")).toBeTruthy();
    });

    // バックボタンをタップ
    fireEvent.press(getByTestId("back-button"));

    // router.backが呼ばれたことを確認
    expect(mockBack).toHaveBeenCalled();
  });

  it("追加ボタンをタップするとクリップ追加画面に遷移すること", async () => {
    const { getByTestId } = render(<BookDetailScreen />);

    // データの読み込みを待つ
    await waitFor(() => {
      expect(getByTestId("add-clip-button")).toBeTruthy();
    });

    // 追加ボタンをタップ
    fireEvent.press(getByTestId("add-clip-button"));

    // router.pushが呼ばれたことを確認
    expect(mockPush).toHaveBeenCalledWith(
      `/book/add-clip?bookId=1&bookTitle=${encodeURIComponent("テスト書籍1")}`
    );
  });

  it("オプションボタンをタップするとメニューが表示されること", async () => {
    const { getByTestId } = render(<BookDetailScreen />);

    // データの読み込みを待つ
    await waitFor(() => {
      expect(getByTestId("options-button")).toBeTruthy();
    });

    // オプションボタンをタップ
    fireEvent.press(getByTestId("options-button"));

    // iOS環境では ActionSheetIOS が呼ばれる
    if (Platform.OS === "ios") {
      expect(ActionSheetIOS.showActionSheetWithOptions).toHaveBeenCalled();
    } else {
      // Android環境では Alert が呼ばれる
      expect(Alert.alert).toHaveBeenCalledWith(
        "書籍オプション",
        "選択してください",
        expect.anything()
      );
    }
  });

  it("削除を選択すると確認ダイアログが表示され、確認後に書籍が削除されること", async () => {
    const { getByTestId } = render(<BookDetailScreen />);

    // データの読み込みを待つ
    await waitFor(() => {
      expect(getByTestId("options-button")).toBeTruthy();
    });

    // オプションボタンをタップ
    fireEvent.press(getByTestId("options-button"));

    // 削除確認ダイアログが表示されることを確認
    expect(Alert.alert).toHaveBeenCalledWith(
      "書籍を削除しますか？",
      "この書籍に関連するすべてのクリップも削除されます。この操作は元に戻せません。",
      expect.anything()
    );

    // 関連するクリップと書籍が削除されたことを確認
    const {
      ClipStorageService,
    } = require("../../../services/ClipStorageService");
    const {
      BookStorageService,
    } = require("../../../services/BookStorageService");

    await waitFor(() => {
      expect(ClipStorageService.deleteClipsByBookId).toHaveBeenCalledWith("1");
      expect(BookStorageService.deleteBook).toHaveBeenCalledWith("1");
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });

  it("クリップアイテムをタップするとクリップ詳細画面に遷移すること", async () => {
    const { getAllByTestId } = render(<BookDetailScreen />);

    // クリップアイテムが表示されるのを待つ
    await waitFor(() => {
      const clipItems = getAllByTestId(/^clip-item-/);
      expect(clipItems.length).toBeGreaterThan(0);
    });

    // 最初のクリップアイテムをタップ
    const clipItems = getAllByTestId(/^clip-item-/);
    fireEvent.press(clipItems[0]);

    // router.pushが呼ばれることを確認
    expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/^\/clip\/.+/));
  });

  it("書籍データが取得できない場合はエラーメッセージが表示されること", async () => {
    // 一時的に書籍データが見つからない状態にする
    const {
      BookStorageService,
    } = require("../../../services/BookStorageService");
    BookStorageService.getBookById.mockResolvedValueOnce(null);

    const { getByText } = render(<BookDetailScreen />);

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(getByText("書籍が見つかりませんでした")).toBeTruthy();
    });
  });
});
