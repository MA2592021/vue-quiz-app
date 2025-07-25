import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import prettier from 'eslint-plugin-prettier'
import vueParser from 'vue-eslint-parser'

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
      },
    },
    plugins: {
      vue,
    },
    rules: {
      ...vue.configs['flat/recommended'].rules,
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
