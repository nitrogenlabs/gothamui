import {cn} from '@nlabs/utils';
import {memo} from 'react';

import type {HTMLAttributes, ReactNode} from 'react';

export interface IncentiveItem {
  readonly description: ReactNode;
  readonly icon?: ReactNode;
  readonly id?: string;
  readonly imageAlt?: string;
  readonly imageSrc?: string;
  readonly title: ReactNode;
}

export interface IncentiveGridProps extends HTMLAttributes<HTMLDivElement> {
  readonly incentives: IncentiveItem[];
}

const IncentiveGridComponent = ({
  className,
  incentives,
  ...props
}: IncentiveGridProps) => (
  <div className={cn('grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3', className)} data-slot="incentive-grid" {...props}>
    {incentives.map((incentive) => (
      <div className="flex flex-col items-center text-center" data-slot="incentive-card" key={incentive.id ?? String(incentive.title)}>
        {incentive.imageSrc ? (
          <img alt={incentive.imageAlt ?? ''} className="size-16 object-contain" src={incentive.imageSrc} />
        ) : (
          <div className="flex size-12 items-center justify-center rounded-md bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-dark">
            {incentive.icon}
          </div>
        )}
        <h3 className="mt-5 text-base font-semibold text-foreground dark:text-foreground-dark">{incentive.title}</h3>
        <p className="mt-2 text-sm/6 text-muted-foreground dark:text-muted-foreground-dark">{incentive.description}</p>
      </div>
    ))}
  </div>
);

export const IncentiveGrid = memo(IncentiveGridComponent);
IncentiveGrid.displayName = 'IncentiveGrid';
