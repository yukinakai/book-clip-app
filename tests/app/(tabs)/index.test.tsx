import React from "react";
import { render, fireEvent, act } from "../../test-utils";
import HomeScreen from "../../../app/(tabs)/index";
import { Alert } from "react-native";
import { Book } from "../../../constants/MockData";

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
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");

  return {
    __esModule: true,
    default: jest.fn(({ onSelectBook, headerTitle, refreshTrigger }) => {
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
  const React = require("react");
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
    expect(getByTestId("header-title")).toHaveTextContent("マイライブラリ");
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

  it("画像がキャプチャされたときアラートが表示されること", () => {
    const { getByTestId } = render(<HomeScreen />);

    // 追加ボタンをタップしてカメラモーダルを表示
    fireEvent.press(getByTestId("add-book-button"));

    // 画像をキャプチャ
    fireEvent.press(getByTestId("capture-button"));

    // コンソールログとアラートが呼び出されることを確認
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "画像が選択されました:",
      "test-image-uri"
    );
    expect(Alert.alert).toHaveBeenCalledWith(
      "画像キャプチャ",
      "写真の処理が完了しました。この後、OCRやバーコードスキャンなどの処理を追加できます。"
    );
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
