import { NativeModules, NativeEventEmitter } from 'react-native';

// 基本的なモック値の定義
const mockDimensions = {
  window: {
    width: 400,
    height: 800,
    scale: 2,
    fontScale: 2,
  },
  screen: {
    width: 400,
    height: 800,
    scale: 2,
    fontScale: 2,
  },
};

// グローバル設定
jest.setTimeout(10000);

// PixelRatioのモック (最優先)
jest.mock('react-native/Libraries/Utilities/PixelRatio', () => ({
  get: () => mockDimensions.window.scale,
  getFontScale: () => mockDimensions.window.fontScale,
  getPixelSizeForLayoutSize: (size) => size * mockDimensions.window.scale,
  roundToNearestPixel: (size) => size,
}));

// PlatformConstantsのモック
jest.mock('react-native/Libraries/Utilities/NativePlatformConstantsIOS', () => ({
  __esModule: true,
  default: {
    getConstants: () => ({
      forceTouchAvailable: false,
      interfaceIdiom: 'phone',
      isTesting: true,
      osVersion: '14.0',
      systemName: 'iOS',
      isDisableAnimations: true,
    }),
  },
}));

// StyleSheetのモック
jest.mock('react-native/Libraries/StyleSheet/StyleSheet', () => ({
  create: (styles) => styles,
  hairlineWidth: 1,
  absoluteFillObject: {},
  flatten: (style) => style,
}));

// NativeEventEmitterのモック
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  const NativeEventEmitter = jest.fn();
  NativeEventEmitter.prototype.addListener = jest.fn();
  NativeEventEmitter.prototype.removeListener = jest.fn();
  return NativeEventEmitter;
});

// supabaseのモック
jest.mock('./src/lib/supabase');

// Dimensionsのモック
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn((dim) => mockDimensions[dim]),
  set: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// KeyboardのNativeModuleのモック
NativeModules.Keyboard = {
  addListener: jest.fn(),
  removeListener: jest.fn(),
  dismiss: jest.fn(),
};

// TurboModuleRegistryのモック
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  get: jest.fn(),
  getEnforcing: jest.fn((name) => {
    if (name === 'SettingsManager') {
      return {
        getConstants: () => ({}),
        settings: {},
        addListener: jest.fn(),
        removeListeners: jest.fn(),
      };
    }
    if (name === 'DeviceInfo') {
      return {
        getConstants: () => ({
          window: mockDimensions.window,
          screen: mockDimensions.screen,
        }),
      };
    }
    if (name === 'SoundManager') {
      return {
        playTouchSound: jest.fn(),
      };
    }
    if (name === 'PlatformConstants') {
      return {
        getConstants: () => ({
          forceTouchAvailable: false,
          interfaceIdiom: 'phone',
          isTesting: true,
          osVersion: '14.0',
          systemName: 'iOS',
          isDisableAnimations: true,
        }),
      };
    }
    if (name === 'Keyboard') {
      return {
        addListener: jest.fn(),
        removeListener: jest.fn(),
        dismiss: jest.fn(),
      };
    }
    return {};
  }),
}));

// 必要なネイティブモジュールのモックを設定
NativeModules.SettingsManager = {
  getConstants: () => ({}),
  settings: {},
  addListener: jest.fn(),
  removeListeners: jest.fn(),
};

NativeModules.DeviceInfo = {
  getConstants: () => ({
    window: mockDimensions.window,
    screen: mockDimensions.screen,
  }),
};

NativeModules.SoundManager = {
  playTouchSound: jest.fn(),
};

NativeModules.PlatformConstants = {
  getConstants: () => ({
    forceTouchAvailable: false,
    interfaceIdiom: 'phone',
    isTesting: true,
    osVersion: '14.0',
    systemName: 'iOS',
    isDisableAnimations: true,
  }),
};

// React Native全体のモック
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  const React = require('react');
  
  const NativeEventEmitter = function() {
    this.addListener = jest.fn();
    this.removeListener = jest.fn();
  };
  
  return {
    ...RN,
    NativeEventEmitter,
    StyleSheet: {
      create: (styles) => styles,
      hairlineWidth: 1,
      absoluteFillObject: {},
      flatten: (style) => style,
    },
    Dimensions: {
      get: jest.fn((dim) => mockDimensions[dim]),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    PixelRatio: {
      get: () => mockDimensions.window.scale,
      getFontScale: () => mockDimensions.window.fontScale,
      getPixelSizeForLayoutSize: (size) => size * mockDimensions.window.scale,
      roundToNearestPixel: (size) => size,
    },
    View: ({ testID, style, children }) => 
      React.createElement('view', { testID, style }, children),
    FlatList: ({ data, renderItem, keyExtractor, numColumns, contentContainerStyle, ListEmptyComponent }) => {
      const items = data.map((item) => renderItem({ item }));
      return React.createElement('view', { style: contentContainerStyle }, 
        data.length === 0 && ListEmptyComponent ? ListEmptyComponent() : items
      );
    },
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
    KeyboardAvoidingView: ({ testID, style, children }) =>
      React.createElement('div', { testID, style }, children),
    Platform: {
      select: jest.fn((obj) => obj.ios),
      OS: 'ios',
      constants: {
        forceTouchAvailable: false,
        interfaceIdiom: 'phone',
        isTesting: true,
        osVersion: '14.0',
        systemName: 'iOS',
        isDisableAnimations: true,
      },
    },
    NativeModules: {
      ...RN.NativeModules,
      SettingsManager: {
        settings: {},
      },
      Keyboard: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
        dismiss: jest.fn(),
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

// expo-routerのモック
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

// コンソールエラーの無視設定
const originalConsoleError = global.console.error;
global.console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].startsWith('Warning:')) {
    return;
  }
  originalConsoleError.apply(global.console, args);
};
