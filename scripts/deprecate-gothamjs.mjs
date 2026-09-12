import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

const {name, version} = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const registry = '--registry=https://registry.npmjs.org';

if(name !== '@nlabs/gothamui') throw new Error('Expected the GothamUI package.');

// Never retire the old package before its replacement can be installed.
const published = JSON.parse(execFileSync('npm', ['view', `${name}@${version}`, 'name', 'version', 'dist.tarball', '--json', registry], {encoding: 'utf8'}));
if(published.name !== name || published.version !== version || !published['dist.tarball']) {
  throw new Error(`Publish and verify ${name}@${version} before deprecating GothamJS.`);
}

execFileSync('npm', [
  'deprecate',
  '@nlabs/gothamjs@*',
  'GothamJS has been renamed to GothamUI. Install @nlabs/gothamui. Migration: https://github.com/nitrogenlabs/gothamui/blob/main/MIGRATION.md',
  registry
], {stdio: 'inherit'});
