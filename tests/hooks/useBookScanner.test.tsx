import { renderHook } from "@testing-library/react";
import { Alert } from "react-native";
import { useBookScanner } from "../../hooks/useBookScanner";

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

// Alertのモック
jest.spyOn(Alert, "alert").mockImplementation(() => 0);

describe("useBookScanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("provides manual entry functionality", () => {
    const mockOnClose = jest.fn();
    const { result } = renderHook(() =>
      useBookScanner({ onClose: mockOnClose })
    );

    // 必要な関数とプロパティが存在することを確認
    expect(result.current).toHaveProperty("showManualForm");
    expect(result.current).toHaveProperty("hideManualForm");
    expect(result.current).toHaveProperty("handleManualSave");
    expect(result.current).toHaveProperty("bookTitle");
    expect(result.current).toHaveProperty("setBookTitle");
    expect(result.current).toHaveProperty("bookAuthor");
    expect(result.current).toHaveProperty("setBookAuthor");
  });
});
