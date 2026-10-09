import lexConfig from '@nlabs/lex/eslint.config.mjs';

export default [
  ...lexConfig,
  {
    files: ['*.config.mts'],
    rules: {
      'import/extensions': ['error', 'ignorePackages', {js: 'always', mts: 'always', ts: 'always'}]
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
