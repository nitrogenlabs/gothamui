import {cn} from '@nlabs/utils';
import {createContext, useMemo} from 'react';

import type {ComponentPropsWithoutRef, FC} from 'react';

interface TableContextValue {
  readonly bleed: boolean;
  readonly dense: boolean;
  readonly grid: boolean;
  readonly striped: boolean;
}

const TableContext = createContext<TableContextValue>({
  bleed: false,
  dense: false,
  grid: false,
  striped: false
});

const TableRowContext = createContext<{
  readonly href?: string;
  readonly target?: string;
  readonly title?: string;
}>({});

export interface TableProps extends ComponentPropsWithoutRef<'div'> {
  readonly bleed?: boolean;
  readonly dense?: boolean;
  readonly grid?: boolean;
  readonly striped?: boolean;
}

export const Table = ({
  bleed = false,
  children,
  className,
  dense = false,
  grid = false,
  striped = false,
  ...props
}: TableProps) => {
  const contextValue = useMemo(() => ({bleed, dense, grid, striped}), [bleed, dense, grid, striped]);
  return (
    <TableContext.Provider value={contextValue}>
      <div className="flow-root" data-slot="table-wrapper">
        <div className={cn('-mx-4 overflow-x-auto whitespace-nowrap sm:-mx-6 lg:-mx-8', className)} {...props}>
          <div className={cn('inline-block min-w-full align-middle', !bleed && 'px-4 sm:px-6 lg:px-8')}>
            <table className="min-w-full text-left text-sm/6 text-foreground dark:text-foreground-dark">
              {children}
            </table>
          </div>
        </div>
      </div>
    </TableContext.Provider>
  );
};

export const TableHead = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'thead'>) => (
  <thead
    className={cn('text-muted-foreground dark:text-muted-foreground-dark', className)}
    data-slot="table-head"
    {...props}
  />
);

export const TableBody = (props: ComponentPropsWithoutRef<'tbody'>) => (
  <tbody data-slot="table-body" {...props} />
);

export interface TableRowProps extends ComponentPropsWithoutRef<'tr'> {
  readonly href?: string;
  readonly target?: string;
  readonly title?: string;
}

export const TableRow: FC<TableRowProps> = ({
  className,
  href,
  target,
  title,
  ...props
}) => {
  const rowContext = useMemo(() => ({href, target, title}), [href, target, title]);
  return (
    <TableContext.Consumer>
      {({striped}) => (
        <TableRowContext.Provider value={rowContext}>
          <tr
            className={cn(
              href && 'focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-ring dark:focus-within:outline-ring-dark',
              striped && 'even:bg-muted/50 dark:even:bg-muted-dark/50',
              href && 'hover:bg-muted/60 dark:hover:bg-muted-dark/60',
              className
            )}
            data-slot="table-row"
            {...props}
          />
        </TableRowContext.Provider>
      )}
    </TableContext.Consumer>
  );
};

export const TableHeader: FC<ComponentPropsWithoutRef<'th'>> = ({
  className,
  ...props
}) => (
  <TableContext.Consumer>
    {({bleed, grid}) => (
      <th
        className={cn(
          'border-b border-border px-4 py-2 font-medium first:pl-4 last:pr-4 dark:border-border-dark',
          grid && 'border-l first:border-l-0',
          !bleed && 'sm:first:pl-0 sm:last:pr-0',
          className
        )}
        data-slot="table-header"
        {...props}
      />
    )}
  </TableContext.Consumer>
);

export const TableCell: FC<ComponentPropsWithoutRef<'td'>> = ({
  children,
  className,
  ...props
}) => (
  <TableContext.Consumer>
    {({bleed, dense, grid, striped}) => (
      <TableRowContext.Consumer>
        {({href, target, title}) => (
          <td
            className={cn(
              'relative px-4 first:pl-4 last:pr-4',
              !striped && 'border-b border-border/70 dark:border-border-dark/70',
              grid && 'border-l first:border-l-0',
              dense ? 'py-2.5' : 'py-4',
              !bleed && 'sm:first:pl-0 sm:last:pr-0',
              className
            )}
            data-slot="table-cell"
            {...props}
          >
            {href ? (
              <a
                aria-label={title}
                className="absolute inset-0 focus:outline-hidden"
                data-row-link
                href={href}
                target={target}
              />
            ) : null}
            {children}
          </td>
        )}
      </TableRowContext.Consumer>
    )}
  </TableContext.Consumer>
);
