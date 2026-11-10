import base from './eslint.config.mjs';

export default [...base, {
  files: ['scripts/*.mjs', 'tests/hooks/*.e2e.ts', 'src/gitHooks.test.ts', 'eslint.hooks.config.mjs'],
  languageOptions: {parserOptions: {project: './tsconfig.hooks.json', projectService: false,
    tsconfigRootDir: import.meta.dirname}},
  rules: {'import/extensions': ['error', 'ignorePackages', {js: 'always', mjs: 'always', ts: 'always'}]}
}];
