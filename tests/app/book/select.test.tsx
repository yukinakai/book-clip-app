import React from "react";
import { render, fireEvent, waitFor } from "../../test-utils";
import BookSelectScreen from "../../../app/book/select";
import { BookStorageService } from "../../../services/BookStorageService";
import { ActivityIndicator } from "react-native";

// モックの設定
let mockLocalSearchParams = {
  fromClip: "false",
  clipText: "",
};

const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
};

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(() => mockLocalSearchParams),
  useRouter: jest.fn(() => mockRouter),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons-Mock",
}));

const mockBooks = [
  {
    id: "1",
    title: "テスト書籍1",
    author: "テスト著者1",
    coverImage: "https://example.com/cover1.jpg",
  },
  {
    id: "2",
    title: "テスト書籍2",
    author: "テスト著者2",
    coverImage: null,
  },
];

jest.mock("../../../services/BookStorageService", () => ({
  BookStorageService: {
    getAllBooks: jest.fn(),
  },
}));

// NoImagePlaceholderをモック
jest.mock(
  "../../../components/NoImagePlaceholder",
  () => "NoImagePlaceholder-Mock"
);

describe("BookSelectScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalSearchParams = { fromClip: "false", clipText: "" };
    BookStorageService.getAllBooks.mockResolvedValue(mockBooks);
  });

  it("ローディング中にActivityIndicatorが表示されること", async () => {
    // getAllBooksの解決を遅延させる
    BookStorageService.getAllBooks.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockBooks), 100))
    );

    const { UNSAFE_getByType } = render(<BookSelectScreen />);

    // ローディングインジケーターが表示されていることを確認
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();

    // ローディング完了まで待機
    await waitFor(() => {
      expect(BookStorageService.getAllBooks).toHaveBeenCalled();
    });
  });

  it("書籍リストが空の場合、適切なメッセージが表示されること", async () => {
    // 空の書籍リストを返すようにモック
    BookStorageService.getAllBooks.mockResolvedValue([]);

    const { findByText } = render(<BookSelectScreen />);

    // 書籍なしメッセージが表示されるまで待機
    const emptyMessage = await findByText("書籍が登録されていません");
    expect(emptyMessage).toBeTruthy();
  });

  it("書籍リストが正しく表示されること", async () => {
    const { findByText } = render(<BookSelectScreen />);

    // 書籍データが表示されるまで待機
    const bookTitle1 = await findByText("テスト書籍1");
    const bookAuthor1 = await findByText("テスト著者1");
    const bookTitle2 = await findByText("テスト書籍2");
    const bookAuthor2 = await findByText("テスト著者2");

    expect(bookTitle1).toBeTruthy();
    expect(bookAuthor1).toBeTruthy();
    expect(bookTitle2).toBeTruthy();
    expect(bookAuthor2).toBeTruthy();
  });

  it("fromClip=falseの場合、書籍選択で正しいURLに遷移すること", async () => {
    const { findByText } = render(<BookSelectScreen />);

    // 書籍をタップ
    const bookTitle = await findByText("テスト書籍1");
    fireEvent.press(bookTitle);

    // 正しいURLに遷移することを確認
    expect(mockRouter.push).toHaveBeenCalledWith(
      "/book/add-clip?bookId=1&bookTitle=%E3%83%86%E3%82%B9%E3%83%88%E6%9B%B8%E7%B1%8D1"
    );
  });

  it("fromClip=trueの場合、clipTextパラメータ付きで正しいURLに遷移すること", async () => {
    // fromClip=trueとclipTextを設定
    mockLocalSearchParams = {
      fromClip: "true",
      clipText: "サンプルテキスト",
    };

    const { findByText } = render(<BookSelectScreen />);

    // 書籍をタップ
    const bookTitle = await findByText("テスト書籍1");
    fireEvent.press(bookTitle);

    // clipTextパラメータ付きで正しいURLに遷移することを確認
    expect(mockRouter.push).toHaveBeenCalledWith(
      "/book/add-clip?bookId=1&bookTitle=%E3%83%86%E3%82%B9%E3%83%88%E6%9B%B8%E7%B1%8D1&clipText=%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB%E3%83%86%E3%82%AD%E3%82%B9%E3%83%88"
    );
  });

  it("戻るボタンを押すと前の画面に戻ること", async () => {
    const { findByTestId } = render(<BookSelectScreen />);

    // 戻るボタンをタップ
    const backButton = await findByTestId("back-button");
    fireEvent.press(backButton);

    // 前の画面に戻ることを確認
    expect(mockRouter.back).toHaveBeenCalled();
  });
});
