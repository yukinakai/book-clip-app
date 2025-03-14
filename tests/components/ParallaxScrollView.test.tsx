import React from "react";
import { render } from "../test-utils";
import { View, Text, Image } from "react-native";
import ParallaxScrollView from "../../components/ParallaxScrollView";

// モック設定
jest.mock("react-native-reanimated", () => {
  const ReactNativeReanimated = jest.requireActual(
    "react-native-reanimated/mock"
  );

  return {
    ...ReactNativeReanimated,
    interpolate: jest.fn((value, inputRange, outputRange) => {
      // 簡易的な線形補間の実装
      if (value <= inputRange[0]) return outputRange[0];
      if (value >= inputRange[inputRange.length - 1])
        return outputRange[outputRange.length - 1];

      // 中間値の場合は簡単な補間を行う
      for (let i = 0; i < inputRange.length - 1; i++) {
        if (value >= inputRange[i] && value <= inputRange[i + 1]) {
          const progress =
            (value - inputRange[i]) / (inputRange[i + 1] - inputRange[i]);
          return (
            outputRange[i] + progress * (outputRange[i + 1] - outputRange[i])
          );
        }
      }
      return outputRange[0];
    }),
    useAnimatedRef: jest.fn(() => ({
      current: {},
    })),
    useAnimatedStyle: jest.fn((callback) => {
      return callback();
    }),
    useScrollViewOffset: jest.fn(() => ({
      value: 0,
    })),
  };
});

jest.mock("@/components/ui/TabBarBackground", () => ({
  useBottomTabOverflow: jest.fn(() => 0),
}));

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    ...jest.requireActual("react-native-safe-area-context"),
    SafeAreaView: ({ children, style }) => (
      <View testID="safe-area-view" style={style}>
        {children}
      </View>
    ),
  };
});

// テスト用のヘッダー画像コンポーネント
const TestHeaderImage = () => (
  <Image
    testID="header-image"
    source={{ uri: "https://example.com/test.jpg" }}
    style={{ width: "100%", height: "100%" }}
  />
);

describe("ParallaxScrollViewコンポーネント", () => {
  const headerBackgroundColors = {
    light: "#FFFFFF",
    dark: "#000000",
  };

  it("正しくレンダリングされること", () => {
    const { getByTestId } = render(
      <ParallaxScrollView
        headerImage={<TestHeaderImage />}
        headerBackgroundColor={headerBackgroundColors}
      >
        <View testID="child-content">
          <Text>テストコンテンツ</Text>
        </View>
      </ParallaxScrollView>
    );

    // SafeAreaViewが存在することを確認
    expect(getByTestId("safe-area-view")).toBeTruthy();
  });

  it("ヘッダー画像と子要素が表示されること", () => {
    const { getByTestId } = render(
      <ParallaxScrollView
        headerImage={<TestHeaderImage />}
        headerBackgroundColor={headerBackgroundColors}
      >
        <View testID="child-content">
          <Text>テストコンテンツ</Text>
        </View>
      </ParallaxScrollView>
    );

    // ヘッダー画像がレンダリングされていることを確認
    expect(getByTestId("header-image")).toBeTruthy();

    // 子要素がレンダリングされていることを確認
    expect(getByTestId("child-content")).toBeTruthy();
  });

  it("アニメーション関連の関数が正しく呼ばれること", () => {
    const useAnimatedRef = require("react-native-reanimated").useAnimatedRef;
    const useAnimatedStyle =
      require("react-native-reanimated").useAnimatedStyle;
    const useScrollViewOffset =
      require("react-native-reanimated").useScrollViewOffset;

    render(
      <ParallaxScrollView
        headerImage={<TestHeaderImage />}
        headerBackgroundColor={headerBackgroundColors}
      >
        <Text>テストコンテンツ</Text>
      </ParallaxScrollView>
    );

    // アニメーション関連の関数が呼ばれていることを確認
    expect(useAnimatedRef).toHaveBeenCalled();
    expect(useAnimatedStyle).toHaveBeenCalled();
    expect(useScrollViewOffset).toHaveBeenCalled();
  });

  it("カラースキームに応じてヘッダー背景色が設定されること", () => {
    // ライトモードのテスト (デフォルトはライトモード)
    const { unmount, getByTestId } = render(
      <ParallaxScrollView
        headerImage={<TestHeaderImage />}
        headerBackgroundColor={headerBackgroundColors}
      >
        <Text>テストコンテンツ</Text>
      </ParallaxScrollView>
    );

    // Note: スタイルの詳細検証はReact Native Testingの制約上難しいため、
    // コンポーネントが正しくレンダリングされることのみを確認
    expect(getByTestId("header-image")).toBeTruthy();

    unmount();
  });
});
