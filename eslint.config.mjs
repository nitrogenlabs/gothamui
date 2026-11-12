import lexConfig from '@nlabs/lex/eslint.config.mjs';

export default [
  ...lexConfig,
  {
    files: ['*.config.mts', 'scripts/**/*.mjs', 'src/gitHooks.test.ts'],
    rules: {
      'import/extensions': ['error', 'ignorePackages', {js: 'always', mjs: 'always', mts: 'always', ts: 'always'}]
    }
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      'import/no-extraneous-dependencies': 'off'
    }
  },
  {
    files: ['**/*.stories.ts', '**/*.stories.tsx'],
    rules: {
      'import/no-extraneous-dependencies': 'off'
    }
  }
];
