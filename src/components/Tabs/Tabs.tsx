import {cn} from '@nlabs/utils';
import {ChevronDown} from 'lucide-react';
import {memo} from 'react';

import type {HTMLAttributes, SelectHTMLAttributes} from 'react';

export interface TabItem {
  readonly current?: boolean;
  readonly disabled?: boolean;
  readonly href?: string;
  readonly id?: string;
  readonly label: string;
}

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  readonly ariaLabel?: string;
  readonly items: TabItem[];
  readonly onTabChange?: (item: TabItem) => void;
  readonly variant?: 'underline' | 'pills';
}

const getTabClasses = (current: boolean, variant: TabsProps['variant']) => {
  if(variant === 'pills') {
    return current
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground dark:text-muted-foreground-dark dark:hover:bg-muted-dark dark:hover:text-foreground-dark';
  }

  return current
    ? 'border-primary text-primary dark:border-primary-dark dark:text-primary-dark'
    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground dark:text-muted-foreground-dark dark:hover:border-border-dark dark:hover:text-foreground-dark';
};

const TabsComponent = ({
  ariaLabel = 'Tabs',
  className,
  items,
  onTabChange,
  variant = 'underline',
  ...props
}: TabsProps) => {
  const currentItem = items.find((item) => item.current) ?? items[0];

  return (
    <div className={className} data-slot="tabs" {...props}>
      <MobileTabSelect
        aria-label={ariaLabel}
        currentItem={currentItem}
        items={items}
        onTabChange={onTabChange}
      />
      <div className="hidden sm:block">
        <div className={cn(variant === 'underline' && 'border-b border-border dark:border-border-dark')}>
          <nav aria-label={ariaLabel} className={cn(variant === 'underline' ? '-mb-px flex gap-8' : 'flex gap-1 rounded-md bg-muted p-1 dark:bg-muted-dark')}>
            {items.map((item) => {
              const current = item.id === currentItem?.id || item.label === currentItem?.label;
              const commonClasses = cn(
                'cursor-pointer whitespace-nowrap text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
                variant === 'underline' ? 'border-b-2 px-1 py-4' : 'rounded-md px-3 py-2',
                getTabClasses(current, variant)
              );

              if(item.href) {
                return (
                  <a
                    aria-current={current ? 'page' : undefined}
                    className={commonClasses}
                    href={item.href}
                    key={item.id ?? item.label}
                  >
                    {item.label}
                  </a>
                );
              }

              return (
                <button
                  aria-current={current ? 'page' : undefined}
                  className={commonClasses}
                  disabled={item.disabled}
                  key={item.id ?? item.label}
                  onClick={() => onTabChange?.(item)}
                  type="button"
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

interface MobileTabSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  readonly currentItem?: TabItem;
  readonly items: TabItem[];
  readonly onTabChange?: (item: TabItem) => void;
}

const MobileTabSelect = ({
  currentItem,
  items,
  onTabChange,
  ...props
}: MobileTabSelectProps) => (
  <div className="grid grid-cols-1 sm:hidden">
    <select
      className="col-start-1 row-start-1 w-full cursor-pointer appearance-none rounded-md bg-card py-2 pr-8 pl-3 text-base text-card-foreground outline-1 -outline-offset-1 outline-border focus:outline-2 focus:-outline-offset-2 focus:outline-ring dark:bg-card-dark dark:text-card-foreground-dark dark:outline-border-dark dark:focus:outline-ring-dark"
      defaultValue={currentItem?.id ?? currentItem?.label}
      onChange={(event) => {
        const nextItem = items.find((item) => (item.id ?? item.label) === event.currentTarget.value);
        if(nextItem) {
          onTabChange?.(nextItem);
        }
      }}
      {...props}
    >
      {items.map((item) => (
        <option disabled={item.disabled} key={item.id ?? item.label} value={item.id ?? item.label}>
          {item.label}
        </option>
      ))}
    </select>
    <ChevronDown
      aria-hidden="true"
      className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-muted-foreground dark:text-muted-foreground-dark"
    />
  </div>
);

export const Tabs = memo(TabsComponent);
Tabs.displayName = 'Tabs';
