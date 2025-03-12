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
};
