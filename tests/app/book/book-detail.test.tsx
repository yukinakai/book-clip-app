import React from "react";
import { render, fireEvent, waitFor } from "../../test-utils";
import BookDetailScreen from "../../../app/book/[id]";
import { Book, Clip } from "../../../constants/MockData";
import { ClipStorageService } from "../../../services/ClipStorageService";

// モックデータ
const mockBooks: Book[] = [
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
    coverImage: "https://example.com/cover2.jpg",
  },
];

const mockClips: Clip[] = [
  {
    id: "1",
    bookId: "1",
    text: "テストクリップ1",
    page: 42,
    createdAt: "2023-06-15T10:30:00Z",
  },
  {
    id: "2",
    bookId: "1",
    text: "テストクリップ2",
    page: 78,
    createdAt: "2023-06-18T14:25:00Z",
  },
];

// モックの設定
jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn().mockReturnValue({ id: "1" }),
  useRouter: jest.fn().mockReturnValue({
    back: jest.fn(),
    push: jest.fn(),
  }),
  useFocusEffect: jest.fn().mockImplementation((callback) => {
    // useFocusEffectのコールバックを即座に実行してテストを簡略化
    callback();
    return () => {};
  }),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons-Mock",
}));

jest.mock("../../../services/BookStorageService", () => ({
  BookStorageService: {
    getAllBooks: jest.fn().mockResolvedValue([
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
        coverImage: "https://example.com/cover2.jpg",
      },
    ]),
  },
}));

jest.mock("../../../services/ClipStorageService", () => ({
  ClipStorageService: {
    getClipsByBookId: jest.fn().mockResolvedValue([
      {
        id: "1",
        bookId: "1",
        text: "テストクリップ1",
        page: 42,
        createdAt: "2023-06-15T10:30:00Z",
      },
      {
        id: "2",
        bookId: "1",
        text: "テストクリップ2",
        page: 78,
        createdAt: "2023-06-18T14:25:00Z",
      },
    ]),
  },
}));

// コンソールエラーのモック
jest.spyOn(console, "error").mockImplementation(() => {});

describe("BookDetailScreen", () => {
  beforeEach(() => {
    // テスト前に各モックをリセット
    jest.clearAllMocks();
  });

  it("書籍詳細が正しく表示されること", async () => {
    const { getByText, queryByText } = render(<BookDetailScreen />);

    // 非同期処理の完了を待つ
    await waitFor(() => {
      expect(queryByText("読み込み中...")).toBeNull();
    });

    // 書籍情報が表示されていることを確認
    expect(getByText("テスト書籍1")).toBeTruthy();
    expect(getByText("テスト著者1")).toBeTruthy();

    // クリップセクションが表示されていることを確認
    expect(getByText("クリップ")).toBeTruthy();
    expect(getByText("テストクリップ1")).toBeTruthy();
    expect(getByText("テストクリップ2")).toBeTruthy();
  });

  it("書籍が見つからない場合はエラーメッセージが表示されること", async () => {
    // BookStorageServiceのモックを一時的に変更
    require("../../../services/BookStorageService").BookStorageService.getAllBooks.mockResolvedValueOnce(
      []
    );

    const { getByText, queryByText } = render(<BookDetailScreen />);

    await waitFor(() => {
      expect(queryByText("読み込み中...")).toBeNull();
    });

    // エラーメッセージが表示されていることを確認
    expect(getByText("書籍が見つかりませんでした")).toBeTruthy();
  });

  it("クリップがない場合は空のメッセージが表示されること", async () => {
    // ClipStorageServiceのモックを一時的に変更
    require("../../../services/ClipStorageService").ClipStorageService.getClipsByBookId.mockResolvedValueOnce(
      []
    );

    const { getByText, queryByText } = render(<BookDetailScreen />);

    await waitFor(() => {
      expect(queryByText("読み込み中...")).toBeNull();
    });

    // 空のメッセージが表示されていることを確認
    expect(getByText("この書籍にはまだクリップがありません")).toBeTruthy();
  });

  it("追加ボタンをタップするとクリップ追加画面に遷移すること", async () => {
    const { getByTestId, queryByText } = render(<BookDetailScreen />);
    const router = require("expo-router").useRouter();

    await waitFor(() => {
      expect(queryByText("読み込み中...")).toBeNull();
    });

    // 追加ボタンをタップ
    const addButton = getByTestId("add-clip-button");
    fireEvent.press(addButton);

    // クリップ追加画面への遷移を確認
    expect(router.push).toHaveBeenCalledWith(
      expect.stringContaining("/book/add-clip")
    );
    // URLにbookIdとbookTitleが含まれていることを確認
    expect(router.push).toHaveBeenCalledWith(
      expect.stringContaining("bookId=1")
    );
    expect(router.push).toHaveBeenCalledWith(
      expect.stringContaining("bookTitle=")
    );
  });

  it("ClipStorageServiceからクリップを正しく取得すること", async () => {
    render(<BookDetailScreen />);

    await waitFor(() => {
      // ClipStorageService.getClipsByBookIdが呼ばれたことを確認
      expect(ClipStorageService.getClipsByBookId).toHaveBeenCalledWith("1");
    });
  });
});
