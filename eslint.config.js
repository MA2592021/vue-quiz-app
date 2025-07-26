import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import prettier from 'eslint-plugin-prettier'
import vueParser from 'vue-eslint-parser'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'
import typescriptEslint from '@typescript-eslint/eslint-plugin'

export default [
  js.configs.recommended,

  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
        parser: tsParser, // sub-parser for <script lang="ts">
      },
      globals: {
        ...globals.browser,
      },
    },

    plugins: {
      vue,
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      ...vue.configs['flat/recommended'].rules,
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'padding-line-between-statements': [
        'error',
        // Disallow blank lines between import statements
        {
          blankLine: 'never',
          prev: 'import',
          next: 'import',
        },
        // Allow a blank line only after the last import statement and before other statements
        {
          blankLine: 'always',
          prev: 'import',
          next: [
            'const',
            'let',
            'var',
            'function',
            'class',
            'export',
            'expression',
          ],
        },

        // Between variable declarations and anything else
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        {
          blankLine: 'any',
          prev: ['const', 'let', 'var'],
          next: ['const', 'let', 'var'],
        },

        // Between functions
        { blankLine: 'always', prev: 'function', next: '*' },
        { blankLine: 'always', prev: '*', next: 'function' },

        // Between return and anything before
        { blankLine: 'always', prev: '*', next: 'return' },
      ],
    },
  },

  {
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },

  {
    ignores: ['node_modules', 'dist'],
  },
]
