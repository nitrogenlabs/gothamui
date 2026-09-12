import {cn} from '@nlabs/utils';
import {memo} from 'react';

import {Container} from '../Container/Container.js';
import {SectionHeader} from '../SectionHeader/SectionHeader.js';

import type {HTMLAttributes, ReactNode} from 'react';

export interface FaqItem {
  readonly answer: ReactNode;
  readonly id?: string;
  readonly question: ReactNode;
}

export interface FaqSectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  readonly description?: ReactNode;
  readonly faqs: FaqItem[];
  readonly title: ReactNode;
}

const FaqSectionComponent = ({
  className,
  description,
  faqs,
  title,
  ...props
}: FaqSectionProps) => (
  <section className={cn('bg-background py-16 sm:py-24 dark:bg-background-dark', className)} data-slot="faq-section" {...props}>
    <Container>
      <SectionHeader subtitle={description} title={title} />
      <dl className="mt-16 space-y-12 sm:grid sm:grid-cols-2 sm:space-y-0 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-3 lg:gap-x-10">
        {faqs.map((faq) => (
          <div key={faq.id ?? String(faq.question)}>
            <dt className="text-base/7 font-semibold text-foreground dark:text-foreground-dark">{faq.question}</dt>
            <dd className="mt-2 text-base/7 text-muted-foreground dark:text-muted-foreground-dark">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </Container>
  </section>
);

export const FaqSection = memo(FaqSectionComponent);
FaqSection.displayName = 'FaqSection';
