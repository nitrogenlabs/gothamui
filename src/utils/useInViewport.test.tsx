import {act, renderHook} from '@testing-library/react';
import {afterEach, expect, test, vi} from 'vitest';

import {useInViewport} from './useInViewport.js';

// eslint-disable-next-line react-hooks/rules-of-hooks -- renderHook executes this wrapper during React render.
const useVisibility = ({element}: {element: HTMLElement | null}) => useInViewport(element);

afterEach(() => vi.unstubAllGlobals());

test('observes replacement elements, disconnects old observers, and falls back without the API', () => {
  const disconnect = vi.fn();
  const observe = vi.fn();
  let changed: (entries: {isIntersecting: boolean}[]) => void = () => {};
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: typeof changed) {
      changed = callback;
    }
    disconnect() {
      disconnect();
    }
    observe(element: Element) {
      observe(element);
    }
  });
  const {rerender, result, unmount} = renderHook(useVisibility, {initialProps: {element: null as HTMLElement | null}});

  expect(result.current).toBe(false);

  const first = document.createElement('video');
  rerender({element: first});

  expect(observe).toHaveBeenCalledWith(first);

  act(() => changed([{isIntersecting: true}]));

  expect(result.current).toBe(true);

  act(() => changed([]));

  expect(result.current).toBe(false);

  rerender({element: document.createElement('video')});

  expect(disconnect).toHaveBeenCalledOnce();

  unmount();

  expect(disconnect).toHaveBeenCalledTimes(2);

  vi.stubGlobal('IntersectionObserver', undefined);
  const fallback = renderHook(useVisibility, {initialProps: {element: first}});

  expect(fallback.result.current).toBe(true);
});
