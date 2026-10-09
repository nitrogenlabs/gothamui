import i18n from 'i18next';

import {Config} from './appConfig.js';

test('retains supplied translation engines by identity across remount and replacement', async () => {
  const first = i18n.createInstance();
  await first.init({lng: 'en', resources: {en: {translation: {greeting: 'Hello'}}}});
  const second = i18n.createInstance();
  await second.init({lng: 'es', resources: {es: {translation: {greeting: 'Hola'}}}});
  Config.set({app: {name: 'engine-test'}, i18n: first});

  expect(() => Config.set({app: {title: 'Updated'}, i18n: first})).not.toThrow();
  expect(Config.get('i18n')).toBe(first);
  expect(() => Config.set({i18n: second})).not.toThrow();
  expect(Config.get('i18n')).toBe(second);
  expect(first.t('greeting')).toBe('Hello');
  expect(second.t('greeting')).toBe('Hola');
  expect(Config.get('app.name')).toBe('engine-test');
  expect(Config.get('app.title')).toBe('Updated');
});

test('preserves an engine when omitted and clears it only when explicitly supplied', () => {
  const engine = i18n.createInstance();
  Config.set({i18n: engine});
  Config.set({app: {name: 'omitted'}});

  expect(Config.get('i18n')).toBe(engine);

  Config.set({i18n: undefined});

  expect(Config.get('i18n')).toBeUndefined();
  expect(Config.get(['app', 'name'])).toBe('omitted');
  expect(Config.get('missing', 'fallback')).toBe('fallback');
});

test.each([undefined, {}, {env: {}}, {env: {NODE_ENV: 'production'}}])('resolves environment with browser or node process binding', (processValue) => {
  vi.stubGlobal('process', processValue);
  const environment = Config.get('environment');
  vi.unstubAllGlobals();

  expect(environment).toBe(processValue?.env?.NODE_ENV || 'development');
});
