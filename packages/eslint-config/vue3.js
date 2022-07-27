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
  parserOptions: {
    ecmaVersion: 2020
  },
  settings: {
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
  }
};
