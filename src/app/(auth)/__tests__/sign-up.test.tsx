import React from 'react';
import { render, act } from '@testing-library/react-native';
import SignUp from '../sign-up';
import { router } from 'expo-router';

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

const mockSignUpForm = jest.fn();
jest.mock('../../../components/auth/SignUpForm', () => ({
  SignUpForm: (props: { onSuccess: () => void }) => {
    mockSignUpForm(props);
    return null;
  },
}));

describe('SignUp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('SignUpFormにonSuccessを渡す', () => {
    render(<SignUp />);
    expect(mockSignUpForm).toHaveBeenCalled();
    expect(mockSignUpForm.mock.calls[0][0]).toHaveProperty('onSuccess');
  });

  it('サインアップ成功時にタブ画面に遷移する', () => {
    render(<SignUp />);
    const { onSuccess } = mockSignUpForm.mock.calls[0][0];
    
    act(() => {
      onSuccess();
    });

    expect(router.replace).toHaveBeenCalledWith('/(tabs)');
  });
});
