module.exports = {
  "extends": ["./packages/eslint-config/node"],
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "parser": "@typescript-eslint/parser",
  "ignorePatterns": ["dist", "node_modules", ".eslintrc.js"],
};
