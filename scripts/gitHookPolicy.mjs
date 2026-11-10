const zero = '0'.repeat(40);
const unitFiles = /\.(?:ts|tsx|js|jsx|mjs|cjs|mts|cts)$/;
const e2eFiles = /\.(?:ts|tsx|js|jsx|mjs|cjs|mts|cts|css)$/;

/**
 * @param {'pre-commit'|'pre-push'} kind
 * @param {(args: string[]) => {status: number|null, stdout: string}} git
 * @param {string} input
 * @returns {'test:precommit'|'test:e2e'|undefined}
 */
export const selectHookTask = (kind, git, input) => {
  if(kind === 'pre-commit') {
    const changed = git(['diff', '--cached', '--name-only', '--no-renames', '--diff-filter=ACMRDT', '-z']);
    return changed.status !== 0 || changed.stdout.split('\0').some((name) => unitFiles.test(name))
      ? 'test:precommit' : undefined;
  }
  for(const line of input.split('\n').filter(Boolean)) {
    const fields = line.trim().split(/\s+/);
    if(fields.length !== 4) {
      return 'test:e2e';
    }
    const [, local, , remote] = fields;
    if(local === zero) {
      continue;
    }
    let base = remote;
    if(remote === zero) {
      const symbolic = git(['symbolic-ref', 'refs/remotes/origin/HEAD']);
      const defaults = [symbolic.status === 0 ? symbolic.stdout.trim() : '', 'origin/main', 'origin/master']
        .filter(Boolean);
      base = '';
      for(const branch of defaults) {
        const fork = git(['merge-base', local, branch]);
        if(fork.status === 0 && fork.stdout.trim()) {
          base = fork.stdout.trim();
          break;
        }
      }
      if(!base) {
        return 'test:e2e';
      }
    }
    const changed = git(['log', '-m', '--format=', '--name-only', '--no-renames', '-z', `${base}..${local}`]);
    if(changed.status !== 0 || changed.stdout.split('\0').some((name) => e2eFiles.test(name))) {
      return 'test:e2e';
    }
  }
  return undefined;
};
