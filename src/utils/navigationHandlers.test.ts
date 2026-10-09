import {vi} from 'vitest';

import {navBack, navForward, navGoto, navReplace} from '../views/Gotham/GothamRoot.js';

test('binds back and forward to NavigateFunction deltas', () => {
  const navigate = vi.fn();
  navBack(navigate)();

  expect(navigate).toHaveBeenLastCalledWith(-1);

  navForward(navigate)();

  expect(navigate).toHaveBeenLastCalledWith(1);
});

test('forwards goto options and defaults an omitted path', () => {
  const navigate = vi.fn();
  navGoto(navigate)({params: {state: {source: 'menu'}}, path: '/about'});

  expect(navigate).toHaveBeenLastCalledWith('/about', {state: {source: 'menu'}});

  navGoto(navigate)({});

  expect(navigate).toHaveBeenLastCalledWith('', undefined);
});

test('forces replacement while retaining caller state and defaults', () => {
  const navigate = vi.fn();
  navReplace(navigate)({params: {replace: false, state: {id: 7}}, path: '/support'});

  expect(navigate).toHaveBeenLastCalledWith('/support', {replace: true, state: {id: 7}});

  navReplace(navigate)({});

  expect(navigate).toHaveBeenLastCalledWith('', {replace: true});
});
