/**
 * @import {FlatXoConfig} from 'xo'
 */

/** @type {FlatXoConfig} */
const xoConfig = [
  {
    name: 'default',
    prettier: 'compat',
    rules: {
      'jsdoc/check-indentation': 'off',
      'jsdoc/check-line-alignment': 'off',
      'jsdoc/check-param-names': 'off',
      'jsdoc/informative-docs': 'off',
      'jsdoc/require-asterisk-prefix': 'off',
      'jsdoc/require-returns-type': 'off',
      'prefer-arrow-callback': 'off',
      'prefer-destructuring': 'off',
      'unicorn/consistent-boolean-name': 'off',
      'unicorn/no-array-sort': 'off',
      'unicorn/no-duplicate-if-branches': 'off',
      'unicorn/prefer-at': 'off',
      'unicorn/prefer-simple-condition-first': 'off',
      'unicorn/require-array-sort-compare': 'off',
      'unicorn/single-line-block-comment-style': 'off'
    },
    space: true
  },
  {
    files: ['package.json'],
    rules: {
      'package-json/no-orphan-types': 'off',
      'package-json/require-engines': 'off',
      'package-json/sort-files': 'off',
      'package-json/sort-properties': 'off'
    }
  }
]

export default xoConfig
