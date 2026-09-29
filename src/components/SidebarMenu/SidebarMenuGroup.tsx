import {ChevronDown} from 'lucide-react';
import {useId, useRef} from 'react';

import {useFluidCollapse} from '../../utils/useFluidCollapse.js';

import type {ReactElement, ReactNode} from 'react';

// The compatibility rule does not recognize typed arrow components.
/* eslint-disable react-hooks/rules-of-hooks */
export const SidebarMenuGroup = ({children, label, onToggle, open}: {
  readonly children: ReactNode;
  readonly label: ReactNode;
  readonly onToggle: () => void;
  readonly open: boolean;
}): ReactElement => {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useFluidCollapse(panel, content, open);
  return <div data-slot="sidebar-menu-group">
    <button aria-controls={`${id}-panel`} aria-expanded={open}
      className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-white/5 focus-visible:outline-2"
      data-slot="sidebar-menu-trigger" id={`${id}-trigger`} onClick={() => {
        if(panel.current?.contains(document.activeElement)) {
          trigger.current?.focus();
        }
        onToggle();
      }} ref={trigger} type="button">
      {label}<ChevronDown aria-hidden="true" size={14} style={{transform: open ? 'rotate(180deg)' : undefined}} />
    </button>
    <div aria-hidden={!open} aria-labelledby={`${id}-trigger`} data-slot="sidebar-menu-panel" id={`${id}-panel`}
      inert={!open} ref={panel} style={{height: open ? undefined : 0, overflow: 'hidden'}}>
      <div className="space-y-0.5 pb-2" ref={content}>{children}</div>
    </div>
  </div>;
};
/* eslint-enable react-hooks/rules-of-hooks */
