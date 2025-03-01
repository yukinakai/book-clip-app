import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AuthProvider, useAuthContext } from '../AuthProvider';
import { supabase } from '../../lib/supabase';

jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

const TestComponent = () => {
  const { isAuthenticated, user } = useAuthContext();
  return (
    <Text testID="auth-status">
      {JSON.stringify({ isAuthenticated, user })}
    </Text>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態では未認証状態', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('auth-status').props.children).toBe(
        JSON.stringify({ isAuthenticated: false, user: null })
      );
    });
  });

  it('セッションが存在する場合は認証状態になる', async () => {
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

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('auth-status').props.children).toBe(
        JSON.stringify({ isAuthenticated: true, user: mockUser })
      );
    });
  });

  it('認証状態の変更を正しく処理する', async () => {
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

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // 初期状態の確認
    await waitFor(() => {
      expect(getByTestId('auth-status').props.children).toBe(
        JSON.stringify({ isAuthenticated: false, user: null })
      );
    });

    // ログイン状態への変更をシミュレート
    await act(async () => {
      authStateCallback('SIGNED_IN', { user: mockUser });
    });

    // ログイン状態の確認
    await waitFor(() => {
      expect(getByTestId('auth-status').props.children).toBe(
        JSON.stringify({ isAuthenticated: true, user: mockUser })
      );
    });

    // ログアウト状態への変更をシミュレート
    await act(async () => {
      authStateCallback('SIGNED_OUT', null);
    });

    // ログアウト状態の確認
    await waitFor(() => {
      expect(getByTestId('auth-status').props.children).toBe(
        JSON.stringify({ isAuthenticated: false, user: null })
      );
    });
  });
});
