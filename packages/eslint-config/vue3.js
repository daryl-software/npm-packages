var parser = 'vue-eslint-parser';
var parserOptions = {
  ecmaVersion: 2018,
  sourceType: 'module',
  parser: '@typescript-eslint/parser',
  extraFileExtensions: ['.vue'],
  project: './tsconfig.json',
};

module.exports = {
  root: true,
  env: {
    browser: true,
    "vue/setup-compiler-macros": true
  },
  "extends": [
    "plugin:vue/vue3-recommended",
    "eslint:recommended",
    "@vue/typescript/recommended",
    "plugin:prettier-vue/recommended",
  ],
  plugins: [
    "vue",
    "unused-imports"
  ],
  parser: parser,
  parserOptions: parserOptions,
  settings: {
    'import/resolver': {
      typescript: {},
    },
    "prettier-vue": {
      // Settings for how to process Vue SFC Blocks
      SFCBlocks: {
        template: true,
        script: true,
        style: true,
        // Settings for how to process custom blocks
        customBlocks: {
          // Treat the `<docs>` block as a `.markdown` file
          docs: { lang: "markdown" },
          // Treat the `<config>` block as a `.json` file
          config: { lang: "json" },
          // Treat the `<module>` block as a `.js` file
          module: { lang: "js" },
          // Ignore `<comments>` block (omit it or set it to `false` to ignore the block)
          comments: false
        }
      },
      // Use prettierrc for prettier options or not (default: `true`)
      usePrettierrc: true,
      // Set the options for `prettier.getFileInfo`.
      // @see https://prettier.io/docs/en/api.html#prettiergetfileinfofilepath-options
      fileInfoOptions: {
        // Path to ignore file (default: `'.prettierignore'`)
        // Notice that the ignore file is only used for this plugin
        ignorePath: ".testignore",
        // Process the files in `node_modules` or not (default: `false`)
        withNodeModules: false
      }
    }
  },
  rules: {
    "array-callback-return": "error",
    "arrow-body-style": ["error", "as-needed"],
    "block-scoped-var": "error",
    "eol-last": "error",
    "lines-between-class-members": ["error", "always", { exceptAfterSingleLine: true }],
    "no-await-in-loop": "warn",
    "no-console": "warn",
    "no-constructor-return": "error",
    "no-debugger": "error",
    "no-dupe-class-members": "off",
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
    "object-shorthand": "error",
    "prefer-arrow-callback": "error",
    "prefer-const": "error",
    "prefer-destructuring": "warn",
    "prefer-numeric-literals": "error",
    "prefer-regex-literals": "error",
    "prefer-template": "error",
    "prettier-vue/prettier": ["error"],
    "require-atomic-updates": "warn",
    "require-await": "warn",
    "unused-imports/no-unused-imports": "error",
    "vue/component-api-style": "error",
    "vue/multi-word-component-names": "off",
    complexity: "error",
    curly: ["error", "all"],
    eqeqeq: "error",
    quotes: ["warn", "single", { avoidEscape: true }],
  },
  overrides: [
    {
      files: ['*.ts', '*.vue'],
      parser: parser,
      parserOptions: parserOptions,
      extends: [
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
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
        "@typescript-eslint/no-floating-promises": ["warn", { "ignoreIIFE": true }],
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-shadow": "error",
        "no-duplicate-imports": "off",
        "@typescript-eslint/no-duplicate-imports": ["error"],
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
    },
  ],
};
