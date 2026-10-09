import {expect, test, vi} from 'vitest';

import {prepareHeadMetadata} from './prepareHeadMetadata.js';

import type {DocumentHeadMetadata, JsonValue} from './types.js';

test('snapshots exact empty/optional values and distinct meta identities', () => {
  const meta = [{content: '', name: 'title'}, {content: 'OG', property: 'title'}];
  const prepared = prepareHeadMetadata('fixture', {canonicalUrl: '', meta, title: ''});
  meta[0].content = 'later';

  expect(prepared.title).toBe('');
  expect(prepared.canonicalUrl).toBe('');
  expect(prepared.meta[0].content).toBe('');
  expect(prepared.meta).toHaveLength(2);
  expect(prepareHeadMetadata('fixture', {}).jsonLd).toEqual([]);
});

test('serializes JSON values without invoking toJSON or losing special text', () => {
  const value = {array: [null, true, false, 3, 'text'], text: '</script>\u2028\u2029'};
  const prepared = prepareHeadMetadata('fixture', {jsonLd: [{id: 'schema', value}]});

  expect(JSON.parse(prepared.jsonLd[0].text)).toEqual(value);
  expect(prepared.jsonLd[0].text).not.toContain('<');
  expect(prepared.jsonLd[0].text).not.toContain('\u2028');
  expect(prepared.jsonLd[0].text).not.toContain('\u2029');

  const shared = {name: 'same'};

  expect(JSON.parse(prepareHeadMetadata('fixture', {jsonLd: [{id: 'shared', value: [shared, shared]}]}).jsonLd[0].text)).toEqual([shared, shared]);
  expect(JSON.parse(prepareHeadMetadata('fixture', {jsonLd: [{id: 'null-prototype', value: {__proto__: null, valid: true}}]}).jsonLd[0].text)).toEqual({valid: true});
});

test.each([undefined, () => 1, BigInt(1), Symbol('x'), NaN, Infinity, -Infinity, new Date(), new Array(2), {bad: undefined}])('rejects non-JSON data %s', (value) => {
  expect(() => prepareHeadMetadata('fixture', {jsonLd: [{id: 'schema', value: value as JsonValue}]})).toThrow();
});

test('rejects cycles, accessors and symbol keys', () => {
  const cycle: Record<string, unknown> = {};
  cycle.self = cycle;
  let invoked = false;
  const getter = {get secret() {
    invoked = true;
    return 'secret';
  }};
  for(const value of [cycle, getter, {[Symbol('key')]: 'hidden'}]) {
    expect(() => prepareHeadMetadata('fixture', {jsonLd: [{id: 'schema', value: value as JsonValue}]})).toThrow();
  }

  expect(invoked).toBe(false);
});

test.each([
  {title: 1}, {canonicalUrl: null}, {meta: {}}, {jsonLd: {}},
  {meta: [null]}, {meta: [{content: 'x', name: ' '}]}, {meta: [{content: 1, property: 'x'}]},
  {meta: [{content: 'z', name: 'x', property: 'y'}]}, {meta: [{content: 'x'}]},
  {meta: [{content: '1', name: 'x'}, {content: '2', name: 'x'}]},
  {jsonLd: [null]}, {jsonLd: [{id: ' ', value: {}}]},
  {jsonLd: [{id: 'x', value: {}}, {id: 'x', value: {}}]}
])('rejects invalid descriptor snapshot %s', (metadata) => {
  expect(() => prepareHeadMetadata('fixture', metadata as DocumentHeadMetadata)).toThrow();
});

test.each(['', ' ', null, 1])('rejects invalid owner %s', (owner) => {
  expect(() => prepareHeadMetadata(owner as string, {})).toThrow();
});

test('rejects array index accessors without invoking them', () => {
  let invoked = false;
  const value: string[] = [];
  Object.defineProperty(value, '0', {get: () => {
    invoked = true;
    return 'private';
  }});

  expect(() => prepareHeadMetadata('fixture', {jsonLd: [{id: 'schema', value}]})).toThrow();
  expect(invoked).toBe(false);
});

test.each(['method', 'getter'])('rejects array toJSON %s without invoking it', (kind) => {
  const invoked = vi.fn(() => 'changed');
  const value = ['original'];
  Object.defineProperty(value, 'toJSON', kind === 'method' ? {value: invoked} : {get: invoked});

  expect(() => prepareHeadMetadata('fixture', {jsonLd: [{id: 'schema', value}]})).toThrow();
  expect(invoked).not.toHaveBeenCalled();
});

test.each(['method', 'getter'])('rejects inherited array toJSON %s without invoking it', (kind) => {
  const invoked = vi.fn(() => ({overridden: true}));
  const prototype = Object.create(Array.prototype);
  Object.defineProperty(prototype, 'toJSON', kind === 'method' ? {value: invoked} : {get: invoked});
  const value = ['original'];
  Object.setPrototypeOf(value, prototype);

  expect(() => prepareHeadMetadata('fixture', {jsonLd: [{id: 'schema', value}]})).toThrow();
  expect(invoked).not.toHaveBeenCalled();
});

test('preserves non-callable toJSON JSON keys and inherited array values', () => {
  const value = ['original'];
  Object.setPrototypeOf(value, Object.create(Array.prototype, {toJSON: {value: 'non-callable'}}));
  const object = {toJSON: 'ordinary JSON field'};
  const snapshot = prepareHeadMetadata('fixture', {jsonLd: [{id: 'array', value}, {id: 'object', value: object}]});

  expect(JSON.parse(snapshot.jsonLd[0].text)).toEqual(['original']);
  expect(JSON.parse(snapshot.jsonLd[1].text)).toEqual(object);
});
