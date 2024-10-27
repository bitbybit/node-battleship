import pluginJs from '@eslint/js'
import pluginTs from 'typescript-eslint'
import pluginJsDoc from 'eslint-plugin-jsdoc'
import pluginPromise from 'eslint-plugin-promise'
import pluginImport from 'eslint-plugin-import'
import pluginPrettier from 'eslint-config-prettier'

export default [
  pluginJs.configs.recommended,
  ...pluginTs.configs.recommended,
  pluginJsDoc.configs['flat/recommended-typescript'],
  pluginImport.flatConfigs.recommended,
  pluginImport.flatConfigs.typescript,
  pluginPromise.configs['flat/recommended'],

  {
    files: ['**/*.{js,mjs,cjs,ts}'],

    settings: {
      'import/resolver': {
        typescript: true,
        node: true
      }
    }
  },

  {
    files: ['**/*.{js,mjs,cjs}'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },

    rules: {
      'no-unused-vars': 'off',
      'import/no-dynamic-require': 'warn',
      'import/no-nodejs-modules': 'warn'
    }
  },

  {
    files: ['**/*.js'],

    languageOptions: {
      sourceType: 'commonjs'
    }
  },

  {
    files: ['**/*.ts'],

    plugins: {
      jsdoc: pluginJsDoc
    },

    rules: {
      'no-else-return': [
        'error',
        {
          allowElseIf: false
        }
      ],

      'jsdoc/require-param-description': 0,
      'jsdoc/require-property-description': 0,
      'jsdoc/require-returns-description': 0,
      'jsdoc/require-throws': 1
    }
  },

  {
    ignores: ['node_modules/*']
  },

  pluginPrettier
]
