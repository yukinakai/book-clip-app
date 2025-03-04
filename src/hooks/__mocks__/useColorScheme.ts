import { ColorScheme } from '../useColorScheme';

export const useColorScheme = jest.fn<ColorScheme, []>(() => 'light');
