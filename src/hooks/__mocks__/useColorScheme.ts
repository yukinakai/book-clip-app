import { ColorScheme } from '../useColorScheme';

// モックの型定義
type UseColorScheme = () => ColorScheme;

// React Nativeのモジュールをモック
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: () => 'light'
}));

// フックの実装
export const useColorScheme: UseColorScheme = () => 'light';
