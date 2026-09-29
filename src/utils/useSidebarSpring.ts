import {useLayoutEffect, useRef} from 'react';

import {advanceFluidSpring} from './fluidSpring.js';

import type {RefObject} from 'react';

/** Preserve velocity across direction changes and honor live reduced-motion preferences. */
export const useSidebarSpring = (panel: RefObject<HTMLElement | null>, open: boolean): void => {
  const spring = useRef({position: open ? 0 : 1, velocity: 0});
  useLayoutEffect(() => {
    const element = panel.current;
    if(!element) {
      return undefined;
    }
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const target = open ? 0 : 1;
    let previous = performance.now();
    let frame = 0;
    const tick = (now: number): void => {
      spring.current = preference?.matches ? {position: target, velocity: 0}
        : advanceFluidSpring(spring.current, target, (now - previous) / 1000);
      previous = now;
      const {position, velocity} = spring.current;
      element.style.translate = `${position * 100}% 0`;
      const settled = position === target && velocity === 0;
      element.style.willChange = settled ? 'auto' : 'translate';
      frame = settled ? 0 : requestAnimationFrame(tick);
    };
    const updatePreference = (): void => {
      cancelAnimationFrame(frame);
      previous = performance.now();
      tick(previous);
    };
    tick(previous);
    preference?.addEventListener('change', updatePreference);
    return () => {
      cancelAnimationFrame(frame);
      preference?.removeEventListener('change', updatePreference);
    };
  }, [open, panel]);
};
