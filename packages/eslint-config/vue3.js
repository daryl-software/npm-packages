const prettierConfig = require('./configs/prettier.js');
const rules = require('./configs/rules.js');
const tsRules = require('./configs/ts-rules.js');

const parser = 'vue-eslint-parser';
const parserOptions = {
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
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "@vue/typescript/recommended",
    "plugin:prettier-vue/recommended",
  ],
  plugins: [
    "vue",
    "unused-imports"
  ],
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
    ...rules,
    "vue/component-api-style": "error",
    "vue/multi-word-component-names": "off",
    'prettier-vue/prettier': [
      'error',
      prettierConfig,
    ],
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
        ...tsRules,
      },
    },
  ],
};
