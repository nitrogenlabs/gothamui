import {expect, test} from 'vitest';

import {renderDocumentHead} from './renderDocumentHead.js';

test('escaped head markup round-trips hostile input and keeps a single inert script', () => {
  const text = 'A & <B> "quoted" \'single\'';
  const value = {text: '</script><script>throw 1</script>\u2028\u2029'};
  const markup = renderDocumentHead({metadata: {canonicalUrl: text, jsonLd: [{id: 'fixture-schema', value}], meta: [{content: text, name: 'description'}, {content: text, property: 'og:title'}], title: text}, owner: 'fixture'});
  const doc = new DOMParser().parseFromString(`<html><head>${markup}</head></html>`, 'text/html');

  expect(doc.title).toBe(text);
  expect(doc.querySelector('link')?.getAttribute('href')).toBe(text);
  expect(doc.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(text);
  expect(doc.querySelectorAll('script')).toHaveLength(1);
  expect(doc.querySelector('#fixture-schema')?.getAttribute('data-gotham-head-owner')).toBe('fixture');
  expect(JSON.parse(doc.querySelector('script')?.textContent ?? '')).toEqual(value);
});

test('renders deterministic descriptor order and preserves empty versus omitted values', () => {
  expect(renderDocumentHead({metadata: {}, owner: 'fixture'})).toBe('');

  const input = {metadata: {canonicalUrl: '', meta: [{content: '', property: 'empty'}], title: ''}, owner: 'fixture'};
  const first = renderDocumentHead(input);

  expect(first).toBe(renderDocumentHead(input));
  expect(first).toContain('<title></title>');
  expect(first).toContain('href=""');
  expect(first).toContain('content=""');
});
