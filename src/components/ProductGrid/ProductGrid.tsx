import {cn} from '@nlabs/utils';
import {memo} from 'react';

import type {AnchorHTMLAttributes, HTMLAttributes, ReactNode} from 'react';

export interface ProductItem {
  readonly badge?: ReactNode;
  readonly colors?: string[];
  readonly description?: ReactNode;
  readonly href?: string;
  readonly id?: string | number;
  readonly imageAlt: string;
  readonly imageSrc: string;
  readonly name: ReactNode;
  readonly price?: ReactNode;
}

export interface ProductGridProps extends HTMLAttributes<HTMLDivElement> {
  readonly products: ProductItem[];
}

const ProductGridComponent = ({
  className,
  products,
  ...props
}: ProductGridProps) => (
  <div
    className={cn('grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8', className)}
    data-slot="product-grid"
    {...props}
  >
    {products.map((product) => (
      <ProductCard key={product.id ?? String(product.name)} product={product} />
    ))}
  </div>
);

export interface ProductCardProps extends HTMLAttributes<HTMLElement> {
  readonly product: ProductItem;
}

const ProductCardComponent = ({
  className,
  product,
  ...props
}: ProductCardProps) => {
  const content = (
    <>
      <img
        alt={product.imageAlt}
        className="aspect-square w-full rounded-lg bg-muted object-cover transition-opacity group-hover:opacity-80 dark:bg-muted-dark xl:aspect-7/8"
        src={product.imageSrc}
      />
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm text-foreground dark:text-foreground-dark">{product.name}</h3>
          {product.description ? <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground-dark">{product.description}</p> : null}
        </div>
        {product.price ? <p className="shrink-0 text-sm font-medium text-foreground dark:text-foreground-dark">{product.price}</p> : null}
      </div>
      {product.colors?.length ? (
        <div className="mt-3 flex gap-1.5">
          {product.colors.map((color) => (
            <span
              aria-label={color}
              className="size-4 rounded-full border border-black/10 ring-1 ring-black/5 dark:border-white/20 dark:ring-white/10"
              key={color}
              style={{backgroundColor: color}}
            />
          ))}
        </div>
      ) : null}
      {product.badge ? <div className="mt-3">{product.badge}</div> : null}
    </>
  );

  if(product.href) {
    return (
      <a
        className={cn('cursor-pointer group block', className)}
        data-slot="product-card"
        href={product.href}
        {...props as AnchorHTMLAttributes<HTMLAnchorElement>}
      >
        {content}
      </a>
    );
  }

  return (
    <article
      className={cn('group block', className)}
      data-slot="product-card"
      {...props}
    >
      {content}
    </article>
  );
};

export const ProductGrid = memo(ProductGridComponent);
ProductGrid.displayName = 'ProductGrid';

export const ProductCard = memo(ProductCardComponent);
ProductCard.displayName = 'ProductCard';
