import {cn} from '@nlabs/utils';
import {ArrowLeft, ArrowRight, Bookmark, BookOpen, ChevronRight, List, Rss} from 'lucide-react';

import type {ComponentType, HTMLAttributes, ReactNode, SVGProps} from 'react';

export type NotFoundVariant = 'simple' | 'popular' | 'split' | 'background';

export interface NotFoundLink {
  readonly description?: string;
  readonly href: string;
  readonly icon?: ComponentType<SVGProps<SVGSVGElement>>;
  readonly label: string;
}

export interface NotFoundSocialLink {
  readonly href: string;
  readonly icon: ComponentType<SVGProps<SVGSVGElement>>;
  readonly label: string;
}

export interface NotFoundProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  readonly backgroundImageAlt?: string;
  readonly backgroundImageSrc?: string;
  readonly copyright?: ReactNode;
  readonly description?: ReactNode;
  readonly footerLinks?: readonly NotFoundLink[];
  readonly homeHref?: string;
  readonly homeLabel?: string;
  readonly imageAlt?: string;
  readonly imageSrc?: string;
  readonly links?: readonly NotFoundLink[];
  readonly logo?: ReactNode;
  readonly socialLinks?: readonly NotFoundSocialLink[];
  readonly statusCode?: ReactNode;
  readonly supportHref?: string;
  readonly supportLabel?: string;
  readonly title?: ReactNode;
  readonly variant?: NotFoundVariant;
}

const defaultLinks: readonly NotFoundLink[] = [
  {
    description: 'Learn how to integrate GothamUI components with your app.',
    href: '/docs',
    icon: BookOpen,
    label: 'Documentation'
  },
  {
    description: 'Find the available components, utilities, and package exports.',
    href: '/docs/api',
    icon: List,
    label: 'API Reference'
  },
  {
    description: 'Review common setup patterns and implementation notes.',
    href: '/guides',
    icon: Bookmark,
    label: 'Guides'
  },
  {
    description: 'Read the latest updates and project notes.',
    href: '/blog',
    icon: Rss,
    label: 'Blog'
  }
];

const defaultFooterLinks: readonly NotFoundLink[] = [
  {href: '/support', label: 'Contact support'},
  {href: '/status', label: 'Status'}
];

const renderLogo = (logo?: ReactNode) => logo ? (
  <div className="mx-auto flex h-10 w-fit items-center justify-center sm:h-12">
    {logo}
  </div>
) : null;

const NotFoundContent = ({
  center = false,
  description,
  homeHref,
  homeLabel,
  statusCode,
  supportHref,
  supportLabel,
  title
}: Pick<NotFoundProps, 'description' | 'homeHref' | 'homeLabel' | 'statusCode' | 'supportHref' | 'supportLabel' | 'title'> & {
  readonly center?: boolean;
}) => (
  <div className={cn(center && 'text-center')}>
    <p className="text-base/8 font-semibold text-primary dark:text-primary-dark-300">{statusCode}</p>
    <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl dark:text-white">
      {title}
    </h1>
    <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8 dark:text-gray-400">
      {description}
    </p>
    <div className={cn('mt-10 flex flex-wrap items-center gap-x-6 gap-y-3', center && 'justify-center')}>
      <a
        className="inline-flex items-center rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:bg-primary-dark dark:hover:bg-primary-dark-300"
        href={homeHref}
      >
        {homeLabel}
      </a>
      {supportHref ? (
        <a className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white" href={supportHref}>
          {supportLabel}
          <ArrowRight aria-hidden="true" className="size-4" />
        </a>
      ) : null}
    </div>
  </div>
);

const PopularLinks = ({links}: {readonly links: readonly NotFoundLink[]}) => (
  <div className="mx-auto mt-16 flow-root max-w-lg sm:mt-20">
    <h2 className="sr-only">Popular pages</h2>
    <ul
      className="-mt-6 divide-y divide-gray-900/5 border-b border-gray-900/5 dark:divide-white/10 dark:border-white/10"
      role="list"
    >
      {links.map((link) => {
        const Icon = link.icon ?? BookOpen;

        return (
          <li className="relative flex gap-x-6 py-6" key={`${link.label}-${link.href}`}>
            <div className="flex size-10 flex-none items-center justify-center rounded-lg shadow-xs outline-1 outline-gray-900/10 dark:bg-gray-800/50 dark:-outline-offset-1 dark:outline-white/10">
              <Icon aria-hidden="true" className="size-6 text-primary dark:text-primary-dark-300" />
            </div>
            <div className="flex-auto">
              <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-white">
                <a href={link.href}>
                  <span aria-hidden="true" className="absolute inset-0" />
                  {link.label}
                </a>
              </h3>
              {link.description ? (
                <p className="mt-2 text-sm/6 text-gray-600 dark:text-gray-400">{link.description}</p>
              ) : null}
            </div>
            <div className="flex-none self-center">
              <ChevronRight aria-hidden="true" className="size-5 text-gray-400 dark:text-gray-500" />
            </div>
          </li>
        );
      })}
    </ul>
  </div>
);

export const NotFound = ({
  backgroundImageAlt = '',
  backgroundImageSrc,
  className,
  copyright,
  description = 'Sorry, we could not find the page you are looking for.',
  footerLinks = defaultFooterLinks,
  homeHref = '/',
  homeLabel = 'Go back home',
  imageAlt = '',
  imageSrc,
  links = defaultLinks,
  logo,
  socialLinks = [],
  statusCode = '404',
  supportHref,
  supportLabel = 'Contact support',
  title = 'Page not found',
  variant = 'simple',
  ...props
}: NotFoundProps) => {
  if (variant === 'background') {
    return (
      <div className={cn('relative isolate min-h-screen', className)} data-slot="not-found" data-variant={variant} {...props}>
        {backgroundImageSrc ? (
          <img alt={backgroundImageAlt} className="absolute inset-0 -z-10 size-full object-cover object-top" src={backgroundImageSrc} />
        ) : null}
        <div className="absolute inset-0 -z-10 bg-gray-950/70" />
        <main className="mx-auto max-w-7xl px-6 py-32 text-center sm:py-40 lg:px-8">
          <p className="text-base/8 font-semibold text-white">{statusCode}</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-white sm:text-7xl">{title}</h1>
          <p className="mt-6 text-lg font-medium text-pretty text-white/70 sm:text-xl/8">{description}</p>
          <div className="mt-10 flex justify-center">
            <a className="inline-flex items-center gap-1 text-sm/7 font-semibold text-white hover:text-white/90" href={homeHref}>
              <ArrowLeft aria-hidden="true" className="size-4" />
              {homeLabel}
            </a>
          </div>
        </main>
      </div>
    );
  }

  if (variant === 'split') {
    return (
      <div
        className={cn('grid min-h-screen grid-cols-1 grid-rows-[auto_1fr_auto] bg-white lg:grid-cols-[minmax(0,36rem)_1fr] dark:bg-gray-900', className)}
        data-slot="not-found"
        data-variant={variant}
        {...props}
      >
        <header className="mx-auto w-full max-w-7xl px-6 pt-6 sm:pt-10 lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:px-8">
          {logo ? <a href={homeHref}>{logo}</a> : null}
        </header>
        <main className="mx-auto flex w-full max-w-7xl items-center px-6 py-24 sm:py-32 lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:px-8">
          <div className="max-w-lg">
            <NotFoundContent
              description={description}
              homeHref={homeHref}
              homeLabel={homeLabel}
              statusCode={statusCode}
              supportHref={undefined}
              supportLabel={supportLabel}
              title={title}
            />
          </div>
        </main>
        <footer className="self-end lg:col-span-2 lg:col-start-1 lg:row-start-3">
          <div className="border-t border-gray-100 bg-gray-50 py-10 dark:border-white/10 dark:bg-gray-800/50">
            <nav className="mx-auto flex w-full max-w-7xl items-center gap-x-4 px-6 text-sm/7 text-gray-600 lg:px-8 dark:text-gray-400">
              {footerLinks.map((link, index) => (
                <span className="contents" key={`${link.label}-${link.href}`}>
                  {index > 0 ? <span aria-hidden="true" className="size-0.5 rounded-full bg-gray-300 dark:bg-gray-600" /> : null}
                  <a href={link.href}>{link.label}</a>
                </span>
              ))}
            </nav>
          </div>
        </footer>
        {imageSrc ? (
          <div className="hidden lg:relative lg:col-start-2 lg:row-start-1 lg:row-end-4 lg:block">
            <img alt={imageAlt} className="absolute inset-0 size-full object-cover" src={imageSrc} />
          </div>
        ) : null}
      </div>
    );
  }

  if (variant === 'popular') {
    return (
      <div className={cn('min-h-screen bg-white dark:bg-gray-900', className)} data-slot="not-found" data-variant={variant} {...props}>
        <main className="mx-auto w-full max-w-7xl px-6 pt-10 pb-16 sm:pb-24 lg:px-8">
          {renderLogo(logo)}
          <div className="mx-auto mt-20 max-w-2xl text-center sm:mt-24">
            <NotFoundContent
              center
              description={description}
              homeHref={homeHref}
              homeLabel={homeLabel}
              statusCode={statusCode}
              supportHref={undefined}
              supportLabel={supportLabel}
              title={title}
            />
          </div>
          <PopularLinks links={links} />
          <div className="mt-10 flex justify-center">
            <a className="inline-flex items-center gap-1 text-sm/6 font-semibold text-primary dark:text-primary-dark-300" href={homeHref}>
              <ArrowLeft aria-hidden="true" className="size-4" />
              {homeLabel}
            </a>
          </div>
        </main>
        {(copyright || socialLinks.length > 0) ? (
          <footer className="border-t border-gray-100 py-6 sm:py-10 dark:border-white/10">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-8 px-6 sm:flex-row lg:px-8">
              {copyright ? <p className="text-sm/7 text-gray-400 dark:text-gray-500">{copyright}</p> : null}
              {(copyright && socialLinks.length > 0) ? <div className="hidden sm:block sm:h-7 sm:w-px sm:flex-none sm:bg-gray-200 dark:sm:bg-gray-700" /> : null}
              <div className="flex gap-x-4">
                {socialLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <a className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400" href={item.href} key={`${item.label}-${item.href}`}>
                      <span className="sr-only">{item.label}</span>
                      <Icon aria-hidden="true" className="size-6" />
                    </a>
                  );
                })}
              </div>
            </div>
          </footer>
        ) : null}
      </div>
    );
  }

  return (
    <main
      className={cn('grid min-h-screen place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8 dark:bg-gray-900', className)}
      data-slot="not-found"
      data-variant={variant}
      {...props}
    >
      <NotFoundContent
        center
        description={description}
        homeHref={homeHref}
        homeLabel={homeLabel}
        statusCode={statusCode}
        supportHref={supportHref}
        supportLabel={supportLabel}
        title={title}
      />
    </main>
  );
};

export default NotFound;
