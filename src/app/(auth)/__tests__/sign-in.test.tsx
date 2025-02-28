import React from 'react';
import { render } from '@testing-library/react-native';
import SignInScreen from '../sign-in';

// expo-routerのモック
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

// SignInFormコンポーネントのモック
jest.mock('../../../components/auth/SignInForm', () => ({
  SignInForm: ({ onSuccess }: { onSuccess: () => void }) => {
    // テスト用にグローバル関数を設定
    global.triggerSignInSuccess = onSuccess;
    return null;
  },
}));

// グローバル変数の型定義
declare global {
  var triggerSignInSuccess: (() => void) | undefined;
}

describe('SignInScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.triggerSignInSuccess = undefined;
  });

  it('SignInFormを表示する', () => {
    render(<SignInScreen />);
    expect(global.triggerSignInSuccess).toBeDefined();
  });

  it('サインイン成功時にタブ画面に遷移する', () => {
    render(<SignInScreen />);
    
    // サインイン成功をシミュレート
    global.triggerSignInSuccess?.();
    
    const { router } = jest.requireMock('expo-router');
    expect(router.replace).toHaveBeenCalledWith('/(tabs)');
  });
});
