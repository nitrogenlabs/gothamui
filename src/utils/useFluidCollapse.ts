import {useLayoutEffect, useRef} from 'react';

import {advanceFluidSpring} from './fluidSpring.js';

import type {RefObject} from 'react';

export const useFluidCollapse = (
  panel: RefObject<HTMLDivElement | null>, content: RefObject<HTMLDivElement | null>, open: boolean
): void => {
  const spring = useRef({position: open ? 1 : 0, velocity: 0});
  useLayoutEffect(() => {
    const element = panel.current;
    const inner = content.current;
    if(!element || !inner) {
      return undefined;
    }
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const target = open ? 1 : 0;
    let frame = 0;
    let previous = performance.now();
    let {height} = inner.getBoundingClientRect();
    const paint = (): void => {
      element.style.height = `${Math.max(0, spring.current.position * height)}px`;
    };
    const tick = (now: number): void => {
      spring.current = preference?.matches ? {position: target, velocity: 0}
        : advanceFluidSpring(spring.current, target, (now - previous) / 1000);
      previous = now;
      paint();
      frame = spring.current.position === target && spring.current.velocity === 0 ? 0 : requestAnimationFrame(tick);
    };
    const update = (): void => {
      cancelAnimationFrame(frame);
      previous = performance.now();
      tick(previous);
    };
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(() => {
      ({height} = inner.getBoundingClientRect());
      paint();
    });
    observer?.observe(inner);
    preference?.addEventListener('change', update);
    update();
    return () => {
      observer?.disconnect();
      preference?.removeEventListener('change', update);
      cancelAnimationFrame(frame);
    };
  }, [content, open, panel]);
};
