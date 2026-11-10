import {expect, test} from '@nlabs/lex/test-playwright';
import {spawnSync} from 'node:child_process';
import {chmodSync, copyFileSync, cpSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';

const project = resolve(import.meta.dirname, '../..');
let seed: {base: string; cleanup: () => void; repo: string} | undefined;
const fixture = (inherited: NodeJS.ProcessEnv = process.env) => {
  const root = mkdtempSync(join(tmpdir(), 'gotham-hooks-'));
  const repo = join(root, 'repo');
  const bin = join(root, 'bin');
  const log = join(root, 'npm.log');
  mkdirSync(repo);
  mkdirSync(bin);
  writeFileSync(log, '');
  writeFileSync(join(bin, 'npm'), '#!/bin/sh\nprintf "%s\\n" "$*" >> "$HOOK_TEST_LOG"\nexit "$HOOK_TEST_STATUS"\n');
  chmodSync(join(bin, 'npm'), 0o755);
  const clean = Object.fromEntries(Object.entries(inherited).filter(([key]) => !key.startsWith('GIT_')));
  const env: NodeJS.ProcessEnv = {...clean, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_SYSTEM: '/dev/null',
    HOOK_TEST_LOG: log, HOOK_TEST_STATUS: '0', PATH: `${bin}:${process.env.PATH}`};
  let initialized = false;
  const assertChildRepository = () => {
    const top = spawnSync('git', ['rev-parse', '--show-toplevel'], {cwd: repo, encoding: 'utf8', env});
    const directory = spawnSync('git', ['rev-parse', '--absolute-git-dir'], {cwd: repo, encoding: 'utf8', env});
    if(top.status !== 0 || directory.status !== 0 || realpathSync(top.stdout.trim()) !== realpathSync(repo)
      || realpathSync(directory.stdout.trim()) !== realpathSync(join(repo, '.git'))) {
      throw new Error('Temporary Git repository identity was not confirmed.');
    }
  };
  const command = (program: string, args: string[], input?: string) => {
    if(initialized) {
      assertChildRepository();
    }
    return spawnSync(program, args, {cwd: repo, encoding: 'utf8', env, input});
  };
  const git = (...args: string[]) => {
    const result = command('git', args);
    if(result.status !== 0) {
      throw new Error(`Fixture Git command failed with code ${result.status}.`);
    }
    return result.stdout.trim();
  };
  const write = (path: string, value = 'fixture') => {
    mkdirSync(dirname(join(repo, path)), {recursive: true});
    writeFileSync(join(repo, path), value);
  };
  let base: string;
  if(seed) {
    cpSync(seed.repo, repo, {recursive: true});
    ({base} = seed);
    assertChildRepository();
    initialized = true;
  } else {
    git('init', '-q', '-b', 'main');
    assertChildRepository();
    initialized = true;
    git('config', 'user.name', 'Fixture');
    git('config', 'user.email', 'fixture@example.test');
    for(const path of ['.githooks/pre-commit', '.githooks/pre-push', 'scripts/gitHookPolicy.mjs',
      'scripts/git-test-hook.mjs', 'scripts/install-hooks.mjs']) {
      mkdirSync(dirname(join(repo, path)), {recursive: true});
      copyFileSync(join(project, path), join(repo, path));
      if(path.startsWith('.githooks/')) {
        chmodSync(join(repo, path), 0o755);
      }
    }
    write('README.md');
    git('add', '.');
    git('commit', '-q', '-m', 'base');
    base = git('rev-parse', 'HEAD');

    expect(command('node', ['scripts/install-hooks.mjs']).status).toBe(0);
  }
  const calls = () => readFileSync(log, 'utf8').trim().split('\n').filter(Boolean);
  const reset = () => writeFileSync(log, '');
  const commit = (path: string, value = 'changed') => {
    write(path, value);
    git('add', path);
    git('commit', '-q', '-m', path);
    return git('rev-parse', 'HEAD');
  };
  return {base, calls, cleanup: () => rmSync(root, {force: true, recursive: true}), command, commit, env, git,
    push: () => command('sh', ['.githooks/pre-push'], `refs/heads/main ${git('rev-parse', 'HEAD')} refs/heads/main ${base}\n`),
    repo, reset, root, write};
};

// Git's immutable object seed is constructed once, then copied into each independent temporary repository.
test.beforeAll(() => {
  seed = fixture();
});

test.afterAll(() => seed?.cleanup());

for(const path of ['README.md', 'data.json', 'image.png', 'style.css']) {
  test(`real pre-commit skips non-code ${path}`, () => {
    const f = fixture();
    try {
      f.env.HOOK_TEST_STATUS = '7';
      f.commit(path);

      expect(f.calls()).toEqual([]);
    } finally {
      f.cleanup();
    }
  });
}

test('real Git commit is blocked by a failing unit command and never invokes E2E', () => {
  const f = fixture();
  try {
    f.write('src/example.ts');
    f.git('add', 'src/example.ts');
    f.env.HOOK_TEST_STATUS = '7';

    expect(f.command('git', ['commit', '-q', '-m', 'blocked']).status).not.toBe(0);
    expect(f.git('rev-parse', 'HEAD')).toBe(f.base);
    expect(f.calls()).toEqual(['run test:precommit']);
  } finally {
    f.cleanup();
  }
});

test('real staged deletion and rename both run the unit gate', () => {
  const f = fixture();
  try {
    f.commit('src/a.ts');
    f.reset();
    f.git('mv', 'src/a.ts', 'src/b.ts');
    f.git('commit', '-q', '-m', 'rename');

    expect(f.calls()).toEqual(['run test:precommit']);

    f.reset();
    f.git('rm', 'src/b.ts');
    f.git('commit', '-q', '-m', 'delete');

    expect(f.calls()).toEqual(['run test:precommit']);
  } finally {
    f.cleanup();
  }
});

test('the actual pre-push scans all commits and propagates an E2E failure', () => {
  const f = fixture();
  try {
    f.commit('src/a.ts');
    f.commit('README.md');
    f.reset();
    f.env.HOOK_TEST_STATUS = '9';

    expect(f.push().status).toBe(9);
    expect(f.calls()).toEqual(['run test:e2e']);
  } finally {
    f.cleanup();
  }
});

test('real Git push to a temporary local bare remote is blocked by the E2E gate', () => {
  const f = fixture();
  try {
    f.git('init', '-q', '--bare', join(f.root, 'remote.git'));
    f.git('remote', 'add', 'origin', join(f.root, 'remote.git'));
    f.git('update-ref', 'refs/remotes/origin/main', f.base);
    f.commit('style.css');
    f.commit('README.md');
    f.reset();
    f.env.HOOK_TEST_STATUS = '9';

    expect(f.command('git', ['push', 'origin', 'HEAD:main']).status).not.toBe(0);
    expect(f.calls()).toEqual(['run test:e2e']);
  } finally {
    f.cleanup();
  }
});

test('real docs-only push skips both test families, while unreadable ranges run E2E', () => {
  const f = fixture();
  try {
    f.commit('README.md');
    f.reset();

    expect(f.push().status).toBe(0);
    expect(f.calls()).toEqual([]);

    const input = `refs/heads/main ${'a'.repeat(40)} refs/heads/main ${'b'.repeat(40)}\n`;

    expect(f.command('sh', ['.githooks/pre-push'], input).status).toBe(0);
    expect(f.calls()).toEqual(['run test:e2e']);
  } finally {
    f.cleanup();
  }
});

test('real pre-push sees a code commit and its revert even when only docs remain in the net delta', () => {
  const f = fixture();
  try {
    f.commit('src/transient.ts');
    f.git('rm', 'src/transient.ts');
    f.git('commit', '-q', '-m', 'revert code');
    f.commit('README.md');
    f.reset();
    f.env.HOOK_TEST_STATUS = '9';

    expect(f.push().status).toBe(9);
    expect(f.calls()).toEqual(['run test:e2e']);
  } finally {
    f.cleanup();
  }
});


test('nested hook Git variables cannot escape into a child temporary repository', () => {
  const parent = fixture();
  let child: ReturnType<typeof fixture> | undefined;
  try {
    const parentGit = join(parent.repo, '.git');
    const head = parent.git('rev-parse', 'HEAD');
    const index = readFileSync(join(parentGit, 'index'));
    const config = readFileSync(join(parentGit, 'config'));
    const inherited: NodeJS.ProcessEnv = {...parent.env};
    for(const key of parent.git('rev-parse', '--local-env-vars').split('\n')) {
      inherited[key] = 'poison';
    }
    const injected = {...inherited, GIT_COMMON_DIR: parentGit, GIT_CONFIG: join(parentGit, 'config'), GIT_CONFIG_COUNT: '1',
      GIT_CONFIG_KEY_0: 'core.bare', GIT_CONFIG_VALUE_0: 'true', GIT_DIR: parentGit,
      GIT_INDEX_FILE: join(parentGit, 'index'), GIT_WORK_TREE: parent.repo};
    child = fixture(injected);
    child.commit('src/nested.ts');

    expect(child.git('rev-parse', '--show-toplevel')).toBe(realpathSync(child.repo));
    expect(parent.git('rev-parse', 'HEAD')).toBe(head);
    expect(readFileSync(join(parentGit, 'index'))).toEqual(index);
    expect(readFileSync(join(parentGit, 'config'))).toEqual(config);
  } finally {
    child?.cleanup();
    parent.cleanup();
  }
});
