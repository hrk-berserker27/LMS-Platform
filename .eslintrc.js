module.exports = {
    env: {
        node: true,
        es2021: true,
        jest: true
    },
    extends: ['eslint:recommended'],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module'
    },
    rules: {
        // Disable false positive lazy loading warnings
        'javascript/lazy-load-module': 'off',
        // Allow console statements in development
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        // Other common rules
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'no-undef': 'error'
    }
};