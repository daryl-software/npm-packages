module.exports = {
  "extends": ["eslint:recommended", "plugin:node/recommended", "plugin:prettier/recommended"],
  "plugins": ["node", "unused-imports"],
  "rules": {
    "array-callback-return": "error",
    "arrow-body-style": ["error", "as-needed"],
    "block-scoped-var": "error",
    "complexity": "error",
    "curly": ["error", "all"],
    "eol-last": "error",
    "eqeqeq": "error",
    "lines-between-class-members": ["error", "always", { "exceptAfterSingleLine": true }],
    "no-await-in-loop": "warn",
    "no-console": "error",
    "no-constructor-return": "error",
    "no-dupe-class-members": "off",
    "no-duplicate-imports": "off",
    "no-empty-pattern": "off",
    "no-extra-boolean-cast": "error",
    "no-loop-func": "error",
    "no-promise-executor-return": "error",
    "no-restricted-properties": ["error"],
    "no-sequences": "error",
    "no-template-curly-in-string": "error",
    "no-trailing-spaces": "error",
    "no-unmodified-loop-condition": "error",
    "no-unreachable-loop": "error",
    "no-unused-vars": "error",
    "no-useless-concat": "error",
    "no-useless-return": "error",
    "no-var": "error",
    "node/no-empty-function": "off",
    "node/no-extraneous-import": ["error"],
    "node/no-missing-import": "off",
    "node/no-missing-require": "off",
    "node/no-unsupported-features/es-syntax": "off",
    "node/shebang": "off",
    "object-shorthand": "error",
    "prefer-arrow-callback": "error",
    "prefer-const": "error",
    "prefer-destructuring": "error",
    "prefer-numeric-literals": "error",
    "prefer-regex-literals": "error",
    "prefer-template": "error",
    "quotes": ["warn", "single", { "avoidEscape": true }],
    "require-atomic-updates": "warn",
    "require-await": "warn",
    "unused-imports/no-unused-imports": "error"
  },
  "overrides": [
    {
      "files": ["**/*.ts"],
      "parser": "@typescript-eslint/parser",
      "extends": ["plugin:@typescript-eslint/recommended", "plugin:@typescript-eslint/recommended-requiring-type-checking"],
      "rules": {
        "@typescript-eslint/array-type": "error",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/camelcase": "off",
        "@typescript-eslint/consistent-indexed-object-style": "error",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/lines-between-class-members": ["error", "always", { "exceptAfterSingleLine": true, "exceptAfterOverload": true }],
        "@typescript-eslint/member-ordering": ["error", { "default": ["signature", "field", "public-static-field", "static-field", "constructor", "method"] }],
        "@typescript-eslint/no-confusing-non-null-assertion": "error",
        "@typescript-eslint/no-confusing-void-expression": "error",
        "@typescript-eslint/no-duplicate-imports": ["error"],
        "@typescript-eslint/no-floating-promises": ["warn", { "ignoreIIFE": true }],
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-shadow": "error",
        "@typescript-eslint/no-throw-literal": "error",
        "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
        "@typescript-eslint/no-unnecessary-qualifier": "error",
        "@typescript-eslint/no-unnecessary-type-assertion": "warn",
        "@typescript-eslint/no-unsafe-argument": "warn",
        "@typescript-eslint/no-unsafe-assignment": "warn",
        "@typescript-eslint/no-unsafe-call": "warn",
        "@typescript-eslint/no-unsafe-member-access": "warn",
        "@typescript-eslint/no-unsafe-return": "warn",
        "@typescript-eslint/no-unused-vars": "error",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/prefer-includes": "error",
        "@typescript-eslint/prefer-string-starts-ends-with": "error",
        "@typescript-eslint/require-await": "error",
        "@typescript-eslint/restrict-template-expressions": "off",
        "@typescript-eslint/return-await": "error",
        "@typescript-eslint/switch-exhaustiveness-check": "error",
        "lines-between-class-members": "off"
      },
      "parserOptions": {
        "ecmaVersion": 2021,
        "sourceType": "script"
      }
    },
  ],
};