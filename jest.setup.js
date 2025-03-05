// グローバル設定
jest.setTimeout(10000);

// 必須の分離されたReact Nativeコンポーネントのモック
jest.mock('react-native/Libraries/Components/ProgressBarAndroid/ProgressBarAndroid', () => ({
  default: () => null,
}));

jest.mock('react-native/Libraries/Components/Clipboard/Clipboard', () => ({
  getString: jest.fn(),
  setString: jest.fn(),
}));

jest.mock('react-native/Libraries/PushNotificationIOS/PushNotificationIOS', () => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  requestPermissions: jest.fn(),
  abandonPermissions: jest.fn(),
  checkPermissions: jest.fn(),
  getInitialNotification: jest.fn(),
  constructor: jest.fn(),
  finish: jest.fn(),
  getMessage: jest.fn(),
  getSound: jest.fn(),
  getAlert: jest.fn(),
  getBadgeCount: jest.fn(),
  getData: jest.fn(),
}));

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

// supabaseのモック
jest.mock('./src/lib/supabase');

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

// React Native全体のモック（分離されたコンポーネントへの参照を除去）
jest.mock('react-native', () => {
  const React = require('react');
  
  const NativeEventEmitter = function() {
    this.addListener = jest.fn();
    this.removeListener = jest.fn();
  };
  
  return {
    NativeEventEmitter,
    NativeModules: {
      SettingsManager: {
        getConstants: () => ({}),
        settings: {},
        addListener: jest.fn(),
        removeListeners: jest.fn(),
      },
      DeviceInfo: {
        getConstants: () => ({
          window: mockDimensions.window,
          screen: mockDimensions.screen,
        }),
      },
      SoundManager: {
        playTouchSound: jest.fn(),
      },
      PlatformConstants: {
        getConstants: () => ({
          forceTouchAvailable: false,
          interfaceIdiom: 'phone',
          isTesting: true,
          osVersion: '14.0',
          systemName: 'iOS',
          isDisableAnimations: true,
        }),
      },
      Keyboard: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
        dismiss: jest.fn(),
      },
    },
    StyleSheet: {
      create: (styles) => styles,
      hairlineWidth: 1,
      absoluteFillObject: {},
      flatten: (style) => style,
    },
    Dimensions: {
      get: jest.fn((dim) => mockDimensions[dim]),
      set: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    PixelRatio: {
      get: () => mockDimensions.window.scale,
      getFontScale: () => mockDimensions.window.fontScale,
      getPixelSizeForLayoutSize: (size) => size * mockDimensions.window.scale,
      roundToNearestPixel: (size) => size,
    },
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
    // UIコンポーネントのモック
    View: ({ testID, style, children }) => 
      React.createElement('view', { testID, style }, children),
    Text: ({ testID, children, style }) => 
      React.createElement('div', { 
        testID, 
        style, 
        children,
        textContent: typeof children === 'string' ? children : undefined
      }, children),
    Image: ({ testID, source, style, resizeMode }) =>
      React.createElement('img', { 
        testID,
        src: typeof source === 'number' ? source : source?.uri,
        style: { ...style, objectFit: resizeMode },
      }),
    TextInput: ({ testID, style, placeholder, value, onChangeText, secureTextEntry, autoCapitalize, keyboardType }) =>
      React.createElement('input', {
        testID,
        style,
        placeholder,
        value,
        onChange: (e) => onChangeText(e.target.value),
        type: secureTextEntry ? 'password' : 'text',
        autoCapitalize,
        keyboardType,
      }),
    TouchableOpacity: ({ testID, onPress, disabled, style, children }) =>
      React.createElement('button', { testID, onClick: onPress, disabled, style }, children),
    ActivityIndicator: ({ testID, color }) =>
      React.createElement('div', { testID, style: { color } }, 'Loading...'),
    SafeAreaView: ({ testID, children, style }) => 
      React.createElement('div', { testID, style }, children),
    KeyboardAvoidingView: ({ testID, style, children }) =>
      React.createElement('div', { testID, style }, children),
    Modal: ({ testID, visible, transparent, animationType, onRequestClose, children }) =>
      visible ? React.createElement('div', { 
        testID, 
        style: { 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          backgroundColor: transparent ? 'transparent' : '#fff'
        }
      }, children) : null,
    FlatList: ({ data, renderItem, keyExtractor, numColumns, contentContainerStyle, ListEmptyComponent }) => {
      const items = data.map((item, index) => {
        const element = renderItem({ item, index });
        return React.cloneElement(element, { key: keyExtractor ? keyExtractor(item, index) : index });
      });
      return React.createElement('view', { style: contentContainerStyle }, 
        data.length === 0 && ListEmptyComponent ? ListEmptyComponent() : items
      );
    },
  };
});
