import globals from 'globals';
import tseslint from 'typescript-eslint';

import path from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import pluginJs from '@eslint/js';

import importPlugin from 'eslint-plugin-import';
import prettierConfig from 'eslint-config-prettier';
import stylisticTsPlugin from '@stylistic/eslint-plugin-ts';
import vitestPlugin from 'eslint-plugin-vitest';

// mimic CommonJS variables -- not needed if using CommonJS
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const compat = new FlatCompat({
  baseDirectory: dirname,
  recommendedConfig: pluginJs.configs.recommended,
});

/** @type {import('eslint').Linter.FlatConfig} */
const flatConfig = [
  { ignores: ['/dist', '/lib'] },
  {
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  ...compat.extends('standard-with-typescript'),
  ...tseslint.configs.recommended,
  // vitestPlugin.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      import: importPlugin,
      '@stylistic/ts': stylisticTsPlugin,
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.ts', '.tsx'],
        },
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      '@/curly': 'error',
      '@stylistic/ts/semi': 'error',
      eqeqeq: 'error',
      complexity: [
        'error',
        {
          max: 15,
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      'arrow-body-style': ['error', 'as-needed'],
      'no-unneeded-ternary': 'error',
      'prefer-arrow-callback': 'error',
      'no-else-return': 'error',
      'no-useless-return': 'error',
      'no-console': [
        'error',
        {
          allow: ['warn', 'error', 'info'],
        },
      ],
      'array-callback-return': [
        'error',
        {
          allowImplicit: true,
        },
      ],
      'import/order': [
        'error',
        {
          alphabetize: { caseInsensitive: true, order: 'asc' },
          groups: ['builtin', 'external', 'parent', 'sibling'],
          'newlines-between': 'always',
          pathGroups: [],
          pathGroupsExcludedImportTypes: ['builtin'],
        },
      ],
    },
  },
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    plugins: {
      vitest: vitestPlugin,
    },
  },
];

export default flatConfig;
