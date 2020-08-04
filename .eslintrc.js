module.exports = {
  root: true,
  env: {
    browser: false,
    es6: true,
    es2017: true,
    es2020: true,
    node: true,
  },
  globals: {
    enx: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'prefer-destructuring': 'off',
    'class-methods-use-this': 'off',
    // #region regras-comite
    'camelcase': 'error',
    'no-new': 'error',
    'no-unused-vars': 'error',
    'max-len': ['error', { 'code': 100 }],
    'import/no-dynamic-require': 0,
    'padded-blocks': ['error', 'never'],
    'no-unused-expressions': 'error',
    // allow optionalDependencies
    'import/no-extraneous-dependencies': ['error', {
      optionalDependencies: ['test/unit/index.js']
    }],
    // disallow reassignment of function parameters
    // disallow parameter object manipulation except for specific exclusions
    'no-param-reassign': ['error', {
      props: true,
      ignorePropertyModificationsFor: [
        'acc', // for reduce accumulators
        'e', // for e.returnvalue
        'config',
      ]
    }],
    'no-plusplus': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'semi': ['error', 'always'],
    // #endregion regras-comite

    'no-eval': 1,
    'no-confusing-arrow': 'off',
    'arrow-parens': 'off',
    'consistent-return': 'off',
    'no-alert': 'off',
    'no-underscore-dangle': 'off',
    'import/prefer-default-export': 'off',
    'import/extensions': ['warn', 'always'],
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-console': 'error',
  },
};
