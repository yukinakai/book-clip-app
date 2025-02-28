import { StyleSheet } from 'react-native';

if (typeof StyleSheet.flatten !== 'function') {
  StyleSheet.flatten = (style) => style;
}

// グローバル設定
jest.setTimeout(10000);

// React Nativeコンポーネントのモック
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  const React = require('react');
  
  return {
    StyleSheet: {
      create: (styles) => styles,
      absoluteFillObject: {},
    },
    View: ({ testID, style, children }) => 
      React.createElement('view', { testID, style }, children),
    Text: ({ testID, children, style }) => 
      React.createElement('text', { testID, style }, children),
    TextInput: ({ testID, style, placeholder, value, onChangeText, secureTextEntry, autoCapitalize, keyboardType }) =>
      React.createElement('input', {
        testID,
        style,
        placeholder,
        value,
        onChange: (e) => onChangeText(e.target.value),
        type: secureTextEntry ? 'password' : 'text',
        autoCapitalize,
      }),
    TouchableOpacity: ({ testID, onPress, disabled, style, children }) =>
      React.createElement('button', { testID, onClick: onPress, disabled, style }, children),
    ActivityIndicator: ({ testID, color }) =>
      React.createElement('div', { testID, style: { color } }, 'Loading...'),
    SafeAreaView: ({ testID, children, style }) =>
      React.createElement('div', { testID, style }, children),
    Platform: {
      select: jest.fn((obj) => obj.ios),
      OS: 'ios',
    },
    NativeModules: {
      ...RN.NativeModules,
      SettingsManager: {
        settings: {},
      },
    },
  };
});

// SafeAreaContextのモック
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ testID, children, style }) => 
      React.createElement('div', { testID, style }, children),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

// コンソールエラーの無視設定
const originalConsoleError = global.console.error;
global.console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].startsWith('Warning:')) {
    return;
  }
  originalConsoleError.apply(global.console, args);
};
