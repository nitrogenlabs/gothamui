import {spawnSync} from 'node:child_process';
import {existsSync, realpathSync} from 'node:fs';

if(existsSync('.githooks/pre-commit') && existsSync('.githooks/pre-push')) {
  const root = spawnSync('git', ['rev-parse', '--show-toplevel'], {encoding: 'utf8'});
  if(root.status === 0 && realpathSync(root.stdout.trim()) === realpathSync(process.cwd())) {
    const configured = spawnSync('git', ['config', '--local', 'core.hooksPath', '.githooks'], {stdio: 'inherit'});
    process.exit(configured.status ?? 1);
  }
}
