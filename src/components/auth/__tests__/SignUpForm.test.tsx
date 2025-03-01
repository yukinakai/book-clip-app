import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SignUpForm } from '../SignUpForm';
import { supabase } from '../../../lib/supabase';

jest.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn()
    }
  }
}));

describe('SignUpForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnSignInPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('メールアドレスとパスワードの入力フィールドを表示する', () => {
    const { getByTestId } = render(
      <SignUpForm onSuccess={mockOnSuccess} onSignInPress={mockOnSignInPress} />
    );
    
    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByTestId('password-input')).toBeTruthy();
    expect(getByTestId('confirm-password-input')).toBeTruthy();
  });

  it('サインアップボタンを表示する', () => {
    const { getByTestId } = render(
      <SignUpForm onSuccess={mockOnSuccess} onSignInPress={mockOnSignInPress} />
    );
    
    expect(getByTestId('signup-button')).toBeTruthy();
  });

  it('サインインへのリンクを表示する', () => {
    const { getByTestId } = render(
      <SignUpForm onSuccess={mockOnSuccess} onSignInPress={mockOnSignInPress} />
    );
    
    expect(getByTestId('signin-link')).toBeTruthy();
  });

  it('入力値が空の場合にエラーメッセージを表示する', async () => {
    const { getByTestId } = render(
      <SignUpForm onSuccess={mockOnSuccess} onSignInPress={mockOnSignInPress} />
    );
    
    fireEvent.press(getByTestId('signup-button'));

    await waitFor(() => {
      expect(getByTestId('email-error')).toBeTruthy();
      expect(getByTestId('password-error')).toBeTruthy();
      expect(getByTestId('confirm-password-error')).toBeTruthy();
    });
  });

  it('パスワードが一致しない場合にエラーメッセージを表示する', async () => {
    const { getByTestId } = render(
      <SignUpForm onSuccess={mockOnSuccess} onSignInPress={mockOnSignInPress} />
    );
    
    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    fireEvent.changeText(getByTestId('confirm-password-input'), 'password456');
    fireEvent.press(getByTestId('signup-button'));

    await waitFor(() => {
      expect(getByTestId('confirm-password-error')).toBeTruthy();
    });
  });

  it('サインアップ成功時にonSuccessコールバックを呼び出す', async () => {
    const mockSignUpResponse = {
      data: { user: { id: '1', email: 'test@example.com' } },
      error: null
    };
    (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce(mockSignUpResponse);

    const { getByTestId } = render(
      <SignUpForm onSuccess={mockOnSuccess} onSignInPress={mockOnSignInPress} />
    );
    
    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    fireEvent.changeText(getByTestId('confirm-password-input'), 'password123');
    fireEvent.press(getByTestId('signup-button'));

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('サインアップ失敗時にエラーメッセージを表示する', async () => {
    const mockSignUpResponse = {
      data: { user: null },
      error: { message: 'サインアップに失敗しました' }
    };
    (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce(mockSignUpResponse);

    const { getByTestId } = render(
      <SignUpForm onSuccess={mockOnSuccess} onSignInPress={mockOnSignInPress} />
    );
    
    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    fireEvent.changeText(getByTestId('confirm-password-input'), 'password123');
    fireEvent.press(getByTestId('signup-button'));

    await waitFor(() => {
      expect(getByTestId('auth-error')).toBeTruthy();
    });
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('サインインリンクをクリックするとonSignInPressが呼ばれる', () => {
    const { getByTestId } = render(
      <SignUpForm onSuccess={mockOnSuccess} onSignInPress={mockOnSignInPress} />
    );
    
    fireEvent.press(getByTestId('signin-link'));
    expect(mockOnSignInPress).toHaveBeenCalled();
  });
});
