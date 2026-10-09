import {ChevronLeft, ChevronRight} from 'lucide-react';
import {useCallback, useEffect, useRef, useState} from 'react';

import {Navbar} from '../Navbar/Navbar.js';

import type {ReactNode} from 'react';

export type ScrollableNavbarProps = {
  readonly arrowClassName?: string;
  readonly activeKey?: string;
  readonly ariaLabel: string;
  readonly children: ReactNode;
  readonly className?: string;
  readonly wrapperClassName?: string;
};

type ScrollState = {
  readonly canScrollLeft: boolean;
  readonly canScrollRight: boolean;
  readonly isOverflowing: boolean;
};

const defaultScrollState: ScrollState = {
  canScrollLeft: false,
  canScrollRight: false,
  isOverflowing: false
};

// The existing compatibility hook rule does not recognize typed arrow components.
/* eslint-disable react-hooks/rules-of-hooks */
export const ScrollableNavbar = ({activeKey, ariaLabel, arrowClassName = 'scrollable-navbar-arrow', children, className, wrapperClassName = 'scrollable-navbar'}: ScrollableNavbarProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState(defaultScrollState);

  const getRail = useCallback(() => (
    containerRef.current?.querySelector<HTMLElement>('[data-slot=\'navbar-section\']') || null
  ), []);

  const updateScrollState = useCallback(() => {
    const rail = getRail();

    if(!rail) {
      setScrollState(defaultScrollState);
      return;
    }

    const maxScrollLeft = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const nextState = {
      canScrollLeft: rail.scrollLeft > 2,
      canScrollRight: rail.scrollLeft < maxScrollLeft - 2,
      isOverflowing: maxScrollLeft > 2
    };

    setScrollState((currentState) => (
      currentState.canScrollLeft === nextState.canScrollLeft
      && currentState.canScrollRight === nextState.canScrollRight
      && currentState.isOverflowing === nextState.isOverflowing
        ? currentState
        : nextState
    ));
  }, [getRail]);

  const scrollToAdjacentTab = (direction: -1 | 1) => {
    const rail = getRail();

    if(!rail) {
      return;
    }

    const tabs = Array.from(rail.querySelectorAll<HTMLElement>('[data-slot=\'navbar-item\']'));
    const currentLeft = rail.scrollLeft;
    const target = direction > 0
      ? tabs.find((tab) => tab.offsetLeft > currentLeft + 4)
      : [...tabs].reverse().find((tab) => tab.offsetLeft < currentLeft - 4);
    const targetLeft = target?.offsetLeft ?? (currentLeft + (direction * rail.clientWidth * 0.65));

    rail.scrollTo({behavior: 'smooth', left: Math.max(0, targetLeft)});
  };

  useEffect(() => {
    const rail = getRail();

    if(!rail) {
      updateScrollState();
      return undefined;
    }

    const onScroll = () => updateScrollState();
    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(updateScrollState);

    rail.addEventListener('scroll', onScroll, {passive: true});
    resizeObserver?.observe(rail);
    updateScrollState();

    const activeTab = rail.querySelector<HTMLElement>('[data-slot=\'navbar-item\'].is-active, [data-slot=\'navbar-item\'][aria-current=\'page\']');

    if(activeTab && rail.scrollWidth > rail.clientWidth) {
      rail.scrollTo({
        behavior: 'smooth',
        left: Math.max(0, activeTab.offsetLeft - ((rail.clientWidth - activeTab.clientWidth) / 2))
      });
    }

    return () => {
      rail.removeEventListener('scroll', onScroll);
      resizeObserver?.disconnect();
    };
  }, [activeKey, children, getRail, updateScrollState]);

  return (
    <div
      className={`${wrapperClassName}${scrollState.isOverflowing ? ' is-overflowing' : ''}${scrollState.canScrollLeft ? ' can-scroll-left' : ''}${scrollState.canScrollRight ? ' can-scroll-right' : ''}`}
      ref={containerRef}>
      <Navbar aria-label={ariaLabel} className={className}>
        {children}
      </Navbar>
      {scrollState.canScrollLeft ? (
        <button
          aria-label="Show previous tabs"
          className={`${arrowClassName} is-left`}
          onClick={() => scrollToAdjacentTab(-1)}
          type="button">
          <ChevronLeft aria-hidden="true" size={16} />
        </button>
      ) : null}
      {scrollState.canScrollRight ? (
        <button
          aria-label="Show more tabs"
          className={`${arrowClassName} is-right`}
          onClick={() => scrollToAdjacentTab(1)}
          type="button">
          <ChevronRight aria-hidden="true" size={16} />
        </button>
      ) : null}
    </div>
  );
};

export default ScrollableNavbar;
