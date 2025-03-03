module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect'
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/types.ts',
    '!src/**/index.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/style.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {
        presets: ['babel-preset-expo'],
        plugins: [
          ['@babel/plugin-transform-private-methods', { loose: true }],
          ['@babel/plugin-proposal-private-property-in-object', { loose: true }]
        ]
      }
    ]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(jpg|jpeg|png|svg)$': '<rootDir>/__mocks__/fileMock.ts'
  }
};
