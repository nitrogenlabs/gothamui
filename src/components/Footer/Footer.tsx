import {cn} from '@nlabs/utils';

import type {ReactNode} from 'react';

export interface FooterLink {
  readonly href: string;
  readonly label: string;
}

export interface FooterLinkGroup {
  readonly links: readonly FooterLink[];
  readonly title: string;
}

export interface FooterSocialLink extends FooterLink {
  readonly icon?: ReactNode;
}

export interface FooterProps {
  readonly brand?: ReactNode;
  readonly className?: string;
  readonly copyright?: string;
  readonly description?: ReactNode;
  readonly links?: readonly FooterLink[];
  readonly linkGroups?: readonly FooterLinkGroup[];
  readonly socialLinks?: readonly FooterSocialLink[];
  readonly supportEmail?: string;
  readonly supportLabel?: string;
  readonly variant?: 'small' | 'large';
}

export const Footer = ({
  brand,
  className,
  copyright,
  description,
  links = [],
  linkGroups = [],
  socialLinks = [],
  supportEmail = '',
  supportLabel = 'Support',
  variant = 'small'
}: FooterProps) => {
  const hasSupportEmail = Boolean(String(supportEmail || '').trim());

  if(variant === 'large') {
    return (
      <footer className={cn('bg-gray-900 dark:bg-gray-950', className)}>
        <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8">
              {brand ? (
                <div className="flex items-center gap-3">
                  {brand}
                </div>
              ) : null}
              {description ? (
                <p className="text-balance text-sm/6 text-gray-400">
                  {description}
                </p>
              ) : null}
              {socialLinks.length > 0 ? (
                <div className="flex gap-x-6">
                  {socialLinks.map((item) => (
                    <a
                      className="cursor-pointer text-gray-400 transition-colors duration-200 hover:text-violet-400"
                      href={item.href}
                      key={`${item.label}-${item.href}`}
                    >
                      <span className="sr-only">{item.label}</span>
                      {item.icon ? item.icon : item.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
            {linkGroups.length > 0 ? (
              <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                {linkGroups.map((group) => (
                  <div key={group.title}>
                    <h3 className="text-sm/6 font-semibold text-white">{group.title}</h3>
                    <ul className="mt-6 space-y-4" role="list">
                      {group.links.map((item) => (
                        <li key={`${group.title}-${item.label}-${item.href}`}>
                          <a
                            className="cursor-pointer text-sm/6 text-gray-400 transition-colors duration-200 hover:text-violet-400"
                            href={item.href}
                          >
                            {item.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          {copyright ? (
            <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
              <p className="text-sm/6 text-gray-400">{copyright}</p>
            </div>
          ) : null}
        </div>
      </footer>
    );
  }

  return (
    <footer className={cn('border-t border-gray-900/8 bg-white/70 backdrop-blur-sm dark:border-white/8 dark:bg-gray-900/70', className)}>
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            {brand}
          </div>
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {links.map((item) => (
              <a
                className="cursor-pointer text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                href={item.href}
                key={`${item.label}-${item.href}`}
              >
                {item.label}
              </a>
            ))}
            {hasSupportEmail ? (
              <a
                className="cursor-pointer text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                href={`mailto:${supportEmail}`}
              >
                {supportLabel}
              </a>
            ) : null}
          </nav>
        </div>
        {copyright ? (
          <div className="border-t border-gray-900/8 pt-4 dark:border-white/8">
            <p className="text-xs text-gray-500 dark:text-gray-400">{copyright}</p>
          </div>
        ) : null}
      </div>
    </footer>
  );
};

export default Footer;
