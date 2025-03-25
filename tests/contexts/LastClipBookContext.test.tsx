import { renderHook, act } from "@testing-library/react";
import {
  LastClipBookProvider,
  useLastClipBook,
} from "../../contexts/LastClipBookContext";
import { Book } from "../../constants/MockData";

describe("LastClipBookContext", () => {
  const mockBook: Book = {
    id: "test-id-1",
    title: "テスト書籍",
    author: "テスト著者",
    coverImage: "https://example.com/cover.jpg",
    isbn: "9784000000000",
  };

  it("初期状態ではlastClipBookがnullであること", () => {
    const { result } = renderHook(() => useLastClipBook(), {
      wrapper: LastClipBookProvider,
    });

    expect(result.current.lastClipBook).toBeNull();
  });

  it("setLastClipBookで最後に使用した書籍を設定できること", () => {
    const { result } = renderHook(() => useLastClipBook(), {
      wrapper: LastClipBookProvider,
    });

    act(() => {
      result.current.setLastClipBook(mockBook);
    });

    expect(result.current.lastClipBook).toEqual(mockBook);
  });

  it("setLastClipBookでnullを設定できること", () => {
    const { result } = renderHook(() => useLastClipBook(), {
      wrapper: LastClipBookProvider,
    });

    // まず書籍を設定
    act(() => {
      result.current.setLastClipBook(mockBook);
    });
    expect(result.current.lastClipBook).toEqual(mockBook);

    // nullに設定
    act(() => {
      result.current.setLastClipBook(null);
    });
    expect(result.current.lastClipBook).toBeNull();
  });

  it("Providerの外でuseLastClipBookを使用するとエラーがスローされること", () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      renderHook(() => useLastClipBook());
    }).toThrow("useLastClipBook must be used within a LastClipBookProvider");

    consoleSpy.mockRestore();
  });
});
