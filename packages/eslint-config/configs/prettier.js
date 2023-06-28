module.exports = {
    singleQuote: true,
    trailingComma: 'es5',
    tabWidth: 4,
    bracketSpacing: true,
    printWidth: 200,
    arrowParens: 'always',
    overrides: [
        {
            files: '*.json',
            options: {
                tabWidth: 2,
            },
        },
    ],
};
