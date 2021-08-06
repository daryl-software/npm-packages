module.exports = {
  "extends": ["eslint:recommended", "plugin:node/recommended", "prettier","plugin:@typescript-eslint/recommended"],
  "plugins": ["node", "prettier","@typescript-eslint"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "ignorePatterns": ["dist", "node_modules", ".eslintrc.js"],
  "rules": {
    //        "@typescript-eslint/member-ordering": "error",
    "@typescript-eslint/member-ordering": ["error", { "default": ["signature", "field", "public-static-field", "static-field", "constructor", "method"] }],
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/return-await": "error",
    "@typescript-eslint/no-throw-literal": "error",
    "@typescript-eslint/array-type": "error",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/camelcase": "off",
    "node/no-missing-import": "off",
    "node/no-empty-function": "off",
    "node/no-unsupported-features/es-syntax": "off",
    "node/no-missing-require": "off",
    "node/shebang": "off",
    "node/no-extraneous-import": ["error", {
      "allowModules": ["mocha","chai","@ezweb/ts-config-loader"]
    }],
    "no-dupe-class-members": "off",
    "require-atomic-updates": "off",
    //    "lines-between-class-members": ["error", "always"],
    "curly": ["error", "all"],
    "object-shorthand": "error",
    "prettier/prettier": "error",
    "block-scoped-var": "error",
    "eqeqeq": "error",
    "require-await": "error",
    "no-var": "error",
    "prefer-const": "error",
    "eol-last": "error",
    "prefer-arrow-callback": "error",
    "no-trailing-spaces": "error",
    "quotes": ["warn", "single", { "avoidEscape": true }],
    "no-restricted-properties": [
      "error",
      {
        "object": "describe",
        "property": "only"
      },
      {
        "object": "it",
        "property": "only"
      }
    ],
    "arrow-body-style": ["error", "as-needed"],
    "no-empty-pattern": "off",
    "no-unused-vars": "error",
    "no-duplicate-imports": "error",
    "no-useless-concat": "error",
    "prefer-template": "error",
    "prefer-destructuring": "error",
    "no-console": "error"
  }
};
