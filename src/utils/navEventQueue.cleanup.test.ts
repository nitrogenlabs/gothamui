import {EventEmitter} from 'node:events';

import {GothamConstants} from '../constants/GothamConstants.js';
import {clear, registerFlux, registerHandler} from './navEventQueue.js';

test('releases only its own queue subscriptions and preserves replay behavior', () => {
  clear();
  const flux = new EventEmitter();
  const external = () => undefined;
  flux.on(GothamConstants.NAV_GOTO, external);
  const unregister = registerFlux(flux);
  flux.emit(GothamConstants.NAV_GOTO, {path: '/early'});
  const paths: string[] = [];
  registerHandler(GothamConstants.NAV_GOTO, ({path}) => paths.push(path));

  expect(paths).toEqual(['/early']);

  unregister();

  expect(flux.listeners(GothamConstants.NAV_GOTO)).toEqual([external]);
  expect(flux.listenerCount(GothamConstants.NAV_FORWARD)).toBe(0);

  flux.emit(GothamConstants.NAV_GOTO, {path: '/later'});

  expect(paths).toEqual(['/early']);

  clear();
});

test('handles invalid sources and capture/replay errors without breaking startup', () => {
  clear();
  registerFlux(undefined)();
  const flux = new EventEmitter();
  const unregister = registerFlux(flux);
  flux.emit(GothamConstants.NAV_BACK, {});

  expect(() => registerHandler(GothamConstants.NAV_BACK, () => {
    throw new Error('replay');
  })).not.toThrow();
  expect(() => flux.emit(GothamConstants.NAV_BACK, {})).not.toThrow();

  registerHandler(GothamConstants.NAV_FORWARD, () => undefined);
  flux.emit(GothamConstants.NAV_FORWARD, {});
  unregister();
  registerFlux({on: () => undefined})();
  clear();
});
