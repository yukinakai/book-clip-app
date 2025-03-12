module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],
  testMatch: ["<rootDir>/**/*.test.tsx", "<rootDir>/**/*-test.tsx"],
  rootDir: "..",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "@react-native-async-storage/async-storage":
      "<rootDir>/tests/__mocks__/@react-native-async-storage/async-storage.js",
  },
  setupFiles: ["<rootDir>/tests/setup.js"],
};
