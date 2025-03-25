import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import HomeScreen from "../../../app/(tabs)/index";
import { Alert } from "react-native";

// Ioniconsのモック
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons-Mock",
}));

// BookStorageServiceのモック
jest.mock("../../../services/BookStorageService", () => ({
  BookStorageService: {
    getAllBooks: jest.fn().mockResolvedValue([
      {
        id: "1",
        title: "Test Book 1",
        author: "Test Author 1",
        coverImage: "https://example.com/cover1.jpg",
      },
      {
        id: "2",
        title: "Test Book 2",
        author: "Test Author 2",
        coverImage: "https://example.com/cover2.jpg",
      },
    ]),
  },
}));

// BookshelfViewコンポーネントのモック
jest.mock("../../../components/BookshelfView", () => {
  const _React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");

  return {
    __esModule: true,
    default: jest.fn(({ onSelectBook, headerTitle, _refreshTrigger }) => {
      return (
        <View testID="bookshelf-view">
          <Text testID="header-title">{headerTitle}</Text>
          <TouchableOpacity
            testID="book-item-1"
            onPress={() =>
              onSelectBook({
                id: "1",
                title: "Test Book 1",
                author: "Test Author 1",
                coverImage: "https://example.com/cover1.jpg",
              })
            }
          >
            <Text>Test Book 1</Text>
          </TouchableOpacity>
        </View>
      );
    }),
  };
});

// CameraModalコンポーネントをモック
jest.mock("../../../components/camera/CameraModal", () => {
  const _React = require("react");
  const { View, TouchableOpacity, Text } = require("react-native");
  return {
    __esModule: true,
    default: jest.fn(({ isVisible, onClose, onImageCaptured }) => {
      if (!isVisible) return null;
      return (
        <View testID="camera-modal">
          <TouchableOpacity
            testID="capture-button"
            onPress={() => onImageCaptured("test-image-uri")}
          >
            <Text>キャプチャ</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="close-button" onPress={onClose}>
            <Text>閉じる</Text>
          </TouchableOpacity>
        </View>
      );
    }),
  };
});

// CameraViewコンポーネントのモック
jest.mock("../../../components/CameraView", () => {
  const _React = require("react");
  const { View, TouchableOpacity, Text } = require("react-native");
  return {
    __esModule: true,
    default: jest.fn(({ onClose, onCapture }) => {
      return (
        <View testID="ocr-camera-view">
          <TouchableOpacity
            testID="ocr-capture-button"
            onPress={() => onCapture("test-ocr-image-uri")}
          >
            <Text>OCRキャプチャ</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="ocr-close-button" onPress={onClose}>
            <Text>閉じる</Text>
          </TouchableOpacity>
        </View>
      );
    }),
  };
});

// useLastClipBookのモック
jest.mock("../../../contexts/LastClipBookContext", () => ({
  useLastClipBook: jest.fn().mockReturnValue({
    lastClipBook: {
      id: "1",
      title: "Test Book 1",
      author: "Test Author 1",
    },
    setLastClipBook: jest.fn(),
  }),
  // Provider自体もモックする
  LastClipBookProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

// useRouterのモック
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: jest.fn().mockReturnValue({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

// コンソールログのモック
const mockConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});

// Alertのモック
jest.spyOn(Alert, "alert").mockImplementation(() => {});

describe("HomeScreen", () => {
  beforeEach(() => {
    // テスト前に各モックをリセット
    jest.clearAllMocks();
  });

  it("BookshelfViewコンポーネントが正しく表示されること", () => {
    const { getByTestId } = render(<HomeScreen />);

    expect(getByTestId("bookshelf-view")).toBeTruthy();
  });

  it("本を選択するとコンソールログが表示されること", () => {
    const { getByTestId } = render(<HomeScreen />);

    fireEvent.press(getByTestId("book-item-1"));

    expect(mockConsoleLog).toHaveBeenCalledWith(
      "Selected book:",
      "Test Book 1"
    );
  });

  it("追加ボタンをタップするとカメラモーダルが表示されること", () => {
    const { getByTestId, queryByTestId } = render(<HomeScreen />);

    // 初期状態ではカメラモーダルは非表示
    expect(queryByTestId("camera-modal")).toBeNull();

    // 追加ボタンをタップ
    fireEvent.press(getByTestId("add-book-button"));

    // カメラモーダルが表示される
    expect(queryByTestId("camera-modal")).toBeTruthy();
  });

  it("画像がキャプチャされたときルーターのpushが呼び出されること", () => {
    const { getByTestId } = render(<HomeScreen />);

    // 追加ボタンをタップしてカメラモーダルを表示
    fireEvent.press(getByTestId("add-book-button"));

    // 画像をキャプチャ
    fireEvent.press(getByTestId("capture-button"));

    // コンソールログが呼び出されることを確認
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "画像が選択されました:",
      "test-image-uri"
    );

    // 正しいパラメータでrouter.pushが呼び出されることを確認
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/book/add-clip",
      params: {
        imageUri: encodeURIComponent("test-image-uri"),
        bookId: "1",
        bookTitle: encodeURIComponent("Test Book 1"),
      },
    });
  });

  it("カメラモーダルを閉じるとrefreshTriggerが更新されること", () => {
    const { getByTestId } = render(<HomeScreen />);

    // 追加ボタンをタップしてカメラモーダルを表示
    fireEvent.press(getByTestId("add-book-button"));

    // BookshelfViewコンポーネントが初期状態では0のrefreshTriggerを受け取る
    const BookshelfView = require("../../../components/BookshelfView").default;
    expect(BookshelfView).toHaveBeenCalledWith(
      expect.objectContaining({
        refreshTrigger: 0,
      }),
      {}
    );

    // カメラモーダルを閉じる
    fireEvent.press(getByTestId("close-button"));

    // BookshelfViewコンポーネントが更新されたrefreshTriggerを受け取る
    expect(BookshelfView).toHaveBeenCalledWith(
      expect.objectContaining({
        refreshTrigger: 1,
      }),
      {}
    );
  });
});
