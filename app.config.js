// @ts-check

/**
 * @param {ConfigContext} config
 * @returns {ExpoConfig}
 */
export default function ({ config }) {
  return {
    ...config,
    name: "book-clip-app",
    slug: "book-clip-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    // Babel設定ファイルのパスを明示的に指定
    babel: {
      configPath: "./babel.config.cjs",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageResizeMode: "contain",
          imageWidth: 300,
          backgroundColor: "#ffffff",
          dark: {
            image: "./assets/images/splash-icon-dark.png",
            backgroundColor: "#121212",
          },
          splashTransparent: false,
        },
      ],
      [
        "expo-camera",
        {
          cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
          microphonePermission:
            "Allow $(PRODUCT_NAME) to access your microphone",
          recordAudioAndroid: true,
        },
      ],
      [
        "expo-media-library",
        {
          photosPermission: "Allow $(PRODUCT_NAME) to access your photos",
          savePhotosPermission: "Allow $(PRODUCT_NAME) to save photos",
          isAccessMediaLocationEnabled: true,
        },
      ],
    ],
  };
}
