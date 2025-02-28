import '@testing-library/jest-native/extend-expect';

// モックの設定
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// グローバルなタイムアウト設定
jest.setTimeout(10000);

// エラーメッセージの日本語化
jest.setSystemLocale('ja');

// コンソールエラーの無視設定
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Please update the following components:') ||
    args[0].includes('Warning:')
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};
