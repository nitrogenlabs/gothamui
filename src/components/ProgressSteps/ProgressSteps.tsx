import {cn} from '@nlabs/utils';

import type {HTMLAttributes} from 'react';

export type ProgressStepStatus = 'complete' | 'current' | 'upcoming';

export interface ProgressStepItem {
  readonly href?: string;
  readonly id?: string;
  readonly label: string;
  readonly status: ProgressStepStatus;
}

export interface ProgressStepsProps extends HTMLAttributes<HTMLElement> {
  readonly ariaLabel?: string;
  readonly steps: ProgressStepItem[];
}

const getStepClasses = (status: ProgressStepStatus) => {
  if(status === 'complete') {
    return 'border-primary hover:border-primary-700 dark:border-primary-dark dark:hover:border-primary-dark-300';
  }

  if(status === 'current') {
    return 'border-primary dark:border-primary-dark';
  }

  return 'border-border hover:border-muted-foreground dark:border-border-dark dark:hover:border-muted-foreground-dark';
};

const getStepLabelClasses = (status: ProgressStepStatus) => (status === 'upcoming'
  ? 'text-muted-foreground group-hover:text-foreground dark:text-muted-foreground-dark dark:group-hover:text-foreground-dark'
  : 'text-primary dark:text-primary-dark');

export const ProgressSteps = ({
  ariaLabel = 'Progress',
  className,
  steps,
  ...props
}: ProgressStepsProps) => (
  <nav aria-label={ariaLabel} className={className} data-slot="progress-steps" {...props}>
    <ol className="space-y-4 md:flex md:space-y-0 md:space-x-8">
      {steps.map((step, index) => {
        const content = (
          <>
            <span className={cn('text-sm font-medium', getStepLabelClasses(step.status))}>
              {step.id ?? `Step ${index + 1}`}
            </span>
            <span className="text-sm font-medium text-foreground dark:text-foreground-dark">{step.label}</span>
          </>
        );
        const classes = cn('group flex flex-col border-l-4 py-2 pl-4 md:border-t-4 md:border-l-0 md:pt-4 md:pb-0 md:pl-0', getStepClasses(step.status));

        return (
          <li className="md:flex-1" key={step.id ?? step.label}>
            {step.href ? (
              <a aria-current={step.status === 'current' ? 'step' : undefined} className={cn('cursor-pointer', classes)} href={step.href}>
                {content}
              </a>
            ) : (
              <div aria-current={step.status === 'current' ? 'step' : undefined} className={classes}>
                {content}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);
