import {renderHook} from '@testing-library/react';

import {useBreakpoint} from './useBreakpoint.js';

test('keeps breakpoint helpers stable across unchanged parent renders', () => {
  const {result, rerender} = renderHook(useBreakpoint);
  const initial = result.current;

  expect(initial.at(initial.value())).toBe(true);

  rerender();

  expect(result.current).toBe(initial);
});
