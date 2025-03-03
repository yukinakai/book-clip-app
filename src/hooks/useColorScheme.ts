import { useColorScheme as _useColorScheme } from 'react-native';

// システムのカラーモードを取得する型安全なフック
export function useColorScheme(): 'light' | 'dark' {
  return _useColorScheme() ?? 'light';
}
