import js from "@eslint/js";
import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: ["dist/**", "node_modules/**"]
  },
  js.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module"
      },
      globals: {
        chrome: "readonly",
        document: "readonly",
        window: "readonly"
      }
    },
    plugins: {
      "@typescript-eslint": tsEslintPlugin
    },
    rules: {
      ...tsEslintPlugin.configs.recommended.rules,
      "@typescript-eslint/no-misused-promises": "error"
    }
  }
];
