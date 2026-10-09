import {vi} from 'vitest';

import {resolveRouteAnalytics} from './routeAnalytics.js';

test('keeps object handles and deepest metadata compatible', () => {
  const parent = {route: '/parent', title: 'Parent', viewId: 'parent'};
  const child = {route: '/child', title: 'Child', viewId: 'child'};

  expect(resolveRouteAnalytics([{handle: {analytics: parent}}], '/raw')).toEqual(parent);
  expect(resolveRouteAnalytics([{handle: {analytics: parent}}, {handle: {analytics: child}}], '/raw')).toEqual(child);
});

test('passes raw pathname and falls back past undefined callbacks and absent handles', () => {
  const parent = {route: '/support', title: 'Support', viewId: '/support'};
  const callback = vi.fn(() => undefined);

  expect(resolveRouteAnalytics([{handle: {analytics: parent}}, {handle: {analytics: callback}}, {}], '/contact')).toEqual(parent);
  expect(callback).toHaveBeenCalledWith('/contact');
  expect(resolveRouteAnalytics([], '/unknown')).toBeUndefined();
  expect(resolveRouteAnalytics([{}, {handle: {}}], '/unknown')).toBeUndefined();
});

test('evaluates deepest callback and stops before evaluating the parent', () => {
  const parent = vi.fn(() => ({viewId: 'parent'}));
  const child = vi.fn((pathname: string) => ({route: pathname, viewId: pathname}));

  expect(resolveRouteAnalytics([{handle: {analytics: parent}}, {handle: {analytics: child}}], '/projects/a%2Fb')).toEqual({route: '/projects/a%2Fb', viewId: '/projects/a%2Fb'});
  expect(parent).not.toHaveBeenCalled();
});

test('does not swallow metadata callback failures', () => {
  expect(() => resolveRouteAnalytics([{handle: {analytics: () => {
    throw new Error('metadata');
  }}}], '/')).toThrow('metadata');
});
