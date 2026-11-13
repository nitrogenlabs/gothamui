import {expect, it} from 'vitest';
import {createHash} from 'node:crypto';

import {sourceScope, verifyRepositorySource, verifySourceCustody} from './verify-release-source.mjs';

const digest = (value) => createHash('sha256').update(value).digest('hex');
const fixture = () => {
  const archiveBytes = Buffer.from('immutable archive');
  const content = Buffer.from('reviewed source');
  const files = [{path: 'package.json', sha256: digest(content)}, {path: 'src/main.ts', sha256: digest(content)}];
  const custody = {archiveSha256: digest(archiveBytes), files, name: '@nlabs/gothamui',
    sourceSha: 'a'.repeat(40), version: '1.15.3'};
  const custodyBytes = Buffer.from(JSON.stringify(custody));
  return {archiveBytes, checkoutFiles: files.map(({path}) => path), checkoutRead: () => content, custodyBytes,
    intent: {name: custody.name, sha256: custody.archiveSha256, sourceCustodySha256: digest(custodyBytes),
      sourceSha: custody.sourceSha, version: custody.version}, isAncestor: () => true,
    sourceFiles: files.map(({path}) => path), sourceRead: () => content};
};

it('admits only matching complete source-commit, checkout and immutable-archive custody', () => {
  expect(verifySourceCustody(fixture())).toBe(true);
});

it.each(['archive', 'custody', 'commit-byte', 'checkout-byte', 'missing-file', 'extra-source', 'extra-checkout', 'ancestor', 'commit-id'])
('refuses %s drift before publication', (fault) => {
  const input = fixture();
  if(fault === 'archive') input.archiveBytes = Buffer.from('changed');
  if(fault === 'custody') input.custodyBytes = Buffer.from('{}');
  if(fault === 'commit-byte') input.sourceRead = () => Buffer.from('changed');
  if(fault === 'checkout-byte') input.checkoutRead = () => Buffer.from('changed');
  if(fault === 'missing-file') input.sourceFiles = ['package.json'];
  if(fault === 'extra-source') input.sourceFiles.push('src/forgotten.ts');
  if(fault === 'extra-checkout') input.checkoutFiles.push('src/forgotten.ts');
  if(fault === 'ancestor') input.isAncestor = () => false;
  if(fault === 'commit-id') input.intent.sourceSha = '--bad';

  expect(() => verifySourceCustody(input)).toThrow();
});

it.each(['duplicate', 'traversal', 'foreign-package', 'foreign-version', 'unknown-key'])
('refuses structurally invalid %s custody even when the custody digest matches', (fault) => {
  const input = fixture();
  const custody = JSON.parse(input.custodyBytes);
  if(fault === 'duplicate') custody.files.push(custody.files[0]);
  if(fault === 'traversal') custody.files[0].path = '../outside';
  if(fault === 'foreign-package') custody.name = '@nlabs/foreign';
  if(fault === 'foreign-version') custody.version = '1.15.2';
  if(fault === 'unknown-key') custody.extra = true;
  input.custodyBytes = Buffer.from(JSON.stringify(custody));
  input.intent.sourceCustodySha256 = digest(input.custodyBytes);

  expect(() => verifySourceCustody(input)).toThrow();
});


it('uses the actual repository admission adapter with only read-only Git and regular files', () => {
  const input = fixture();
  const calls = [];
  const ports = {
    execFileSync: (command, args) => {
      calls.push([command, ...args]);
      if(args[0] === 'ls-files' || args[0] === 'ls-tree') return Buffer.from(input.sourceFiles.join('\0') + '\0');
      if(args[0] === 'show') return input.sourceRead();
      return Buffer.from('');
    },
    lstatSync: () => ({isFile: () => true, isSymbolicLink: () => false}),
    readFileSync: (path) => path === 'release/archive.tgz' ? input.archiveBytes
      : path === 'release/source.json' ? input.custodyBytes : input.checkoutRead()
  };
  expect(verifyRepositorySource({archivePath: 'release/archive.tgz', custodyPath: 'release/source.json',
    intent: input.intent}, ports)).toBe(true);
  expect(calls.map((call) => call[1])).toEqual(['ls-files', 'ls-tree', 'merge-base', 'show', 'show']);

});

it('includes all compile configuration and source scopes while excluding release metadata', () => {
  expect(['src/main.ts', 'styles/tailwind.css', 'tests/chat-declarations/consumer.tsx', 'tsconfig.build.json',
    'package-lock.json', 'lex.config.mjs'].every(sourceScope)).toBe(true);
  expect(sourceScope('publication/intent.json')).toBe(false);
});

it('admits a tracked source asset whose filename contains spaces', () => {
  const input = fixture();
  const custody = JSON.parse(input.custodyBytes);
  custody.files[1].path = 'src/icons/Dual Ring-1s-100px.svg';
  input.sourceFiles = custody.files.map(({path}) => path);
  input.checkoutFiles = [...input.sourceFiles];
  input.custodyBytes = Buffer.from(JSON.stringify(custody));
  input.intent.sourceCustodySha256 = digest(input.custodyBytes);

  expect(verifySourceCustody(input)).toBe(true);
});


it('rejects a symlink archive at the filesystem boundary before reading it or invoking Git', () => {
  const input = fixture();
  const ports = {lstatSync: () => ({isFile: () => true, isSymbolicLink: () => true})};

  expect(() => verifyRepositorySource({archivePath: 'release/archive.tgz', custodyPath: 'release/source.json',
    intent: input.intent}, ports)).toThrow();
});
