type ColorSchemeColors = {
  text: string;
  background: string;
  primary: string;
  secondary: string;
  tint: string;
  tabIconDefault: string;
  tabIconSelected: string;
  border: string;
  error: string;
  success: string;
  placeholder: string;
};

export default {
  light: {
    text: '#000',
    background: '#fff',
    primary: '#2f95dc',
    secondary: '#0056b3',
    tint: '#2f95dc',
    tabIconDefault: '#ccc',
    tabIconSelected: '#2f95dc',
    border: '#e0e0e0',
    error: '#dc3545',
    success: '#28a745',
    placeholder: '#a0a0a0',
  } as ColorSchemeColors,

  dark: {
    text: '#fff',
    background: '#000',
    primary: '#2f95dc',
    secondary: '#0056b3',
    tint: '#fff',
    tabIconDefault: '#ccc',
    tabIconSelected: '#fff',
    border: '#404040',
    error: '#dc3545',
    success: '#28a745',
    placeholder: '#666666',
  } as ColorSchemeColors,
};
