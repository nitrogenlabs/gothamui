import {cn} from '@nlabs/utils';
import {Star} from 'lucide-react';
import {memo} from 'react';

import {Avatar} from '../Avatar/Avatar.js';

import type {HTMLAttributes, ReactNode} from 'react';

export interface ReviewItem {
  readonly author: string;
  readonly avatarSrc?: string;
  readonly body: ReactNode;
  readonly id?: string | number;
  readonly rating?: number;
  readonly title?: ReactNode;
}

export interface ReviewListProps extends HTMLAttributes<HTMLDivElement> {
  readonly reviews: ReviewItem[];
}

const ReviewListComponent = ({
  className,
  reviews,
  ...props
}: ReviewListProps) => (
  <div className={cn('grid grid-cols-1 gap-6 lg:grid-cols-2', className)} data-slot="review-list" {...props}>
    {reviews.map((review) => (
      <figure className="rounded-lg border border-border bg-card p-6 shadow-sm dark:border-border-dark dark:bg-card-dark" key={review.id ?? review.author}>
        {typeof review.rating === 'number' ? (
          <div aria-label={`${review.rating} out of 5 stars`} className="flex gap-1 text-primary dark:text-primary-dark">
            {Array.from({length: 5}, (_, index) => (
              <Star
                aria-hidden="true"
                className={cn('size-4', index < review.rating! ? 'fill-current' : 'opacity-25')}
                key={index}
              />
            ))}
          </div>
        ) : null}
        {review.title ? <h3 className="mt-4 text-base font-semibold text-foreground dark:text-foreground-dark">{review.title}</h3> : null}
        <blockquote className="mt-3 text-sm/6 text-muted-foreground dark:text-muted-foreground-dark">{review.body}</blockquote>
        <figcaption className="mt-6 flex items-center gap-3">
          <Avatar initials={review.author.slice(0, 2).toUpperCase()} size="sm" src={review.avatarSrc} />
          <span className="text-sm font-medium text-foreground dark:text-foreground-dark">{review.author}</span>
        </figcaption>
      </figure>
    ))}
  </div>
);

export const ReviewList = memo(ReviewListComponent);
ReviewList.displayName = 'ReviewList';
