/* eslint-disable react-hooks/rules-of-hooks -- Local compatibility rule misidentifies exported arrow components. */
import {Dialog, DialogPanel} from '@headlessui/react';
import {cn} from '@nlabs/utils';
import {useLayoutEffect, useRef, useState} from 'react';

import type {HTMLAttributes, ReactElement, ReactNode} from 'react';

export interface DrawerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onClose'> {
  readonly backdropClassName?: string;
  readonly children?: ReactNode;
  readonly onAfterClose?: () => void;
  readonly onClose: (open: boolean) => void;
  readonly open: boolean;
  readonly side?: 'left' | 'right';
}

/** Accessible modal drawer with a damped spring and retained presence during exit. */
export const Drawer = ({
  backdropClassName, children, className, onAfterClose, onClose, open, side = 'right', style, ...props
}: DrawerProps): ReactElement => {
  const [present, setPresent] = useState(open);
  const panel = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const motion = useRef({position: 1, velocity: 0});
  const afterClose = useRef(onAfterClose);
  afterClose.current = onAfterClose;

  useLayoutEffect(() => {
    if(open) {
      setPresent(true);
    }
    if(!open && !present) {
      return undefined;
    }
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let previous = performance.now();
    const target = open ? 0 : 1;
    const tick = (now: number): void => {
      const state = motion.current;
      const elapsed = Math.min((now - previous) / 1000, 0.032);
      previous = now;
      if(preference.matches) {
        state.position = target;
        state.velocity = 0;
      } else {
        const steps = Math.max(1, Math.ceil(elapsed / 0.008));
        const dt = elapsed / steps;
        const stiffness = open ? 400 : 500;
        const damping = open ? 32 : 45;
        for(let step = 0; step < steps; step++) {
          const force = (-stiffness * (state.position - target)) - (damping * state.velocity);
          state.velocity += force * dt;
          state.position += state.velocity * dt;
        }
      }
      const settled = Math.abs(state.position - target) < 0.0005 && Math.abs(state.velocity) < 0.005;
      if(settled) {
        state.position = target;
        state.velocity = 0;
      }
      if(panel.current) {
        panel.current.style.transform = `translate3d(${state.position * (side === 'right' ? 100 : -100)}%,0,0)`;
        panel.current.style.willChange = settled ? 'auto' : 'transform';
      }
      if(backdrop.current) {
        backdrop.current.style.opacity = String(Math.max(0, Math.min(1, 1 - state.position)));
      }
      if(settled && panel.current) {
        frame = 0;
        if(!open) {
          setPresent(false);
          afterClose.current?.();
        }
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    const resume = (): void => {
      if(!frame) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    preference.addEventListener('change', resume);
    return () => {
      cancelAnimationFrame(frame);
      preference.removeEventListener('change', resume);
    };
  }, [open, present, side]);

  return <Dialog className="relative z-50" data-slot="drawer" onClose={onClose} open={open || present}>
    <div className={cn('fixed inset-0 bg-zinc-950/45 backdrop-blur-sm', backdropClassName)} data-slot="drawer-backdrop" ref={backdrop} style={{opacity: 0}} />
    <div className="fixed inset-0 overflow-hidden">
      <DialogPanel
        {...props}
        className={cn('fixed inset-y-0 flex h-dvh w-full max-w-lg flex-col overflow-hidden border border-zinc-200 bg-white text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white', side === 'right' ? 'right-0' : 'left-0', className)}
        data-slot="drawer-panel"
        ref={panel}
        style={{...style, transform: `translate3d(${side === 'right' ? 100 : -100}%,0,0)`}}>
        {children}
      </DialogPanel>
    </div>
  </Dialog>;
};
