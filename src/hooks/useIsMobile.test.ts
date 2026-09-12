import {act, renderHook} from '@testing-library/react';

import {useIsMobile} from './useIsMobile.js';

test('reads the initial media state and responds only to breakpoint changes', () => {
  const original = window.matchMedia;
  let matches = true;
  const listeners = new Set<() => void>();
  window.matchMedia = vi.fn(() => ({
    addEventListener: (_event: string, listener: () => void) => {
      listeners.add(listener);
    },
    get matches() {
      return matches;
    },
    removeEventListener: (_event: string, listener: () => void) => {
      listeners.delete(listener);
    }
  })) as unknown as typeof window.matchMedia;
  try {
    const {result, unmount} = renderHook(useIsMobile);

    expect(result.current).toBe(true);

    act(() => {
      matches = false;
      listeners.forEach((listener) => listener());
    });

    expect(result.current).toBe(false);

    unmount();

    expect(listeners.size).toBe(0);
  } finally {
    window.matchMedia = original;
  }
});
