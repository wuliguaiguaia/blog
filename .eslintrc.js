module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: ['eslint:recommended', 'next/core-web-vitals'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    indent: ['error', 2],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'linebreak-style': ['error', 'unix'],
    'no-multiple-empty-lines': ['error', { max: 2 }],
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-console': 'off',
    'func-names': 'off',
    'no-use-before-define': 'off',
    'no-unused-vars': 'warn',
    'import/no-unresolved': [2, { ignore: ['^@'] }],
  },
}
