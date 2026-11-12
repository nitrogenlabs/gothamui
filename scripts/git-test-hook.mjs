import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

import {selectHookTask} from './gitHookPolicy.mjs';

const kind = process.argv[2];
if(kind !== 'pre-commit' && kind !== 'pre-push') {
  process.exit(2);
}
const task = selectHookTask(kind, (args) => {
  const result = spawnSync('git', args, {encoding: 'utf8'});
  return {status: result.status, stdout: result.stdout ?? ''};
}, kind === 'pre-push' ? readFileSync(0, 'utf8') : '');
if(task) {
  const args = ['run', task, ...(kind === 'pre-commit' ? ['--', '--onlyChanged', '--passWithNoTests'] : [])];
  const result = spawnSync('npm', args, {stdio: 'inherit'});
  if(result.error) {
    process.stderr.write('Required Git hook test command could not be launched.\n');
  }
  process.exit(result.status ?? 1);
}
