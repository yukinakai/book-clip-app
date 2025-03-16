// @expo/vector-icons のモック
import React from "react";
import { View } from "react-native";

// アイコンコンポーネントのモック作成
const createIconMock = (name) => {
  const Icon = ({ name, _size, _color, style }) => {
    return React.createElement(View, { style }, `${name} Icon`);
  };
  Icon.displayName = name;
  return Icon;
};

jest.mock("@expo/vector-icons", () => {
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

// setImmediateのポリフィル
global.setImmediate = (callback, ...args) =>
  global.setTimeout(callback, 0, ...args);

// React NativeのInteractionManagerのモック
jest.mock("react-native/Libraries/Interaction/InteractionManager", () => ({
  createInteractionHandle: jest.fn(),
  clearInteractionHandle: jest.fn(),
  runAfterInteractions: jest.fn((task) => {
    if (task) {
      task();
    }
    return {
      then: jest.fn((resolve) => resolve()),
      done: jest.fn(),
      cancel: jest.fn(),
    };
  }),
  add: jest.fn(),
  setDeadline: jest.fn(),
}));
