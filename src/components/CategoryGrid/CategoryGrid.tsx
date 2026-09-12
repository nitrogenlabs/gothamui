import {cn} from '@nlabs/utils';
import {memo} from 'react';

import type {HTMLAttributes, ReactNode} from 'react';

export interface CategoryItem {
  readonly description?: ReactNode;
  readonly href?: string;
  readonly id?: string | number;
  readonly imageAlt: string;
  readonly imageSrc: string;
  readonly name: ReactNode;
}

export interface CategoryGridProps extends HTMLAttributes<HTMLDivElement> {
  readonly categories: CategoryItem[];
}

const CategoryGridComponent = ({
  categories,
  className,
  ...props
}: CategoryGridProps) => (
  <div className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3', className)} data-slot="category-grid" {...props}>
    {categories.map((category) => {
      const Element = category.href ? 'a' : 'article';

      return (
        <Element
          className="group relative block overflow-hidden rounded-lg bg-muted dark:bg-muted-dark"
          href={category.href as never}
          key={category.id ?? String(category.name)}
        >
          <img
            alt={category.imageAlt}
            className="aspect-3/2 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            src={category.imageSrc}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <h3 className="text-lg font-semibold text-white">{category.name}</h3>
            {category.description ? <p className="mt-1 text-sm text-white/80">{category.description}</p> : null}
          </div>
        </Element>
      );
    })}
  </div>
);

export const CategoryGrid = memo(CategoryGridComponent);
CategoryGrid.displayName = 'CategoryGrid';
