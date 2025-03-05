import { ColorScheme } from '../useColorScheme';

// モックの型定義
type UseColorScheme = jest.Mock<ColorScheme>;

// React Nativeのモジュールをモック
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(() => 'light')
}));

// フックの実装
export const useColorScheme: UseColorScheme = jest.fn(() => 'light');
