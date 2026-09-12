import {cn} from '@nlabs/utils';
import {memo} from 'react';

import {Card} from '../../components/Card/Card.js';

import type {HTMLAttributes, ReactNode} from 'react';

export interface AuthViewProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  readonly cardClassName?: string;
  readonly cardDescription: ReactNode;
  readonly cardHeaderClassName?: string;
  readonly cardTitle: ReactNode;
  readonly description: ReactNode;
  readonly descriptionClassName?: string;
  readonly eyebrow?: ReactNode;
  readonly eyebrowClassName?: string;
  readonly title: ReactNode;
  readonly titleClassName?: string;
}

const AuthViewComponent = ({
  cardClassName,
  cardDescription,
  cardHeaderClassName,
  cardTitle,
  children,
  className,
  description,
  descriptionClassName,
  eyebrow = 'Account access',
  eyebrowClassName,
  title,
  titleClassName,
  ...props
}: AuthViewProps) => (
  <main
    className={cn(
      'box-border flex min-h-dvh min-w-80 w-full items-center justify-center bg-background px-[5vw] py-10 text-foreground dark:bg-background-dark dark:text-foreground-dark max-[600px]:px-5 max-[600px]:py-5',
      className
    )}
    data-slot="auth-view"
    {...props}
  >
    <div className="mx-auto grid w-full max-w-[1440px] items-center gap-12 min-[841px]:grid-cols-[minmax(280px,.9fr)_minmax(360px,.62fr)] min-[841px]:gap-[9vw]">
      <section className="max-w-[620px] max-[600px]:hidden" data-slot="auth-view-hero">
        <p className={cn('m-0 text-[11px] font-bold uppercase tracking-normal text-primary dark:text-primary-dark', eyebrowClassName)}>
          {eyebrow}
        </p>
        <h1 className={cn('my-3 mb-6 font-display text-[clamp(48px,6vw,86px)] font-normal leading-[0.98] tracking-normal', titleClassName)}>
          {title}
        </h1>
        <p className={cn('m-0 max-w-[520px] text-lg leading-[1.65] text-muted-foreground dark:text-muted-foreground-dark', descriptionClassName)}>
          {description}
        </p>
      </section>

      <Card className={cn('mx-auto w-full max-w-[520px] gap-0 rounded-lg border-border bg-card p-5 text-card-foreground shadow-none min-[601px]:p-8 dark:border-border-dark dark:bg-card-dark dark:text-card-foreground-dark', cardClassName)} data-slot="auth-view-card">
        <header className={cn('mb-5 border-b border-border pb-4 min-[601px]:mb-7 min-[601px]:pb-5 dark:border-border-dark', cardHeaderClassName)}>
          <p className={cn('m-0 mb-2 text-[11px] font-bold uppercase tracking-normal text-primary min-[601px]:hidden dark:text-primary-dark', eyebrowClassName)}>
            {eyebrow}
          </p>
          <h2 className="m-0 font-display text-[36px] font-normal tracking-normal">{cardTitle}</h2>
          <p className="mb-0 mt-2 text-sm leading-6 text-muted-foreground dark:text-muted-foreground-dark">
            {cardDescription}
          </p>
        </header>
        {children}
      </Card>
    </div>
  </main>
);

export const AuthView = memo(AuthViewComponent);
AuthView.displayName = 'AuthView';
