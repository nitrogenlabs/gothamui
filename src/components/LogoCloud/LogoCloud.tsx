import {cn} from '@nlabs/utils';
import {memo} from 'react';

import {Container} from '../Container/Container.js';

import type {HTMLAttributes} from 'react';

export interface LogoCloudItem {
  readonly alt: string;
  readonly darkSrc?: string;
  readonly height?: number;
  readonly src: string;
  readonly width?: number;
}

export interface LogoCloudProps extends HTMLAttributes<HTMLElement> {
  readonly logos: LogoCloudItem[];
  readonly title?: string;
}

const LogoCloudComponent = ({
  className,
  logos,
  title,
  ...props
}: LogoCloudProps) => (
  <section className={cn('bg-background py-16 sm:py-24 dark:bg-background-dark', className)} data-slot="logo-cloud" {...props}>
    <Container>
      {title ? (
        <h2 className="text-center text-lg/8 font-semibold text-foreground dark:text-foreground-dark">{title}</h2>
      ) : null}
      <div className={cn('mx-auto grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5', title && 'mt-10')}>
        {logos.map((logo) => (
          <div className="col-span-2 flex justify-center lg:col-span-1" key={logo.alt}>
            <img
              alt={logo.alt}
              className={cn('max-h-12 w-full object-contain', logo.darkSrc && 'dark:hidden')}
              height={logo.height}
              src={logo.src}
              width={logo.width}
            />
            {logo.darkSrc ? (
              <img
                alt={logo.alt}
                className="hidden max-h-12 w-full object-contain dark:block"
                height={logo.height}
                src={logo.darkSrc}
                width={logo.width}
              />
            ) : null}
          </div>
        ))}
      </div>
    </Container>
  </section>
);

export const LogoCloud = memo(LogoCloudComponent);
LogoCloud.displayName = 'LogoCloud';
