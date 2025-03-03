import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { BookList } from "../BookList";
import { Book } from "@/types/book";

// Expo Vector Icons のモックを追加
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    FontAwesome: (props: any) => <View {...props}>{props.children}</View>,
  };
});

// useWindowDimensions のモック
jest.mock("@/hooks/useWindowDimensions", () => ({
  useWindowDimensions: () => ({
    width: 400,
    height: 800,
  }),
}));

// Image のモック
jest.mock('@/assets/images/book-placeholder.png', () => 'book-placeholder');

describe("BookList", () => {
  const mockBooks: Book[] = [
    {
      id: "1",
      title: "テスト本1",
      author: "テスト著者1",
      thumbnailUrl: "https://example.com/thumbnail1.jpg",
      isbn: "1234567890123",
      publisher: "テスト出版社1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "test-user-1",
    },
    {
      id: "2",
      title: "テスト本2",
      author: "テスト著者2",
      thumbnailUrl: "https://example.com/thumbnail2.jpg",
      isbn: "1234567890124",
      publisher: "テスト出版社2",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "test-user-1",
    },
  ];

  const mockOnBookPress = jest.fn();
  const mockOnDeletePress = jest.fn();
  const mockOnAddPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("書籍一覧を正しく表示する", () => {
    const { getByTestId } = render(
      <BookList
        books={mockBooks}
        onBookPress={mockOnBookPress}
        onDeletePress={mockOnDeletePress}
        onAddPress={mockOnAddPress}
      />
    );

    expect(getByTestId(`book-title-${mockBooks[0].id}`)).toHaveTextContent("テスト本1");
    expect(getByTestId(`book-author-${mockBooks[0].id}`)).toHaveTextContent("テスト著者1");
    expect(getByTestId(`book-title-${mockBooks[1].id}`)).toHaveTextContent("テスト本2");
    expect(getByTestId(`book-author-${mockBooks[1].id}`)).toHaveTextContent("テスト著者2");
  });

  it("空の状態を正しく表示する", () => {
    const { getByTestId } = render(
      <BookList
        books={[]}
        onBookPress={mockOnBookPress}
        onDeletePress={mockOnDeletePress}
        onAddPress={mockOnAddPress}
      />
    );

    expect(getByTestId("empty-message")).toHaveTextContent("登録されている書籍はありません");
  });

  it("書籍をタップした時にonBookPressが呼ばれる", () => {
    const { getByTestId } = render(
      <BookList
        books={mockBooks}
        onBookPress={mockOnBookPress}
        onDeletePress={mockOnDeletePress}
        onAddPress={mockOnAddPress}
      />
    );

    fireEvent.press(getByTestId(`book-item-${mockBooks[0].id}`));
    expect(mockOnBookPress).toHaveBeenCalledWith(mockBooks[0]);
  });

  it("削除ボタンをタップした時にonDeletePressが呼ばれる", () => {
    const { getByTestId } = render(
      <BookList
        books={mockBooks}
        onBookPress={mockOnBookPress}
        onDeletePress={mockOnDeletePress}
        onAddPress={mockOnAddPress}
      />
    );

    fireEvent.press(getByTestId(`delete-button-${mockBooks[0].id}`));
    expect(mockOnDeletePress).toHaveBeenCalledWith(mockBooks[0].id);
  });

  it("追加ボタンをタップした時にonAddPressが呼ばれる", () => {
    const { getByTestId } = render(
      <BookList
        books={mockBooks}
        onBookPress={mockOnBookPress}
        onDeletePress={mockOnDeletePress}
        onAddPress={mockOnAddPress}
      />
    );

    fireEvent.press(getByTestId("add-button"));
    expect(mockOnAddPress).toHaveBeenCalled();
  });

  it("空の状態でも追加ボタンが表示される", () => {
    const { getByTestId } = render(
      <BookList
        books={[]}
        onBookPress={mockOnBookPress}
        onDeletePress={mockOnDeletePress}
        onAddPress={mockOnAddPress}
      />
    );

    expect(getByTestId("add-button")).toBeTruthy();
  });
});
