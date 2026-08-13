import eslint from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import tseslint from 'typescript-eslint';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});
const nextConfigs = compat
  .extends('next/core-web-vitals', 'next/typescript')
  .map((config) => ({
    ...config,
    files: ['apps/web/**/*.{ts,tsx}'],
  }));
const apiTypescriptConfigs = tseslint.configs.recommended.map((config) => ({
  ...config,
  files: ['apps/api/**/*.ts'],
}));

export default tseslint.config(
  {
    ignores: [
      '**/.next/**',
      '**/dist/**',
      '**/node_modules/**',
      'apps/api/src/generated/**',
    ],
  },
  eslint.configs.recommended,
  ...apiTypescriptConfigs,
  ...nextConfigs,
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['apps/api/**/*.ts'],
    rules: {
      'prefer-const': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
);
