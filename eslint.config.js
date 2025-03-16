// ESLint 9 用の設定ファイル
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import unusedImports from "eslint-plugin-unused-imports";

export default [
  // 基本設定
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        jsx: true,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "unused-imports": unusedImports,
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "all",
          argsIgnorePattern: "^_",
        },
      ],
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "all",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
  // Jestテストファイル用の設定
  {
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
    rules: {
      // テスト用の緩和ルール
      "@typescript-eslint/no-unused-vars": "warn", // テストでは警告に緩和
    },
    languageOptions: {
      globals: {
        jest: true,
      },
    },
  },
];
