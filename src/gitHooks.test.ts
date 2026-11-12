import {afterEach, beforeEach, describe, expect, test, vi} from '@nlabs/lex/test-vitest';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {chmodSync, copyFileSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';

import {selectHookTask} from '../scripts/gitHookPolicy.mjs';

const files = (paths: string[]) => ({status: 0, stdout: `${paths.join('\0')}\0`});
const line = (local = 'a'.repeat(40), remote = 'b'.repeat(40)) => `refs/heads/topic ${local} refs/heads/topic ${remote}\n`;

test.each(['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'mts', 'cts'])('staged .%s runs only unit tests', (extension) => {
  const git = vi.fn(() => files([`src/雪\nname.${extension}`]));

  expect(selectHookTask('pre-commit', git, '')).toBe('test:precommit');
  expect(git).toHaveBeenCalledWith(['diff', '--cached', '--name-only', '--no-renames', '--diff-filter=ACMRDT', '-z']);
});

test.each(['README.md', 'package.json', 'image.png', 'source.css', 'file.py', 'index.html'])('staged %s never runs tests', (name) => {
  expect(selectHookTask('pre-commit', () => files([name]), '')).toBeUndefined();
});

test.each(['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'mts', 'cts', 'css'])('pushed .%s runs only E2E', (extension) => {
  expect(selectHookTask('pre-push', () => files([`src/a.${extension}`]), line())).toBe('test:e2e');
});

test.each(['README.md', 'package.json', 'image.png', 'file.py', 'index.html'])('pushed %s never runs tests', (name) => {
  expect(selectHookTask('pre-push', () => files([name]), line())).toBeUndefined();
});

test('a new branch compares the original default-branch fork across all pushed commits', () => {
  const git = vi.fn((args: string[]) => {
    if(args[0] === 'symbolic-ref') {
      return {status: 0, stdout: 'refs/remotes/origin/main\n'};
    }
    if(args[0] === 'merge-base') {
      return {status: 0, stdout: 'fork\n'};
    }
    return files(['src/earlier.ts', 'README.md']);
  });

  expect(selectHookTask('pre-push', git, line('a'.repeat(40), '0'.repeat(40)))).toBe('test:e2e');
  expect(git).toHaveBeenCalledWith(['merge-base', 'a'.repeat(40), 'refs/remotes/origin/main']);
  expect(git).toHaveBeenCalledWith(['log', '-m', '--format=', '--name-only', '--no-renames', '-z', `fork..${'a'.repeat(40)}`]);
});

test('unreadable ranges fail closed while deleted branches run nothing', () => {
  const git = vi.fn(() => ({status: 128, stdout: ''}));

  expect(selectHookTask('pre-push', git, line())).toBe('test:e2e');
  expect(selectHookTask('pre-commit', git, '')).toBe('test:precommit');

  git.mockClear();

  expect(selectHookTask('pre-push', git, line('0'.repeat(40)))).toBeUndefined();
  expect(git).not.toHaveBeenCalled();
});

test('new branches use main/master fallback and unreadable default history still runs E2E', () => {
  const git = vi.fn((args: string[]) => {
    if(args[0] === 'merge-base' && args[2] === 'origin/master') {
      return {status: 0, stdout: 'fork\n'};
    }
    if(args[0] === 'log') {
      return files(['README.md']);
    }
    return {status: 128, stdout: ''};
  });

  expect(selectHookTask('pre-push', git, line('a'.repeat(40), '0'.repeat(40)))).toBeUndefined();
  expect(selectHookTask('pre-push', () => ({status: 128, stdout: ''}), line('a'.repeat(40), '0'.repeat(40)))).toBe('test:e2e');
});

test('every pushed ref is inspected and malformed input runs the required E2E gate', () => {
  const git = vi.fn().mockReturnValueOnce(files(['README.md'])).mockReturnValueOnce(files(['style.css']));

  expect(selectHookTask('pre-push', git, line() + line('c'.repeat(40)))).toBe('test:e2e');
  expect(git).toHaveBeenNthCalledWith(1, ['log', '-m', '--format=', '--name-only', '--no-renames', '-z',
    `${'b'.repeat(40)}..${'a'.repeat(40)}`]);
  expect(selectHookTask('pre-push', git, 'unreadable input')).toBe('test:e2e');
  expect(selectHookTask('pre-push', git, '')).toBeUndefined();
});

test('code added then reverted within the pushed range still requires E2E', () => {
  const git = vi.fn((args: string[]) => files(args[0] === 'log' ? ['src/transient.ts', 'README.md'] : ['README.md']));

  expect(selectHookTask('pre-push', git, line())).toBe('test:e2e');
  expect(git).toHaveBeenCalledWith(['log', '-m', '--format=', '--name-only', '--no-renames', '-z',
    `${'b'.repeat(40)}..${'a'.repeat(40)}`]);
});

test('staged JavaScript file type changes are included in the unit gate', () => {
  const git = vi.fn(() => files(['src/type.js']));

  expect(selectHookTask('pre-commit', git, '')).toBe('test:precommit');
  expect(git).toHaveBeenCalledWith(['diff', '--cached', '--name-only', '--no-renames', '--diff-filter=ACMRDT', '-z']);
});

describe('actual Git hooks in isolated repositories', () => {
  const producer = resolve(import.meta.dirname, '..');
  const zero = '0'.repeat(40);
  const code = ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'mts', 'cts'];
  const affected = ['run', 'test:precommit', '--', '--onlyChanged', '--passWithNoTests'];
  let directory: string;
  let repository: string;
  let binaries: string;
  let log: string;
  let parentBefore: string[];
  const environment = () => ({
    ...Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_'))),
    GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_SYSTEM: '/dev/null'
  });
  const git = (...args: string[]): string => {
    const result = spawnSync('git', args, {cwd: repository, encoding: 'utf8', env: environment()});
    if(result.status !== 0) {
      throw new Error(`Fixture git failed with status ${result.status}`);
    }
    return result.stdout.trim();
  };
  const parentPins = (): string[] => {
    const command = (...args: string[]): string => {
      const result = spawnSync('git', args, {cwd: producer, encoding: 'utf8', env: environment()});
      if(result.status !== 0) {
        throw new Error(`Parent inspection failed with status ${result.status}`);
      }
      return result.stdout.trim();
    };
    return [command('rev-parse', 'HEAD'), ...['index', 'config'].map((name) => createHash('sha256')
      .update(readFileSync(resolve(producer, command('rev-parse', '--git-path', name)))).digest('hex'))];
  };
  const write = (name: string, value = 'fixture'): void => {
    mkdirSync(dirname(join(repository, name)), {recursive: true});
    writeFileSync(join(repository, name), value);
  };
  const commit = (): string => {
    git('add', '-A');
    git('commit', '-qm', 'Fixture');
    return git('rev-parse', 'HEAD');
  };
  const run = (kind: 'pre-commit' | 'pre-push', input = '', status = 0) => {
    writeFileSync(log, '');
    const result = spawnSync('/bin/sh', [join(repository, '.githooks', kind)], {cwd: repository,
      encoding: 'utf8', env: {...environment(), GOTHAM_HOOK_LOG: log, GOTHAM_NPM_STATUS: String(status),
        PATH: `${binaries}:${process.env.PATH}`}, input});
    return {args: readFileSync(log, 'utf8').trim().split('\n').filter(Boolean), status: result.status};
  };
  const push = (head: string, base: string): string => `refs/heads/task ${head} refs/heads/task ${base}\n`;

  beforeEach(() => {
    parentBefore = parentPins();
    directory = mkdtempSync(join(tmpdir(), 'gotham-hook-'));
    repository = join(directory, 'repo');
    binaries = join(directory, 'bin');
    log = join(directory, 'npm.log');
    mkdirSync(repository);
    mkdirSync(binaries);
    git('init', '-q', '-b', 'main');

    expect(git('rev-parse', '--show-toplevel')).toBe(realpathSync(repository));
    expect(git('rev-parse', '--absolute-git-dir')).toBe(join(realpathSync(repository), '.git'));

    git('config', 'user.name', 'Fixture');
    git('config', 'user.email', 'fixture@example.test');
    for(const file of ['.githooks/pre-commit', '.githooks/pre-push', 'scripts/git-test-hook.mjs', 'scripts/gitHookPolicy.mjs']) {
      mkdirSync(dirname(join(repository, file)), {recursive: true});
      copyFileSync(join(producer, file), join(repository, file));
    }
    writeFileSync(join(binaries, 'npm'), '#!/bin/sh\nprintf "%s\\n" "$@" >> "$GOTHAM_HOOK_LOG"\nexit "$GOTHAM_NPM_STATUS"\n');
    chmodSync(join(binaries, 'npm'), 0o755);
    write('README.md');
    write('src/seed.js');
    commit();
  });

  afterEach(() => {
    rmSync(directory, {force: true, recursive: true});

    expect(parentPins()).toEqual(parentBefore);
  });

  test('isolates child Git writes from inherited hook repository variables', () => {
    vi.stubEnv('GIT_DIR', join(directory, 'foreign.git'));
    vi.stubEnv('GIT_INDEX_FILE', join(directory, 'foreign.index'));
    try {
      write('src/isolated.ts');
      git('add', '-A');

      expect(run('pre-commit')).toEqual({args: affected, status: 0});
    } finally {
      vi.unstubAllEnvs();
    }
  });

  test.each(code)('forwards affected unit arguments for staged .%s', (extension) => {
    write(`src/new.${extension}`);
    git('add', '-A');

    expect(run('pre-commit')).toEqual({args: affected, status: 0});
  });

  test.each(['README.md', 'package.json', 'image.png', 'style.css', 'file.py', 'index.html'])(
    'does not run units for staged %s', (name) => {
      write(name, 'changed');
      git('add', '-A');

      expect(run('pre-commit')).toEqual({args: [], status: 0});
    }
  );

  test.each(['delete', 'rename'] as const)('counts a staged source %s', (kind) => {
    if(kind === 'delete') {
      git('rm', 'src/seed.js');
    } else {
      git('mv', 'src/seed.js', 'src/seed.txt');
    }

    expect(run('pre-commit')).toEqual({args: affected, status: 0});
  });

  test.each(['src/雪.ts', 'src/quote".ts', 'src/line\nbreak.ts'])('preserves literal staged filename %s', (name) => {
    write(name);
    git('add', '-A');

    expect(run('pre-commit')).toEqual({args: affected, status: 0});
  });

  test('ignores unstaged code', () => {
    write('src/seed.js', 'changed');

    expect(run('pre-commit')).toEqual({args: [], status: 0});
  });

  test('propagates unit failure', () => {
    write('src/seed.js', 'changed');
    git('add', '-A');

    expect(run('pre-commit', '', 17)).toEqual({args: affected, status: 17});
  });

  test.each([...code, 'css'])('runs only E2E for pushed .%s', (extension) => {
    const base = git('rev-parse', 'HEAD');
    write(`src/new.${extension}`);
    const head = commit();

    expect(run('pre-push', push(head, base))).toEqual({args: ['run', 'test:e2e'], status: 0});
  });

  test.each(['README.md', 'package.json', 'image.png', 'index.html'])('runs no suite for pushed %s', (name) => {
    const base = git('rev-parse', 'HEAD');
    write(name, 'changed');

    expect(run('pre-push', push(commit(), base))).toEqual({args: [], status: 0});
  });

  test('includes earlier added and reverted code in the complete pushed range', () => {
    const base = git('rev-parse', 'HEAD');
    write('src/transient.ts');
    commit();
    git('revert', '--no-edit', 'HEAD');
    write('docs/change.md');

    expect(run('pre-push', push(commit(), base))).toEqual({args: ['run', 'test:e2e'], status: 0});
  });

  test('includes a source resolution introduced only by a merge', () => {
    git('checkout', '-qb', 'side');
    write('docs/side.md');
    commit();
    git('checkout', 'main');
    write('docs/main.md');
    const base = commit();
    git('merge', '--no-ff', '--no-commit', 'side');
    write('src/seed.js', 'merge resolution');

    expect(run('pre-push', push(commit(), base))).toEqual({args: ['run', 'test:e2e'], status: 0});
  });

  test('uses the default fork for new branches and fails closed on unreadable history', () => {
    git('update-ref', 'refs/remotes/origin/main', 'HEAD');
    write('docs/new.md');
    const head = commit();

    expect(run('pre-push', push(head, zero))).toEqual({args: [], status: 0});
    expect(run('pre-push', push(head, 'f'.repeat(40)))).toEqual({args: ['run', 'test:e2e'], status: 0});
  });

  test.each(['src/雪.ts', 'src/quote".ts', 'src/line\nbreak.ts'])('preserves literal pushed filename %s', (name) => {
    const base = git('rev-parse', 'HEAD');
    write(name);

    expect(run('pre-push', push(commit(), base))).toEqual({args: ['run', 'test:e2e'], status: 0});
  });

  test('ignores branch deletion', () => {
    const base = git('rev-parse', 'HEAD');

    expect(run('pre-push', push(zero, base))).toEqual({args: [], status: 0});
  });

  test('propagates E2E failure', () => {
    const base = git('rev-parse', 'HEAD');
    write('src/seed.js', 'changed');

    expect(run('pre-push', push(commit(), base), 23)).toEqual({args: ['run', 'test:e2e'], status: 23});
  });
});
