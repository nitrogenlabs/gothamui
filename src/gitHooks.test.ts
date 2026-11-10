import {expect, test, vi} from '@nlabs/lex/test-vitest';

import {selectHookTask} from '../scripts/gitHookPolicy.mjs';

const files = (paths: string[]) => ({status: 0, stdout: `${paths.join('\0')}\0`});
const line = (local = 'a'.repeat(40), remote = 'b'.repeat(40)) => `refs/heads/topic ${local} refs/heads/topic ${remote}\n`;

test.each(['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'mts', 'cts'])('staged .%s runs only unit tests', (extension) => {
  const git = vi.fn(() => files([`src/雪\nname.${extension}`]));

  expect(selectHookTask('pre-commit', git, '')).toBe('test:precommit');
  expect(git).toHaveBeenCalledWith(['diff', '--cached', '--name-only', '--no-renames', '--diff-filter=ACMRD', '-z']);
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
  expect(git).toHaveBeenCalledWith(['log', '--format=', '--name-only', '--no-renames', '-z', `fork..${'a'.repeat(40)}`]);
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
  expect(selectHookTask('pre-push', git, 'unreadable input')).toBe('test:e2e');
  expect(selectHookTask('pre-push', git, '')).toBeUndefined();
});

test('code added then reverted within the pushed range still requires E2E', () => {
  const git = vi.fn((args: string[]) => files(args[0] === 'log' ? ['src/transient.ts', 'README.md'] : ['README.md']));

  expect(selectHookTask('pre-push', git, line())).toBe('test:e2e');
  expect(git).toHaveBeenCalledWith(['log', '--format=', '--name-only', '--no-renames', '-z',
    `${'b'.repeat(40)}..${'a'.repeat(40)}`]);
});
