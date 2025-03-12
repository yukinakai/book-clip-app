import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import BookshelfView from "../../components/BookshelfView";
import { Book } from "../../constants/MockData";

// モックの設定
jest.mock("../../hooks/useThemeColor", () => ({
  useThemeColor: () => "#FFFFFF",
}));

jest.mock("react-native-safe-area-context", () => {
  const { View } = require("react-native");
  return {
    SafeAreaView: ({
      children,
      style,
    }: {
      children: React.ReactNode;
      style?: any;
    }) => <View style={style}>{children}</View>,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

// BookItemコンポーネントのモック
jest.mock("../../components/BookItem", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return {
    __esModule: true,
    default: jest.fn(({ book, onPress }) => (
      <TouchableOpacity testID="book-item" onPress={() => onPress(book)}>
        <Text>{book.title}</Text>
      </TouchableOpacity>
    )),
  };
});

// BookStorageServiceのモック
const mockBooks: Book[] = [
  {
    id: "1",
    title: "Test Book 1",
    author: "Author 1",
    coverImage: "https://example.com/image1.jpg",
  },
  {
    id: "2",
    title: "Test Book 2",
    author: "Author 2",
    coverImage: "https://example.com/image2.jpg",
  },
];

jest.mock("../../services/BookStorageService", () => ({
  BookStorageService: {
    getAllBooks: jest.fn().mockResolvedValue([
      {
        id: "1",
        title: "Test Book 1",
        author: "Author 1",
        coverImage: "https://example.com/image1.jpg",
      },
      {
        id: "2",
        title: "Test Book 2",
        author: "Author 2",
        coverImage: "https://example.com/image2.jpg",
      },
    ]),
  },
}));

describe.skip("BookshelfView", () => {
  const mockOnSelectBook = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without header title", async () => {
    const { queryByText } = render(
      <BookshelfView onSelectBook={mockOnSelectBook} />
    );

    expect(queryByText("My Books")).toBeNull();
  });

  it("renders with header title", async () => {
    const { getByText } = render(
      <BookshelfView onSelectBook={mockOnSelectBook} headerTitle="My Books" />
    );

    expect(getByText("My Books")).toBeTruthy();
  });

  it("calls onSelectBook when a book is pressed", async () => {
    const { getAllByTestId } = render(
      <BookshelfView onSelectBook={mockOnSelectBook} />
    );

    await waitFor(() => {
      expect(getAllByTestId("book-item").length).toBe(2);
    });

    const firstBookItem = getAllByTestId("book-item")[0];
    fireEvent.press(firstBookItem);

    expect(mockOnSelectBook).toHaveBeenCalledWith(mockBooks[0]);
  });

  it("renders books correctly", async () => {
    const { getAllByTestId } = render(
      <BookshelfView onSelectBook={mockOnSelectBook} />
    );

    await waitFor(() => {
      expect(getAllByTestId("book-item").length).toBe(2);
    });
  });

  it("renders no books when getAllBooks returns empty array", async () => {
    require("../../services/BookStorageService").BookStorageService.getAllBooks.mockResolvedValueOnce(
      []
    );

    const { queryAllByTestId } = render(
      <BookshelfView onSelectBook={mockOnSelectBook} />
    );

    await waitFor(() => {
      expect(queryAllByTestId("book-item").length).toBe(0);
    });
  });
});
