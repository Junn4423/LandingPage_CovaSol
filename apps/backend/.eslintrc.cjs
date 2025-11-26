module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true
  },
  extends: ['eslint:recommended', 'plugin:import/recommended', 'plugin:import/typescript', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint', 'simple-import-sort'],
  rules: {
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
  },
  ignorePatterns: ['dist']
};
