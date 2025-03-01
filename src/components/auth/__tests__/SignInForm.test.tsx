import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SignInForm } from '../SignInForm';
import { supabase } from '@lib/supabase';

jest.mock('@lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn()
    }
  }
}));

describe('SignInForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnSignUpPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('メールアドレスとパスワードの入力フィールドを表示する', () => {
    const { getByTestId } = render(
      <SignInForm onSuccess={mockOnSuccess} onSignUpPress={mockOnSignUpPress} />
    );
    
    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByTestId('password-input')).toBeTruthy();
  });

  it('サインインボタンを表示する', () => {
    const { getByTestId } = render(
      <SignInForm onSuccess={mockOnSuccess} onSignUpPress={mockOnSignUpPress} />
    );
    
    expect(getByTestId('signin-button')).toBeTruthy();
  });

  it('サインアップへのリンクを表示する', () => {
    const { getByTestId } = render(
      <SignInForm onSuccess={mockOnSuccess} onSignUpPress={mockOnSignUpPress} />
    );
    
    expect(getByTestId('signup-link')).toBeTruthy();
  });

  it('入力値が空の場合にエラーメッセージを表示する', async () => {
    const { getByTestId } = render(
      <SignInForm onSuccess={mockOnSuccess} onSignUpPress={mockOnSignUpPress} />
    );
    
    fireEvent.press(getByTestId('signin-button'));

    await waitFor(() => {
      expect(getByTestId('email-error')).toBeTruthy();
      expect(getByTestId('password-error')).toBeTruthy();
    });
  });

  it('認証成功時にonSuccessコールバックを呼び出す', async () => {
    const mockSignInResponse = {
      data: { user: { id: '1', email: 'test@example.com' } },
      error: null
    };
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce(mockSignInResponse);

    const { getByTestId } = render(
      <SignInForm onSuccess={mockOnSuccess} onSignUpPress={mockOnSignUpPress} />
    );
    
    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    fireEvent.press(getByTestId('signin-button'));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('認証失敗時にエラーメッセージを表示する', async () => {
    const mockSignInResponse = {
      data: { user: null },
      error: { message: '認証に失敗しました' }
    };
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce(mockSignInResponse);

    const { getByTestId } = render(
      <SignInForm onSuccess={mockOnSuccess} onSignUpPress={mockOnSignUpPress} />
    );
    
    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'wrongpassword');
    fireEvent.press(getByTestId('signin-button'));

    await waitFor(() => {
      expect(getByTestId('auth-error')).toBeTruthy();
    });
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('サインアップリンクをクリックするとonSignUpPressが呼ばれる', () => {
    const { getByTestId } = render(
      <SignInForm onSuccess={mockOnSuccess} onSignUpPress={mockOnSignUpPress} />
    );
    
    fireEvent.press(getByTestId('signup-link'));
    expect(mockOnSignUpPress).toHaveBeenCalled();
  });
});
