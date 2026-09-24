import {cn} from '@nlabs/utils';
import {Menu, X} from 'lucide-react';
import {useEffect, useId, useState} from 'react';
import {createPortal} from 'react-dom';

import {renderWithAsChild} from '../ComponentUtils/renderWithAsChild.js';

import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ElementType,
  FC,
  HTMLAttributes,
  ReactNode,
  Ref
} from 'react';

const getTransparentScrollThreshold = (threshold: number) => (
  threshold > 1 ? threshold : window.innerHeight * threshold
);

type NavbarScrollState = 'at-top' | 'scrolled' | undefined;

const getNavbarScrollState = (
  isAtTop: boolean,
  isMobileMenuOpen: boolean,
  transparentOnScroll: boolean
): NavbarScrollState => {
  if(!transparentOnScroll) {
    return undefined;
  }

  return isMobileMenuOpen || !isAtTop ? 'scrolled' : 'at-top';
};

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
  readonly as?: ElementType;
  readonly asChild?: boolean;
  readonly children?: ReactNode;
  readonly isFloating?: boolean;
  readonly isSticky?: boolean;
  readonly mobileMenu?: ReactNode;
  readonly mobileMenuLabel?: string;
  readonly mobileMenuTitle?: ReactNode;
  readonly ref?: Ref<HTMLElement>;
  readonly transparentOnScroll?: boolean;
  readonly transparentScrollBackdropFilter?: string;
  readonly transparentScrollThreshold?: number;
}

export interface NavbarSectionProps extends HTMLAttributes<HTMLDivElement> {
  readonly children?: ReactNode;
  readonly ref?: Ref<HTMLDivElement>;
}

export interface NavbarItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'> {
  readonly as?: ElementType;
  readonly asChild?: boolean;
  readonly children?: ReactNode;
  readonly current?: boolean;
  readonly href?: AnchorHTMLAttributes<HTMLAnchorElement>['href'];
  readonly ref?: Ref<HTMLElement>;
  readonly type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
}

// The compatibility rule does not recognize arrow-function components that delegate rendering.
/* eslint-disable react-hooks/rules-of-hooks */
export const Navbar: FC<NavbarProps> = ({
  as = 'nav',
  asChild = false,
  children,
  className,
  isFloating = false,
  isSticky = false,
  mobileMenu,
  mobileMenuLabel = 'Open navigation menu',
  mobileMenuTitle = 'Navigation',
  ref,
  style,
  transparentOnScroll = false,
  transparentScrollBackdropFilter = 'blur(12px)',
  transparentScrollThreshold = 0.1,
  ...props
}: NavbarProps) => {
  const [isAtTop, setIsAtTop] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuId = useId();

  useEffect(() => {
    if(!transparentOnScroll) {
      return undefined;
    }

    const onScroll = () => {
      const threshold = getTransparentScrollThreshold(transparentScrollThreshold);

      setIsAtTop(window.scrollY < threshold);
    };

    onScroll();
    window.addEventListener('resize', onScroll, {passive: true});
    window.addEventListener('scroll', onScroll, {passive: true});

    return () => {
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('scroll', onScroll);
    };
  }, [transparentOnScroll, transparentScrollThreshold]);

  useEffect(() => {
    if(!isMobileMenuOpen) {
      return undefined;
    }

    const bodyOverflow = document.body.style.overflow;
    const bodyOverscrollBehavior = document.body.style.overscrollBehavior;
    const htmlOverflow = document.documentElement.style.overflow;
    const htmlOverscrollBehavior = document.documentElement.style.overscrollBehavior;

    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none';

    const onKeyDown = (event: KeyboardEvent) => {
      if(event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.body.style.overscrollBehavior = bodyOverscrollBehavior;
      document.documentElement.style.overflow = htmlOverflow;
      document.documentElement.style.overscrollBehavior = htmlOverscrollBehavior;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isMobileMenuOpen]);

  const scrollState = getNavbarScrollState(isAtTop, isMobileMenuOpen, transparentOnScroll);
  const navbarStyle = scrollState === 'scrolled' ? {
    WebkitBackdropFilter: transparentScrollBackdropFilter,
    backdropFilter: transparentScrollBackdropFilter,
    ...style
  } : style;

  const mobileMenuPortal = mobileMenu && typeof document !== 'undefined' ? createPortal(
    <>
      <div
        aria-hidden={!isMobileMenuOpen}
        className={cn(
          'cursor-pointer fixed inset-0 z-30 bg-black/45 opacity-0 backdrop-blur-md transition-opacity duration-200 lg:hidden',
          isMobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none'
        )}
        data-slot="navbar-mobile-overlay"
        onClick={() => setIsMobileMenuOpen(false)}
        style={{
          WebkitBackdropFilter: 'blur(12px)',
          backdropFilter: 'blur(12px)'
        }}
      />
      <aside
        aria-label="Mobile navigation"
        className={cn(
          'fixed inset-y-0 right-0 z-50 grid w-[min(86vw,22rem)] grid-rows-[auto_1fr] gap-4 overflow-hidden overscroll-contain border-l border-white/15 bg-[rgba(16,22,36,.78)] p-5 text-white shadow-2xl backdrop-blur-xl transition-transform duration-200 lg:hidden',
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        data-slot="navbar-mobile-menu"
        id={mobileMenuId}
        style={{
          WebkitBackdropFilter: 'blur(24px)',
          backdropFilter: 'blur(24px)'
        }}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 text-base font-semibold">{mobileMenuTitle}</div>
          <button
            aria-label="Close navigation menu"
            className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-current transition-colors hover:bg-current/10 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-current"
            data-slot="navbar-mobile-close"
            onClick={() => setIsMobileMenuOpen(false)}
            type="button">
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <div className="cursor-pointer min-h-0 overflow-y-auto" onClick={() => setIsMobileMenuOpen(false)}>
          {mobileMenu}
        </div>
      </aside>
    </>,
    document.body
  ) : null;

  const renderedChildren = (
    <>
      {children}
      {mobileMenu ? (
        <button
          aria-controls={mobileMenuId}
          aria-expanded={isMobileMenuOpen}
          aria-label={mobileMenuLabel}
          className="ml-auto mr-3 inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-current transition-colors hover:bg-current/10 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-current lg:hidden"
          data-slot="navbar-mobile-trigger"
          onClick={() => setIsMobileMenuOpen((value) => !value)}
          type="button">
          <Menu aria-hidden="true" className="size-5" />
        </button>
      ) : null}
      {mobileMenuPortal}
    </>
  );

  return renderWithAsChild(
    {
      as,
      asChild,
      children: renderedChildren,
      className: cn(
        'flex min-h-14 w-full items-center gap-3 border-b border-border bg-background px-4 text-sm text-foreground sm:px-6',
        isFloating && 'mx-auto mt-4 min-h-16 w-[calc(100%-2rem)] max-w-5xl rounded-full !border !border-border/70 !bg-background/80 px-5 backdrop-blur-md sm:px-6',
        isSticky && !isMobileMenuOpen && (isFloating ? 'sticky top-4 z-40' : 'sticky top-0 z-40'),
        transparentOnScroll && [
          'inset-x-0 z-40 border-transparent bg-transparent text-white transition-[background-color,backdrop-filter,border-color,color] duration-200',
          isFloating ? 'top-4' : 'top-0',
          isSticky && !isMobileMenuOpen ? 'sticky' : 'fixed',
          isFloating
            ? 'data-[scroll-state=scrolled]:!border-border/70 data-[scroll-state=scrolled]:!bg-background/80 data-[scroll-state=scrolled]:text-foreground'
            : 'data-[scroll-state=scrolled]:border-border/70 data-[scroll-state=scrolled]:bg-background/80 data-[scroll-state=scrolled]:text-foreground data-[scroll-state=scrolled]:backdrop-blur-md'
        ],
        className
      ),
      'data-floating': isFloating ? 'true' : undefined,
      'data-mobile-menu-open': isMobileMenuOpen ? 'true' : undefined,
      'data-scroll-state': scrollState,
      'data-sticky': isSticky ? 'true' : undefined,
      'data-transparent-on-scroll': transparentOnScroll ? 'true' : undefined,
      ref,
      style: navbarStyle,
      ...props
    },
    {
      'data-slot': 'navbar'
    }
  );
};
/* eslint-enable react-hooks/rules-of-hooks */

export const NavbarSection = ({
  children,
  className,
  ref,
  ...props
}: NavbarSectionProps) => (
  <div
    className={cn('flex min-w-0 items-center gap-1.5', className)}
    data-slot="navbar-section"
    ref={ref}
    {...props}
  >
    {children}
  </div>
);

export const NavbarItem = ({
  as,
  asChild = false,
  children,
  className,
  current = false,
  href,
  ref,
  type = 'button',
  ...props
}: NavbarItemProps) => {
  const component = as ?? (href ? 'a' : 'button');

  return renderWithAsChild(
    {
      'aria-current': current ? 'page' : undefined,
      as: component,
      asChild,
      children,
      className: cn(
        'group/navbar-item relative inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-2 rounded-md px-3 py-2 font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary data-[current=true]:text-foreground [&>svg]:size-5 [&>svg]:shrink-0',
        current && 'after:absolute after:inset-x-3 after:-bottom-[9px] after:h-0.5 after:rounded-full after:bg-current',
        className
      ),
      'data-current': current ? 'true' : undefined,
      href,
      ref,
      type: href ? undefined : type,
      ...props
    },
    {
      'data-slot': 'navbar-item'
    }
  );
};

export interface NavbarLabelProps extends HTMLAttributes<HTMLSpanElement> {
  readonly ref?: Ref<HTMLSpanElement>;
}

export const NavbarLabel = ({
  className,
  ref,
  ...props
}: NavbarLabelProps) => (
  <span
    className={cn('truncate', className)}
    data-slot="navbar-label"
    ref={ref}
    {...props}
  />
);

export interface NavbarSpacerProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement>;
}

export const NavbarSpacer = ({
  className,
  ref,
  ...props
}: NavbarSpacerProps) => (
  <div
    aria-hidden="true"
    className={cn('min-w-4 flex-1', className)}
    data-slot="navbar-spacer"
    ref={ref}
    {...props}
  />
);

export interface NavbarDividerProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement>;
}

export const NavbarDivider = ({
  className,
  ref,
  ...props
}: NavbarDividerProps) => (
  <div
    aria-hidden="true"
    className={cn('mx-2 h-6 w-px shrink-0 bg-border', className)}
    data-slot="navbar-divider"
    ref={ref}
    {...props}
  />
);
