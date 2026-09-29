import {SidebarMenuGroup} from './SidebarMenuGroup.js';

import type {ReactElement, ReactNode} from 'react';

export interface SidebarMenuProps {
  readonly className?: string;
  readonly expandedId: string | null;
  readonly groups: readonly {content: ReactNode; id: string; label: ReactNode}[];
  readonly label?: string;
  readonly onExpandedChange: (id: string | null) => void;
}

export const SidebarMenu = ({
  className = '', expandedId, groups, label = 'Sidebar navigation', onExpandedChange
}: SidebarMenuProps): ReactElement => <nav aria-label={label} className={className} data-slot="sidebar-menu">
  {groups.map((group) => <SidebarMenuGroup key={group.id} label={group.label}
    onToggle={() => onExpandedChange(expandedId === group.id ? null : group.id)} open={expandedId === group.id}>
    {group.content}
  </SidebarMenuGroup>)}
</nav>;
