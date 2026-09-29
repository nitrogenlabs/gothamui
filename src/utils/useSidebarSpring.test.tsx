import {act, render} from '@testing-library/react';
import {useRef} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {useSidebarSpring} from './useSidebarSpring.js';

import type {FC} from 'react';

// The compatibility rule does not recognize this typed test component.
/* eslint-disable react-hooks/rules-of-hooks */
const Sidebar: FC<{readonly open: boolean}> = ({open}) => {
  const ref = useRef<HTMLDivElement>(null);
  useSidebarSpring(ref, open);
  return <div ref={ref} />;
};
/* eslint-enable react-hooks/rules-of-hooks */
let time = 0;
let sequence = 0;
let preference: EventTarget & {matches: boolean};
const frames = new Map<number, FrameRequestCallback>();
const advance = (count: number): void => {
  act(() => {
    for(let index = 0; index < count; index++) {
      time += 1000 / 60;
      const pending = [...frames.values()];
      frames.clear();
      for(const callback of pending) {
        callback(time);
      }
    }
  });
};

beforeEach(() => {
  time = 0;
  frames.clear();
  preference = new EventTarget() as EventTarget & {matches: boolean};
  preference.matches = false;
  vi.stubGlobal('matchMedia', () => preference);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++sequence, callback);
    return sequence;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  vi.spyOn(performance, 'now').mockImplementation(() => time);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('sidebar spring', () => {
  it('keeps position on reversal, settles, and cancels pending work on unmount', () => {
    const {container, rerender, unmount} = render(<Sidebar open={false} />);
    const panel = container.firstElementChild as HTMLElement;
    rerender(<Sidebar open />);
    advance(12);
    const position = panel.style.translate;
    rerender(<Sidebar open={false} />);

    expect(panel.style.translate).toBe(position);

    advance(180);

    expect(panel.style.translate).toBe('100% 0');
    expect(frames.size).toBe(0);

    rerender(<Sidebar open />);
    unmount();

    expect(frames.size).toBe(0);
  });

  it('settles at either endpoint when reduced motion changes during travel', () => {
    const {container, rerender} = render(<Sidebar open={false} />);
    rerender(<Sidebar open />);
    advance(10);
    act(() => {
      preference.matches = true;
      preference.dispatchEvent(new Event('change'));
    });

    expect((container.firstElementChild as HTMLElement).style.translate).toBe('0% 0');

    rerender(<Sidebar open={false} />);

    expect((container.firstElementChild as HTMLElement).style.translate).toBe('100% 0');
    expect(frames.size).toBe(0);
  });
});
