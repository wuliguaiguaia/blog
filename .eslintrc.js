module.exports = {
  parser: '@typescript-eslint/parser', // 定义 ESLint 的解析器
  plugins: ['@typescript-eslint'], // 定义所依赖的插件
  env: {
    browser: true,
    es6: true,
  },
  extends: ['eslint:recommended', 'next/core-web-vitals', 'plugin:@typescript-eslint/recommended'],
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
    // 'no-unused-vars': 'warn',
    'import/no-unresolved': [2, { ignore: ['^@'] }],
  },
}
