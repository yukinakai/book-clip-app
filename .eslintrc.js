module.exports = {
  extends: ["eslint-config-expo"],
  parser: "@typescript-eslint/parser",
  plugins: ["unused-imports"],
  rules: {
    "no-unused-vars": "off",
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],
  },
  overrides: [
    {
      // Jestテストファイル用の設定
      files: [
        "**/*.test.js",
        "**/*.test.jsx",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/tests/**/*.js",
        "**/tests/**/*.jsx",
        "**/tests/**/*.ts",
        "**/tests/**/*.tsx",
        "jest.setup.js",
      ],
      env: {
        jest: true, // jestグローバル変数を有効化
      },
      rules: {
        // テスト用の緩和ルール
        "react/no-unknown-property": "off",
        "import/first": "off",
      },
    },
  ],
};
