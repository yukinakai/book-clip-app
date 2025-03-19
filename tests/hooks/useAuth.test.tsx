import React from "react";
import { renderHook, act } from "@testing-library/react-hooks";
import { useAuth } from "../../hooks/useAuth";
import { AuthService } from "../../services/auth";

// AuthServiceのモック
jest.mock("../../services/auth", () => ({
  AuthService: {
    signInWithEmail: jest.fn(),
    signOut: jest.fn(),
    getCurrentUser: jest.fn(),
  },
  supabase: {
    auth: {
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
  },
}));

describe("useAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("初期状態でloadingがtrue", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
  });

  it("メール認証が成功した場合、emailSentがtrueになる", async () => {
    const testEmail = "test@example.com";
    (AuthService.signInWithEmail as jest.Mock).mockResolvedValueOnce({});

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signInWithEmail(testEmail);
    });

    expect(AuthService.signInWithEmail).toHaveBeenCalledWith(testEmail);
    expect(result.current.emailSent).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("ログアウトが成功した場合、userがnullになる", async () => {
    (AuthService.signOut as jest.Mock).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("エラーが発生した場合、errorが更新される", async () => {
    const mockError = new Error("認証エラー");
    (AuthService.signInWithEmail as jest.Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signInWithEmail("test@example.com");
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.loading).toBe(false);
    expect(result.current.emailSent).toBe(false);
  });
});
