// ESLint 9 flat config. Replaces .eslintrc.cjs, which ESLint 9 no longer reads by default
// (see PROJECT-FIXES-SUMMARY.md / SITE_FULL_PUBLIC_REDESIGN_AND_DEPLOY_REPORT.md — this was
// tracked as pre-existing "PARTIAL" lint tooling debt predating this rebuild).
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import astroPlugin from 'eslint-plugin-astro';
import astroParser from 'astro-eslint-parser';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', '.astro/**', 'public/preview/**', 'qa/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { window: 'readonly', document: 'readonly', console: 'readonly', localStorage: 'readonly', fetch: 'readonly', FormData: 'readonly', File: 'readonly', URLSearchParams: 'readonly', process: 'readonly' },
    },
    plugins: { '@typescript-eslint': tseslint, 'jsx-a11y': jsxA11y },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
      'no-undef': 'off',
    },
  },
  ...astroPlugin.configs['flat/recommended'],
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroParser,
      parserOptions: { parser: tsParser, extraFileExtensions: ['.astro'] },
    },
  },
  prettierConfig,
];
