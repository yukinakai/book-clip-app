import { renderHook, act } from '@testing-library/react-native';
import { useAuth } from '../useAuth';
import { supabase } from '@lib/supabase';

jest.mock('@lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: null }, // 未ログインの場合のデフォルト値
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({
        error: null,
      }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
  },
}));

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態ではログインしていない', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('セッションが存在する場合はログイン状態になる', async () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
    };
    
    const mockSession = {
      user: mockUser,
    };

    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    // 初期状態の確認
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();

    // セッションチェックの完了を待つ
    await act(async () => {
      await Promise.resolve();
    });

    // ログイン状態の確認
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('ログアウトするとログイン状態が解除される', async () => {
    const { result } = renderHook(() => useAuth());

    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({
      error: null,
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('認証状態の変更を正しく監視し、状態を更新する', async () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
    };
    
    let authStateCallback: (event: string, session: any) => void;
    (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      authStateCallback = callback;
      return {
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      };
    });

    const { result } = renderHook(() => useAuth());

    // 初期状態の確認
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();

    // ログイン状態への変更をシミュレート
    await act(async () => {
      authStateCallback('SIGNED_IN', { user: mockUser });
    });

    // ログイン状態の確認
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);

    // ログアウト状態への変更をシミュレート
    await act(async () => {
      authStateCallback('SIGNED_OUT', null);
    });

    // ログアウト状態の確認
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
