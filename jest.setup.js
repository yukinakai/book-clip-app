// @expo/vector-icons のモック
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { View } = require("react-native");

  // アイコンコンポーネントのモック作成
  const createIconMock = (name) => {
    const Icon = ({ name, size, color, style }) => {
      return React.createElement(View, { style }, `${name} Icon`);
    };
    Icon.displayName = name;
    return Icon;
  };

  // 必要なアイコンセットをモック
  return {
    Ionicons: createIconMock("Ionicons"),
    MaterialIcons: createIconMock("MaterialIcons"),
    FontAwesome: createIconMock("FontAwesome"),
    FontAwesome5: createIconMock("FontAwesome5"),
    MaterialCommunityIcons: createIconMock("MaterialCommunityIcons"),
    Entypo: createIconMock("Entypo"),
    Feather: createIconMock("Feather"),
    AntDesign: createIconMock("AntDesign"),
    // 他のアイコンセットも必要に応じて追加可能
  };
});

// expo-font のモック
jest.mock("expo-font", () => {
  return {
    isLoaded: jest.fn(() => true),
    loadAsync: jest.fn(),
    __internal__: {
      NativeExpoFontLoader: {
        loadFontsAsync: jest.fn(),
      },
    },
  };
});

// 特にexpo-fontのmemory.jsで使用されるloadedNativeFontsのモックを修正
jest.mock("expo-font/src/memory", () => {
  return {
    loadedNativeFonts: {},
    loaded: {},
    loadAsync: jest.fn(),
  };
});
