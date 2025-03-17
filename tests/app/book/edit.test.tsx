import React from "react";
import { render, fireEvent, act } from "../../test-utils";
import { waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";

// expo-routerのモック
jest.mock("expo-router", () => {
  const mockRouter = {
    back: jest.fn(),
    push: jest.fn(),
  };

  return {
    useLocalSearchParams: jest.fn().mockReturnValue({
      id: "1",
      title: "テスト書籍",
      author: "テスト著者",
      coverImage: "https://example.com/cover.jpg",
    }),
    useRouter: jest.fn().mockReturnValue(mockRouter),
  };
});

// BookStorageServiceのモック
const mockGetAllBooks = jest.fn().mockResolvedValue([
  {
    id: "1",
    title: "テスト書籍",
    author: "テスト著者",
    coverImage: "https://example.com/cover.jpg",
  },
]);

const mockRemoveBook = jest.fn().mockResolvedValue(undefined);
const mockSaveBook = jest.fn().mockResolvedValue(undefined);

jest.mock("../../../services/BookStorageService", () => ({
  BookStorageService: {
    getAllBooks: () => mockGetAllBooks(),
    removeBook: (id: string) => mockRemoveBook(id),
    saveBook: (book: any) => mockSaveBook(book),
    deleteBook: jest.fn(),
  },
}));

// アイコンのモック
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons-Mock",
}));

// Alertのモック
jest.spyOn(Alert, "alert").mockImplementation((_title, _message, buttons) => {
  // OKボタンが押された場合のコールバックを実行
  const okButton = buttons?.find((button) => button.text === "OK");
  if (okButton && okButton.onPress) {
    okButton.onPress();
  }
  return 0;
});

// 実際のコンポーネントをインポート
import EditBookScreen from "../../../app/book/edit";

describe("EditBookScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("初期値が正しく表示されること", () => {
    const { getByTestId } = render(<EditBookScreen />);

    // タイトル入力フィールドの初期値を確認
    const titleInput = getByTestId("title-input");
    expect(titleInput.props.value).toBe("テスト書籍");

    // 著者入力フィールドの初期値を確認
    const authorInput = getByTestId("author-input");
    expect(authorInput.props.value).toBe("テスト著者");

    // カバー画像URL入力フィールドの初期値を確認
    const coverInput = getByTestId("cover-input");
    expect(coverInput.props.value).toBe("https://example.com/cover.jpg");
  });

  test("入力値が正しく更新されること", () => {
    const { getByTestId } = render(<EditBookScreen />);

    // タイトル入力を変更
    const titleInput = getByTestId("title-input");
    fireEvent.changeText(titleInput, "新しいタイトル");
    expect(titleInput.props.value).toBe("新しいタイトル");

    // 著者入力を変更
    const authorInput = getByTestId("author-input");
    fireEvent.changeText(authorInput, "新しい著者");
    expect(authorInput.props.value).toBe("新しい著者");

    // カバー画像URL入力を変更
    const coverInput = getByTestId("cover-input");
    fireEvent.changeText(coverInput, "https://example.com/new-cover.jpg");
    expect(coverInput.props.value).toBe("https://example.com/new-cover.jpg");
  });

  test("保存ボタンをタップすると書籍が更新されること", async () => {
    const { getByTestId } = render(<EditBookScreen />);

    // タイトル入力を変更
    const titleInput = getByTestId("title-input");
    fireEvent.changeText(titleInput, "更新されたタイトル");

    // 保存ボタンをタップ
    const saveButton = getByTestId("save-button");
    await act(async () => {
      fireEvent.press(saveButton);
    });

    // 更新関数が呼ばれたことを確認
    await waitFor(() => {
      expect(mockRemoveBook).toHaveBeenCalledWith("1");
      expect(mockSaveBook).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "1",
          title: "更新されたタイトル",
          author: "テスト著者",
          coverImage: "https://example.com/cover.jpg",
        })
      );
    });

    // 成功後にルーターのback関数が呼ばれることを確認
    const router = require("expo-router").useRouter();
    expect(router.back).toHaveBeenCalled();
  });

  test("タイトルが空の場合はエラーが表示されること", async () => {
    const { getByTestId } = render(<EditBookScreen />);

    // タイトル入力を空に変更
    const titleInput = getByTestId("title-input");
    fireEvent.changeText(titleInput, "");

    // 保存ボタンをタップ
    const saveButton = getByTestId("save-button");
    await act(async () => {
      fireEvent.press(saveButton);
    });

    // アラートが表示されることを確認
    expect(Alert.alert).toHaveBeenCalledWith("エラー", "タイトルは必須です");
  });

  test("戻るボタンをタップすると前の画面に戻ること", () => {
    const { getByTestId } = render(<EditBookScreen />);

    // 戻るボタンをタップ
    const backButton = getByTestId("back-button");
    fireEvent.press(backButton);

    // ルーターのback関数が呼ばれることを確認
    const router = require("expo-router").useRouter();
    expect(router.back).toHaveBeenCalled();
  });
});
