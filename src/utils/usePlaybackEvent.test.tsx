import {renderHook} from '@testing-library/react';
import {expect, test, vi} from 'vitest';

import {usePlaybackEvent} from './usePlaybackEvent.js';

// eslint-disable-next-line react-hooks/rules-of-hooks -- renderHook executes this wrapper during React render.
const useListener = ({callback}: {callback: (value: number) => number}) => usePlaybackEvent(callback);

test('retains callback identity while invoking the latest event listener', () => {
  const first = vi.fn((value: number) => value + 1);
  const next = vi.fn((value: number) => value + 2);
  const {rerender, result} = renderHook(useListener, {initialProps: {callback: first}});
  const stable = result.current;

  expect(stable(1)).toBe(2);

  rerender({callback: next});

  expect(result.current).toBe(stable);
  expect(stable(1)).toBe(3);
  expect(next).toHaveBeenCalledWith(1);
});
