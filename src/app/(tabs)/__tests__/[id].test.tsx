import React, { ReactNode } from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BookDetailPage from "../[id]";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "@/hooks/useAuth";

// Mock react-native components
jest.mock('react-native/Libraries/Modal/Modal', () => {
  const React = require('react');
  return ({ children, visible }: { children: ReactNode; visible: boolean }) =>
    visible ? React.createElement('Modal', {}, children) : null;
});

// モック設定
jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  Link: jest.fn(),
}));
jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn().mockImplementation((options) => {
    if (options.queryKey[0] === 'tags') {
      return {
        data: [
          { id: '1', name: 'タグ1', userId: 'test-user-id', createdAt: '', updatedAt: '' },
          { id: '2', name: 'タグ2', userId: 'test-user-id', createdAt: '', updatedAt: '' },
        ],
        isLoading: false,
        error: null,
      };
    }
    return {
      data: null,
      isLoading: false,
      error: null,
    };
  }),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
  })),
  useQueryClient: jest.fn(),
}));
jest.mock("@/hooks/useColorScheme");
jest.mock("@/hooks/useAuth");

const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;
const mockUseQuery = useQuery as jest.Mock;
const mockUseColorScheme = useColorScheme as jest.Mock;
const mockUseAuth = useAuth as jest.Mock;
const mockQueryClient = {
  invalidateQueries: jest.fn(),
};

describe("BookDetailPage", () => {
  const mockBook = {
    id: "1",
    title: "テスト書籍",
    author: "テスト著者",
    publisher: "テスト出版社",
    description: "テストの説明",
    thumbnailUrl: "https://example.com/cover.jpg",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    quotes: [],
  };

  beforeEach(() => {
    mockUseLocalSearchParams.mockReturnValue({ id: "1" });
    mockUseQuery.mockImplementation((options) => {
      if (options.queryKey[0] === 'tags') {
        return {
          data: [
            { id: '1', name: 'タグ1', userId: 'test-user-id', createdAt: '', updatedAt: '' },
            { id: '2', name: 'タグ2', userId: 'test-user-id', createdAt: '', updatedAt: '' },
          ],
          isLoading: false,
          error: null,
        };
      }
      return {
        data: mockBook,
        isLoading: false,
        error: null,
      };
    });
    mockUseColorScheme.mockReturnValue("light");
    mockUseAuth.mockReturnValue({
      user: {
        id: "test-user-id",
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: "2025-03-05T00:00:00.000Z",
        email: "test@example.com",
        phone: "",
        role: "",
        updated_at: "2025-03-05T00:00:00.000Z",
      },
      isAuthenticated: true,
      signOut: jest.fn(),
    });
    (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
  });

  it("ローディング状態を表示する", () => {
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    } as any);

    const { getByTestId } = render(<BookDetailPage />);
    expect(getByTestId("loading-indicator")).toBeTruthy();
  });

  it("エラー状態を表示する", () => {
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("書籍が見つかりませんでした"),
    } as any);

    const { getByTestId } = render(<BookDetailPage />);
    expect(getByTestId("error-message")).toBeTruthy();
  });

  it("書籍情報を表示する", () => {
    const { getByTestId } = render(<BookDetailPage />);
    expect(getByTestId("book-title")).toBeTruthy();
    expect(getByTestId("book-author")).toBeTruthy();
    expect(getByTestId("book-publisher")).toBeTruthy();
    expect(getByTestId("book-description")).toBeTruthy();
  });

  it("ユーザーや書籍データが存在しない場合のエラーを表示する", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      signOut: jest.fn(),
    });

    const { getByTestId } = render(<BookDetailPage />);
    expect(getByTestId("not-found-message")).toBeTruthy();
  });

  it("引用を追加するアイコンを表示する", () => {
    const { getByTestId } = render(<BookDetailPage />);
    expect(getByTestId("quotes-section-title")).toBeTruthy();
    expect(getByTestId("add-quote-button")).toBeTruthy();
  });

  it("引用一覧を表示する", () => {
    const mockQuotes = [
      {
        id: "1",
        content: "テスト引用1",
        page: 1,
        memo: "メモ1",
        tags: [],
        bookId: "1",
        userId: "test-user-id",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        content: "テスト引用2",
        page: 2,
        memo: "メモ2",
        tags: [],
        bookId: "1",
        userId: "test-user-id",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    mockUseQuery.mockReturnValue({
      data: { ...mockBook, quotes: mockQuotes },
      isLoading: false,
      error: null,
    } as any);

    const { getByTestId } = render(<BookDetailPage />);
    expect(getByTestId(`quote-item-${mockQuotes[0].id}`)).toBeTruthy();
    expect(getByTestId(`quote-content-${mockQuotes[0].id}`)).toBeTruthy();
    expect(getByTestId(`quote-page-${mockQuotes[0].id}`)).toBeTruthy();
    expect(getByTestId(`quote-memo-${mockQuotes[0].id}`)).toBeTruthy();

    expect(getByTestId(`quote-item-${mockQuotes[1].id}`)).toBeTruthy();
    expect(getByTestId(`quote-content-${mockQuotes[1].id}`)).toBeTruthy();
    expect(getByTestId(`quote-page-${mockQuotes[1].id}`)).toBeTruthy();
    expect(getByTestId(`quote-memo-${mockQuotes[1].id}`)).toBeTruthy();
  });

  it("引用を編集し、保存できる", async () => {
    const mockQuote = {
      id: "1",
      content: "テスト引用1",
      page: 1,
      memo: "メモ1",
      tags: [
        { id: '1', name: 'タグ1', userId: 'test-user-id', createdAt: '', updatedAt: '' }
      ],
      bookId: "1",
      userId: "test-user-id",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockUseQuery.mockReturnValue({
      data: { ...mockBook, quotes: [mockQuote] },
      isLoading: false,
      error: null,
    } as any);

    const { getByTestId, getByText, getByLabelText, getByPlaceholderText } = render(<BookDetailPage />);

    // 初期表示の確認
    expect(getByTestId(`quote-item-${mockQuote.id}`)).toBeTruthy();
    expect(getByTestId(`quote-content-${mockQuote.id}`)).toBeTruthy();
    expect(getByText('タグ1')).toBeTruthy();
    
    // 編集ボタンをクリック
    const editButton = getByTestId(`edit-quote-${mockQuote.id}`);
    editButton.props.onPress();

    // フォームに初期値が設定されていることを確認
    const quoteInput = getByLabelText('引用文');
    const pageInput = getByLabelText('ページ');
    const memoInput = getByLabelText('メモ');
    expect(quoteInput.props.value).toBe('テスト引用1');
    expect(pageInput.props.value).toBe('1');
    expect(memoInput.props.value).toBe('メモ1');
    expect(getByText('タグ1')).toBeTruthy();

    // 値を編集
    fireEvent.changeText(quoteInput, '更新された引用');
    fireEvent.changeText(pageInput, '2');
    fireEvent.changeText(memoInput, '更新されたメモ');

    // 保存ボタンをクリック
    const saveButton = getByText('保存');
    fireEvent.press(saveButton);

    // ミューテーションが呼ばれたことを確認
    const updateQuoteMutation = jest.requireMock('@tanstack/react-query').useMutation;
    expect(updateQuoteMutation).toHaveBeenCalled();
  });

  it("引用の削除をキャンセルできる", async () => {
    const mockQuote = {
      id: "1",
      content: "テスト引用1",
      page: 1,
      memo: "メモ1",
      tags: [
        { id: '1', name: 'タグ1', userId: 'test-user-id', createdAt: '', updatedAt: '' }
      ],
      bookId: "1",
      userId: "test-user-id",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockUseQuery.mockReturnValue({
      data: { ...mockBook, quotes: [mockQuote] },
      isLoading: false,
      error: null,
    } as any);

    const { getByTestId, getByText } = render(<BookDetailPage />);

    // 削除ボタンをクリック
    const deleteButton = getByTestId(`delete-quote-${mockQuote.id}`);
    deleteButton.props.onPress();

    // 削除確認ダイアログが表示されることを確認
    const confirmDialog = getByText('この引用を削除してもよろしいですか？');
    expect(confirmDialog).toBeTruthy();

    // キャンセルボタンをクリック
    const cancelButton = getByText('キャンセル');
    fireEvent.press(cancelButton);

    // ダイアログが閉じることを確認
    expect(() => getByText('この引用を削除してもよろしいですか？')).toThrow();
  });

  it("新しい引用を作成できる", async () => {
    const mockTags = [
      { id: '1', name: 'タグ1', userId: 'test-user-id', createdAt: '', updatedAt: '' },
      { id: '2', name: 'タグ2', userId: 'test-user-id', createdAt: '', updatedAt: '' }
    ];

    mockUseQuery.mockImplementation((options) => {
      if (options.queryKey[0] === 'tags') {
        return {
          data: mockTags,
          isLoading: false,
          error: null,
        };
      }
      return {
        data: mockBook,
        isLoading: false,
        error: null,
      };
    });

    const { getByTestId, getByLabelText, getByText } = render(<BookDetailPage />);

    // 追加ボタンをクリック
    const addButton = getByTestId("add-quote-button");
    addButton.props.onPress();

    // フォームに値を入力
    const quoteInput = getByLabelText('引用文');
    const pageInput = getByLabelText('ページ');
    const memoInput = getByLabelText('メモ');

    fireEvent.changeText(quoteInput, '新しい引用');
    fireEvent.changeText(pageInput, '3');
    fireEvent.changeText(memoInput, '新しいメモ');

    // タグを選択
    const tag1 = getByText('タグ1');
    fireEvent.press(tag1);

    // 保存ボタンをクリック
    const saveButton = getByText('保存');
    fireEvent.press(saveButton);

    // ミューテーションが呼ばれたことを確認
    const createQuoteMutation = jest.requireMock('@tanstack/react-query').useMutation;
    expect(createQuoteMutation).toHaveBeenCalled();
  });

  it("書籍情報セクションを表示する", () => {
    const { getByTestId } = render(<BookDetailPage />);

    // 書籍情報セクションが表示されることを確認
    expect(getByTestId("book-info-title")).toBeTruthy();
    expect(getByTestId("book-info-section")).toBeTruthy();
  });
});
