import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
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

// オンボーディングの内容を定義
const slides = [
  {
    id: "1",
    title: "書籍情報を簡単に取得",
    description:
      "本のバーコードをスキャンするだけで、タイトルや著者情報を自動取得します。",
    image: require("../assets/images/onboarding-barcode.png"),
  },
  {
    id: "2",
    title: "気になるページを保存",
    description:
      "読んでいる本の気になるページをカメラで撮影し、テキストを自動的に抽出して保存します。",
    image: require("../assets/images/onboarding-camera.png"),
  },
  {
    id: "3",
    title: "いつでもどこでも検索",
    description:
      "保存したテキストや画像をキーワードで検索し、必要な時に必要な情報にアクセスできます。",
    image: require("../assets/images/onboarding-search.png"),
  },
];

// オンボーディング完了のフラグをAsyncStorageに保存するキー
const ONBOARDING_COMPLETE_KEY = "@bookclip:onboarding_complete";

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const flatListRef = useRef(null);

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

  const renderItem = ({ item, index }) => {
    return (
      <View style={[styles.slide, { width }]}>
        <Image source={item.image} style={styles.image} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
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
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
        testID="skip-button"
      >
        <Text style={styles.skipText}>スキップ</Text>
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
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    paddingHorizontal: 20,
    lineHeight: 22,
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
});
