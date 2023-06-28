const rules = require('./configs/rules.js');
const tsRules = require('./configs/ts-rules.js');

module.exports = {
    extends: ['eslint:recommended', 'plugin:node/recommended', 'plugin:prettier/recommended'],
    plugins: ['node', 'unused-imports'],
    rules: {
        ...rules,
        'node/no-empty-function': 'off',
        'node/no-extraneous-import': ['error'],
        'node/no-missing-import': 'off',
        'node/no-missing-require': 'off',
        'node/no-unsupported-features/es-syntax': 'off',
        'node/shebang': 'off',
    },
    overrides: [
        {
            files: ['**/*.ts'],
            parser: '@typescript-eslint/parser',
            extends: ['plugin:@typescript-eslint/recommended', 'plugin:@typescript-eslint/recommended-requiring-type-checking'],
            rules: {
                ...tsRules,
            },
            parserOptions: {
                ecmaVersion: 2021,
                sourceType: 'script',
            },
        },
    ],
};
