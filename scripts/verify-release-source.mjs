import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {lstatSync, readFileSync} from 'node:fs';

const digest = (value) => createHash('sha256').update(value).digest('hex');
const commitPattern = /^[a-f0-9]{40}$/u;
const hashPattern = /^[a-f0-9]{64}$/u;
const safePath = (path) => typeof path === 'string' && !path.includes('\0') && !path.includes('\\')
  && !path.startsWith('/') && path.split('/').every((part) => part && part !== '.' && part !== '..');
export const sourceScope = (path) => path.startsWith('src/') || path.startsWith('styles/')
  || path.startsWith('tests/chat-declarations/') || /^tsconfig(?:\.[a-z]+)?\.json$/u.test(path)
  || ['package.json', 'package-lock.json', 'lex.config.mjs'].includes(path);

/** A manifest cannot omit a tracked build input or substitute current bytes for the reviewed commit. */
export const verifySourceCustody = (input) => {
  const {archiveBytes, checkoutFiles, checkoutRead, custodyBytes, intent, isAncestor, sourceFiles, sourceRead} = input;
  assert.match(intent.sourceSha, commitPattern);
  assert.match(intent.sha256, hashPattern);
  assert.match(intent.sourceCustodySha256, hashPattern);
  assert.equal(digest(custodyBytes), intent.sourceCustodySha256);
  const custody = JSON.parse(custodyBytes);
  assert.deepEqual(Object.keys(custody).sort(), ['archiveSha256', 'files', 'name', 'sourceSha', 'version']);
  assert.equal(custody.name, intent.name);
  assert.equal(custody.version, intent.version);
  assert.equal(custody.sourceSha, intent.sourceSha);
  assert.equal(custody.archiveSha256, intent.sha256);
  assert.equal(digest(archiveBytes), intent.sha256);
  assert.equal(isAncestor(intent.sourceSha), true);
  assert.ok(Array.isArray(custody.files) && custody.files.length > 0);
  const paths = custody.files.map((entry) => {
    assert.deepEqual(Object.keys(entry).sort(), ['path', 'sha256']);
    assert.ok(safePath(entry.path) && sourceScope(entry.path));
    assert.match(entry.sha256, hashPattern);
    return entry.path;
  });
  assert.equal(new Set(paths).size, paths.length);
  assert.deepEqual([...paths].sort(), sourceFiles.filter(sourceScope).sort());
  assert.deepEqual([...paths].sort(), checkoutFiles.filter(sourceScope).sort());
  for(const entry of custody.files) {
    assert.equal(digest(sourceRead(entry.path)), entry.sha256, 'Reviewed commit bytes differ.');
    assert.equal(digest(checkoutRead(entry.path)), entry.sha256, 'Checkout bytes differ.');
  }
  return true;
};

/** CI adapter: no network, package installation, source rebuild or publication. */
export const verifyRepositorySource = ({archivePath, custodyPath, intent}, ports = {execFileSync, lstatSync, readFileSync}) => {
  assert.match(intent.sourceSha, commitPattern);
  const read = (path) => {
    assert.ok(safePath(path));
    const stat = ports.lstatSync(path);
    assert.ok(stat.isFile() && !stat.isSymbolicLink());
    return ports.readFileSync(path);
  };
  const git = (args) => ports.execFileSync('git', args, {maxBuffer: 16 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe']});
  const paths = (value) => value.toString().split('\0').filter(Boolean);
  return verifySourceCustody({archiveBytes: read(archivePath),
    checkoutFiles: paths(git(['ls-files', '-z'])), checkoutRead: read, custodyBytes: read(custodyPath), intent,
    isAncestor: (sourceSha) => {
      git(['merge-base', '--is-ancestor', sourceSha, 'HEAD']);
      return true;
    },
    sourceFiles: paths(git(['ls-tree', '-r', '--name-only', '-z', intent.sourceSha])),
    sourceRead: (path) => git(['show', `${intent.sourceSha}:${path}`])});
};
