import { ColorSchemeName, useColorScheme as useNativeColorScheme } from 'react-native';

export type ColorScheme = NonNullable<ColorSchemeName>;

export function useColorScheme(): ColorScheme {
  const colorScheme = useNativeColorScheme();
  return colorScheme ?? 'light';
}
