import {beforeEach, expect, test} from 'vitest';

import {acquireDocumentHead} from './documentHeadRegistry.js';
import {prepareHeadMetadata} from './prepareHeadMetadata.js';

import type {DocumentHeadCleanup, DocumentHeadMetadata} from './types.js';

const acquire = (owner: string, metadata: DocumentHeadMetadata, cleanup?: DocumentHeadCleanup) =>
  acquireDocumentHead(document, owner, prepareHeadMetadata(owner, metadata), {cleanup});

beforeEach(() => {
  document.head.innerHTML = '<title>Base</title><meta name="description" data-other="keep"><link rel="canonical">';
});

test('restores borrowed node identities and attribute absence, removes created nodes', () => {
  const meta = document.head.querySelector('meta');
  const canonical = document.head.querySelector('link');
  const lease = acquire('A', {canonicalUrl: '/A', meta: [{content: 'A', name: 'description'}, {content: '', property: 'og:title'}], title: ''});

  expect(document.title).toBe('');
  expect(meta?.getAttribute('content')).toBe('A');
  expect(meta?.getAttribute('data-other')).toBe('keep');

  lease.release();
  lease.release();

  expect(document.title).toBe('Base');
  expect(document.head.querySelector('meta')).toBe(meta);
  expect(document.head.querySelector('link')).toBe(canonical);
  expect(meta?.hasAttribute('content')).toBe(false);
  expect(canonical?.hasAttribute('href')).toBe(false);
  expect(document.head.querySelector('[property="og:title"]')).toBeNull();
});

test('ignores missing optional tags while title still applies', () => {
  const lease = acquireDocumentHead(document, 'A', prepareHeadMetadata('A', {canonicalUrl: '/A', meta: [{content: 'A', property: 'new'}], title: 'A'}), {missingTags: 'ignore'});

  expect(document.head.querySelector('[property="new"]')).toBeNull();
  expect(document.head.querySelector('link')?.getAttribute('href')).toBe('/A');

  lease.release();
  document.head.innerHTML = '';
  const missing = acquireDocumentHead(document, 'A', prepareHeadMetadata('A', {canonicalUrl: '/A', title: 'A'}), {missingTags: 'ignore'});

  expect(document.title).toBe('A');
  expect(document.head.querySelector('link')).toBeNull();

  missing.release();

  expect(document.head.querySelector('title')).toBeNull();
});

test.each(['A', 'B'])('overlapping owners released %s first do not promote on update', (first) => {
  const a = acquire('A', {meta: [{content: 'A', name: 'description'}], title: 'A'});
  const b = acquire('B', {meta: [{content: 'B', name: 'description'}], title: 'B'});
  a.update(prepareHeadMetadata('A', {meta: [{content: 'A2', name: 'description'}], title: 'A2'}), {});

  expect(document.title).toBe('B');

  if(first === 'B') {
    b.release();

    expect(document.title).toBe('A2');

    a.release();
  } else {
    a.release();

    expect(document.title).toBe('B');

    b.release();
  }

  expect(document.title).toBe('Base');
  expect(document.querySelector('meta')?.hasAttribute('content')).toBe(false);
});

test('retains metadata when omitted or unmounted, while active lower owner still wins', () => {
  const a = acquire('A', {title: 'A'});
  const b = acquire('B', {title: 'B'}, {metadata: 'retain'});
  b.release();

  expect(document.title).toBe('A');

  a.release();

  expect(document.title).toBe('Base');

  const retained = acquire('retain', {meta: [{content: 'new', property: 'new'}], title: 'Retained'}, {metadata: 'retain'});
  retained.update(prepareHeadMetadata('retain', {}), {cleanup: {metadata: 'retain'}});

  expect(document.title).toBe('Retained');

  retained.release();

  expect(document.querySelector('[property="new"]')?.getAttribute('content')).toBe('new');
});

test.each(['restore', 'retain', 'remove'] as const)('JSON-LD %s affects explicit owned ID only', (policy) => {
  const script = document.createElement('script');
  script.id = 'route';
  script.type = 'application/ld+json';
  script.textContent = '{"original":true}';
  document.head.append(script);
  const foreign = document.createElement('script');
  foreign.type = 'application/ld+json';
  foreign.textContent = '{"foreign":true}';
  document.head.append(foreign);
  const lease = acquire('A', {jsonLd: [{id: 'route', value: {route: true}}]}, {structuredData: policy});

  expect(document.getElementById('route')).toBe(script);
  expect(JSON.parse(script.textContent ?? '')).toEqual({route: true});

  lease.release();

  expect(foreign.isConnected).toBe(true);

  if(policy === 'remove') {
    expect(script.isConnected).toBe(false);
  } else if(policy === 'restore') {
    expect(script.textContent).toBe('{"original":true}');
    expect(script.hasAttribute('data-gotham-head-owner')).toBe(false);
  } else {
    expect(JSON.parse(script.textContent ?? '')).toEqual({route: true});
  }
});

test('creates and releases own JSON-LD without duplicate scripts', () => {
  const lease = acquire('A', {jsonLd: [{id: 'new', value: [null, true]}]});
  lease.update(prepareHeadMetadata('A', {jsonLd: [{id: 'new', value: {updated: true}}]}), {});

  expect(document.querySelectorAll('#new')).toHaveLength(1);

  lease.release();

  expect(document.getElementById('new')).toBeNull();
});

test.each(['wrong-type', 'wrong-owner', 'body-collision', 'duplicate-id'])('preflights %s before any changes', (kind) => {
  const element = document.createElement(kind === 'wrong-type' ? 'div' : 'script');
  element.id = 'collision';
  element.setAttribute('type', 'application/ld+json');
  if(kind === 'wrong-owner') {
    element.setAttribute('data-gotham-head-owner', 'other');
  }
  (kind === 'body-collision' ? document.body : document.head).append(element);
  if(kind === 'duplicate-id') {
    document.head.append(element.cloneNode());
  }

  expect(() => acquire('A', {jsonLd: [{id: 'collision', value: {}}], meta: [{content: 'changed', name: 'description'}], title: 'Changed'})).toThrow();
  expect(document.title).toBe('Base');
  expect(document.querySelector('meta')?.hasAttribute('content')).toBe(false);

  element.remove();
  document.querySelectorAll('#collision').forEach((node) => node.remove());
});

test('duplicate owner and invalid update preserve active lease and its order', () => {
  const a = acquire('A', {title: 'A'});

  expect(() => acquire('A', {title: 'Duplicate'})).toThrow();

  const wrong = document.createElement('div');
  wrong.id = 'wrong';
  document.head.append(wrong);

  expect(() => a.update(prepareHeadMetadata('A', {jsonLd: [{id: 'wrong', value: {}}], title: 'Changed'}), {})).toThrow();
  expect(document.title).toBe('A');

  a.release();

  expect(document.title).toBe('Base');
  expect(() => a.update(prepareHeadMetadata('A', {title: 'later'}), {})).toThrow();
});

test('cleanup preserves external values and replaced nodes', () => {
  const lease = acquire('A', {canonicalUrl: '/A', jsonLd: [{id: 'route', value: {}}], meta: [{content: 'A', name: 'description'}], title: 'A'}, {structuredData: 'remove'});
  document.title = 'External';
  document.querySelector('meta')?.setAttribute('content', 'External');
  document.querySelector('link')?.setAttribute('href', '/external');
  document.getElementById('route')!.textContent = '{"external":true}';
  lease.release();

  expect(document.title).toBe('External');
  expect(document.querySelector('meta')?.getAttribute('content')).toBe('External');
  expect(document.querySelector('link')?.getAttribute('href')).toBe('/external');
  expect(document.getElementById('route')?.textContent).toBe('{"external":true}');
});

test('next update resolves replacements and never writes detached nodes', () => {
  const lease = acquire('A', {jsonLd: [{id: 'route', value: {}}], meta: [{content: 'A', name: 'description'}], title: 'A'});
  const old = document.querySelector('meta')!;
  const next = document.createElement('meta');
  next.setAttribute('name', 'description');
  next.setAttribute('content', 'external');
  old.replaceWith(next);
  lease.update(prepareHeadMetadata('A', {meta: [{content: 'B', name: 'description'}], title: 'B'}), {});

  expect(next.getAttribute('content')).toBe('B');
  expect(old.getAttribute('content')).toBe('A');

  lease.release();

  expect(next.getAttribute('content')).toBe('external');
});

test('external script replacement is preserved on cleanup and validated on update', () => {
  const lease = acquire('A', {jsonLd: [{id: 'route', value: {}}], title: 'A'});
  const replacement = document.createElement('div');
  replacement.id = 'route';
  document.getElementById('route')!.replaceWith(replacement);

  expect(() => lease.update(prepareHeadMetadata('A', {jsonLd: [{id: 'route', value: {new: true}}], title: 'B'}), {})).toThrow();
  expect(document.title).toBe('A');

  lease.release();

  expect(replacement.isConnected).toBe(true);
});

test('keeps preexisting duplicates and resolves removed metadata on update', () => {
  const original = document.querySelector('meta')!;
  const duplicate = original.cloneNode(true) as HTMLElement;
  document.head.append(duplicate);
  const lease = acquire('A', {meta: [{content: 'A', name: 'description'}]});

  expect(duplicate.hasAttribute('content')).toBe(false);

  original.remove();
  duplicate.remove();
  lease.update(prepareHeadMetadata('A', {meta: [{content: 'B', name: 'description'}]}), {});

  expect(document.querySelector('meta')?.getAttribute('content')).toBe('B');

  lease.release();

  expect(document.querySelector('meta')).toBeNull();
});

test('marks created metadata and preserves external attribute edits on cleanup', () => {
  const lease = acquire('A', {meta: [{content: 'A', property: 'new'}]});
  const node = document.querySelector('[property="new"]')!;

  expect(node.getAttribute('data-gotham-head-owner')).toBe('A');

  node.setAttribute('data-external', 'keep');
  lease.release();

  expect(node.isConnected).toBe(true);
});
