import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
  useColorScheme,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SvgXml } from "react-native-svg";

// SVGコンテンツを生成する関数（カラーテーマに応じて色を変更）
const createBarcodeSvg = (isDark: boolean) => {
  const bgColor = isDark ? "#1A1A1A" : "#F5F7F9";
  const primaryColor = "#4169E1";
  const textColor = isDark ? "#E0E0E0" : "#333333";

  return `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" rx="20" fill="${bgColor}"/>
    <rect x="40" y="70" width="120" height="60" rx="5" fill="${primaryColor}" fill-opacity="0.2"/>
    <rect x="50" y="80" width="5" height="40" fill="${primaryColor}"/>
    <rect x="60" y="80" width="2" height="40" fill="${primaryColor}"/>
    <rect x="65" y="80" width="4" height="40" fill="${primaryColor}"/>
    <rect x="72" y="80" width="6" height="40" fill="${primaryColor}"/>
    <rect x="82" y="80" width="3" height="40" fill="${primaryColor}"/>
    <rect x="90" y="80" width="5" height="40" fill="${primaryColor}"/>
    <rect x="100" y="80" width="2" height="40" fill="${primaryColor}"/>
    <rect x="105" y="80" width="6" height="40" fill="${primaryColor}"/>
    <rect x="115" y="80" width="3" height="40" fill="${primaryColor}"/>
    <rect x="122" y="80" width="4" height="40" fill="${primaryColor}"/>
    <rect x="130" y="80" width="2" height="40" fill="${primaryColor}"/>
    <rect x="135" y="80" width="5" height="40" fill="${primaryColor}"/>
    <rect x="145" y="80" width="3" height="40" fill="${primaryColor}"/>
    <circle cx="100" cy="140" r="15" fill="${primaryColor}" fill-opacity="0.2"/>
    <path d="M100 135V145M95 140H105" stroke="${primaryColor}" stroke-width="2" stroke-linecap="round"/>
    <text x="100" y="170" text-anchor="middle" font-family="Arial" font-size="12" fill="${textColor}">バーコードをスキャン</text>
  </svg>`;
};

const createCameraSvg = (isDark: boolean) => {
  const bgColor = isDark ? "#1A1A1A" : "#F5F7F9";
  const primaryColor = "#4169E1";
  const textColor = isDark ? "#E0E0E0" : "#333333";

  return `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" rx="20" fill="${bgColor}"/>
    <rect x="60" y="60" width="80" height="80" rx="10" fill="${primaryColor}" fill-opacity="0.2"/>
    <circle cx="100" cy="100" r="30" stroke="${primaryColor}" stroke-width="3" fill="none"/>
    <circle cx="100" cy="100" r="20" stroke="${primaryColor}" stroke-width="2" fill="none"/>
    <circle cx="130" cy="70" r="5" fill="${primaryColor}"/>
    <rect x="70" y="140" width="60" height="8" rx="4" fill="${primaryColor}" fill-opacity="0.2"/>
    <rect x="75" y="150" width="50" height="5" rx="2.5" fill="${primaryColor}" fill-opacity="0.2"/>
    <path d="M100 85V115M85 100H115" stroke="${primaryColor}" stroke-width="2" stroke-linecap="round"/>
    <text x="100" y="170" text-anchor="middle" font-family="Arial" font-size="12" fill="${textColor}">ページを撮影</text>
  </svg>`;
};

const createSearchSvg = (isDark: boolean) => {
  const bgColor = isDark ? "#1A1A1A" : "#F5F7F9";
  const primaryColor = "#4169E1";
  const textColor = isDark ? "#E0E0E0" : "#333333";

  return `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" rx="20" fill="${bgColor}"/>
    <circle cx="90" cy="90" r="30" stroke="${primaryColor}" stroke-width="3" fill="none"/>
    <path d="M110 110L130 130" stroke="${primaryColor}" stroke-width="3" stroke-linecap="round"/>
    <rect x="60" y="140" width="80" height="8" rx="4" fill="${primaryColor}" fill-opacity="0.2"/>
    <rect x="70" y="152" width="60" height="5" rx="2.5" fill="${primaryColor}" fill-opacity="0.2"/>
    <rect x="65" y="162" width="70" height="5" rx="2.5" fill="${primaryColor}" fill-opacity="0.2"/>
    <rect x="50" y="85" width="30" height="2" rx="1" fill="${primaryColor}" fill-opacity="0.5"/>
    <rect x="60" y="92" width="20" height="2" rx="1" fill="${primaryColor}" fill-opacity="0.5"/>
    <rect x="55" y="99" width="25" height="2" rx="1" fill="${primaryColor}" fill-opacity="0.5"/>
    <text x="100" y="190" text-anchor="middle" font-family="Arial" font-size="12" fill="${textColor}">キーワード検索</text>
  </svg>`;
};

// オンボーディング完了のフラグをAsyncStorageに保存するキー
const ONBOARDING_COMPLETE_KEY = "@bookclip:onboarding_complete";

// スライドの型を定義
type Slide = {
  id: string;
  title: string;
  description: string;
  svgContent: string;
};

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<Animated.FlatList<Slide>>(null);

  // カラーテーマを取得
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // カラーテーマに応じたスライド内容を生成
  const slides = [
    {
      id: "1",
      title: "書籍情報を簡単に取得",
      description:
        "本のバーコードをスキャンするだけで、タイトルや著者情報を自動取得します。",
      svgContent: createBarcodeSvg(isDark),
    },
    {
      id: "2",
      title: "気になるページを保存",
      description:
        "読んでいる本の気になるページをカメラで撮影し、テキストを自動的に抽出して保存します。",
      svgContent: createCameraSvg(isDark),
    },
    {
      id: "3",
      title: "いつでもどこでも検索",
      description:
        "保存したテキストや画像をキーワードで検索し、必要な時に必要な情報にアクセスできます。",
      svgContent: createSearchSvg(isDark),
    },
  ];

  const handleScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
      router.replace("/(tabs)");
    } catch (error) {
      console.error("オンボーディング完了状態の保存に失敗しました", error);
    }
  };

  const renderItem = ({ item }: { item: Slide }) => {
    return (
      <View style={[styles.slide, { width }]}>
        <SvgXml xml={item.svgContent} width={200} height={200} />
        <View style={styles.textContainer}>
          <Text style={[styles.title, isDark && styles.titleDark]}>
            {item.title}
          </Text>
          <Text style={[styles.description, isDark && styles.descriptionDark]}>
            {item.description}
          </Text>
        </View>
      </View>
    );
  };

  const Dots = () => {
    return (
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotAnimatedStyle = useAnimatedStyle(() => {
            const dotWidth = interpolate(
              scrollX.value,
              inputRange,
              [8, 16, 8],
              { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
            );
            const opacity = interpolate(
              scrollX.value,
              inputRange,
              [0.5, 1, 0.5],
              { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
            );
            return {
              width: dotWidth,
              opacity,
            };
          });

          return (
            <Animated.View
              key={index.toString()}
              style={[styles.dot, dotAnimatedStyle]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
        testID="skip-button"
      >
        <Text style={[styles.skipText, isDark && styles.skipTextDark]}>
          スキップ
        </Text>
      </TouchableOpacity>

      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        testID="onboarding-slides"
      />

      <Dots />

      <TouchableOpacity
        style={styles.nextButton}
        onPress={handleNext}
        testID="next-button"
      >
        <Text style={styles.nextText}>
          {currentIndex === slides.length - 1 ? "始める" : "次へ"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  containerDark: {
    backgroundColor: "#121212",
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginBottom: 40,
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  titleDark: {
    color: "#E0E0E0",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  descriptionDark: {
    color: "#A0A0A0",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4169E1",
    marginHorizontal: 4,
  },
  nextButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    backgroundColor: "#4169E1",
    borderRadius: 30,
    marginBottom: 50,
    alignSelf: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  nextText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  skipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    color: "#666",
  },
  skipTextDark: {
    color: "#A0A0A0",
  },
});
