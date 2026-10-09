/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import {act, cleanup, fireEvent, render, screen} from '@testing-library/react';
import {useLayoutEffect} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {NavbarItem, NavbarSection} from '../Navbar/Navbar.js';
import {ScrollableNavbar} from './ScrollableNavbar.js';

let width = 100;
let totalWidth = 400;
const scrollTo = vi.fn();
const disconnect = vi.fn();
const observe = vi.fn();
let resize: (() => void) | undefined;
const Measurements = ({offsets}: {readonly offsets: number[]}) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Compatibility rule misses typed arrow fixture components.
  useLayoutEffect(() => {
    const section = document.querySelector<HTMLElement>('[data-slot=\'navbar-section\']')!;
    Object.defineProperties(section, {
      clientWidth: {configurable: true, get: () => width},
      scrollTo: {configurable: true, value: scrollTo},
      scrollWidth: {configurable: true, get: () => totalWidth}
    });
    section.querySelectorAll<HTMLElement>('[data-slot=\'navbar-item\']').forEach((tab, index) => {
      Object.defineProperties(tab, {
        clientWidth: {configurable: true, get: () => 80},
        offsetLeft: {configurable: true, get: () => offsets[index]}
      });
    });
  }, [offsets]);
  return null;
};
const renderRail = (active = '', offsets = [0, 100, 200, 300]) => render(
  <ScrollableNavbar activeKey={active} ariaLabel="Test tabs">
    <NavbarSection>
      {offsets.map((_, index) => (
        <NavbarItem current={active === String(index)} key={index} type="button">Tab {index + 1}</NavbarItem>
      ))}
    </NavbarSection>
    <Measurements offsets={offsets} />
  </ScrollableNavbar>
);
const rail = () => document.querySelector<HTMLElement>('[data-slot=\'navbar-section\']')!;
const moveTo = (left: number) => {
  rail().scrollLeft = left;
  fireEvent.scroll(rail());
};

beforeEach(async () => {
  width = 100;
  totalWidth = 400;
  scrollTo.mockReset();
  disconnect.mockReset();
  observe.mockReset();
  resize = undefined;
  vi.stubGlobal('ResizeObserver', class {
    disconnect = disconnect;
    observe = observe;
    unobserve = vi.fn();
    constructor(callback: () => void) {
      resize = callback;
    }
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('ScrollableNavbar integration', () => {
  it('renders the real Gotham rail with accessible tabs and its forward arrow', () => {
    renderRail();

    expect(screen.getByRole('navigation', {name: 'Test tabs'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Tab 1'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Show more tabs'})).toBeVisible();
    expect(screen.queryByRole('button', {name: 'Show previous tabs'})).not.toBeInTheDocument();
    expect(observe).toHaveBeenCalledWith(rail());
  });

  it('scrolls forward and back to adjacent tabs', () => {
    renderRail();
    fireEvent.click(screen.getByRole('button', {name: 'Show more tabs'}));

    expect(scrollTo).toHaveBeenLastCalledWith({behavior: 'smooth', left: 100});

    moveTo(220);
    fireEvent.click(screen.getByRole('button', {name: 'Show previous tabs'}));

    expect(scrollTo).toHaveBeenLastCalledWith({behavior: 'smooth', left: 200});
  });

  it('hides arrows at the corresponding ends of the rail', () => {
    renderRail();
    moveTo(300);

    expect(screen.queryByRole('button', {name: 'Show more tabs'})).not.toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Show previous tabs'})).toBeVisible();

    moveTo(0);

    expect(screen.queryByRole('button', {name: 'Show previous tabs'})).not.toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Show more tabs'})).toBeVisible();
  });

  it.each([0, 2])('centers the selected tab %i without scrolling below zero', (selected) => {
    renderRail(String(selected));

    expect(scrollTo).toHaveBeenCalledWith({behavior: 'smooth', left: Math.max(0, (selected * 100) - 10)});
  });

  it('updates overflow after resizing and removes arrows when content fits', () => {
    renderRail();
    width = 500;
    act(() => resize!());

    expect(screen.queryByRole('button', {name: 'Show more tabs'})).not.toBeInTheDocument();
    expect(document.querySelector('.scrollable-navbar')).not.toHaveClass('is-overflowing');

    width = 100;
    act(() => resize!());

    expect(screen.getByRole('button', {name: 'Show more tabs'})).toBeVisible();

    act(() => resize!());

    expect(screen.getByRole('button', {name: 'Show more tabs'})).toBeVisible();
  });

  it('does not scroll a selected tab when all content fits', () => {
    totalWidth = width;
    renderRail('1');

    expect(scrollTo).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', {name: 'Show more tabs'})).not.toBeInTheDocument();
  });

  it('uses a partial viewport when no adjacent tab exists', () => {
    renderRail('', [0]);
    fireEvent.click(screen.getByRole('button', {name: 'Show more tabs'}));

    expect(scrollTo).toHaveBeenLastCalledWith({behavior: 'smooth', left: 65});

    moveTo(3);
    fireEvent.click(screen.getByRole('button', {name: 'Show previous tabs'}));

    expect(scrollTo).toHaveBeenLastCalledWith({behavior: 'smooth', left: 0});
  });

  it('renders children safely when no tab section is present', () => {
    render(<ScrollableNavbar ariaLabel="Simple tabs"><button type="button">Plans</button></ScrollableNavbar>);

    expect(screen.getByRole('button', {name: 'Plans'})).toBeVisible();
    expect(screen.queryByRole('button', {name: 'Show more tabs'})).not.toBeInTheDocument();
    expect(observe).not.toHaveBeenCalled();
  });

  it('works without ResizeObserver and removes its scroll listener on unmount', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    const view = renderRail();
    const remove = vi.spyOn(rail(), 'removeEventListener');
    moveTo(50);
    view.unmount();

    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('disconnects its observer on unmount', () => {
    const view = renderRail();
    const queuedResize = resize!;
    view.unmount();

    expect(disconnect).toHaveBeenCalled();
    expect(() => queuedResize()).not.toThrow();
  });
});

describe('dynamic rail lifecycle and class contract', () => {
  it('updates centering for a changed active key', () => {
    const view = renderRail('0');
    scrollTo.mockClear();
    view.rerender(
      <ScrollableNavbar activeKey="2" ariaLabel="Test tabs">
        <NavbarSection><NavbarItem type="button">First</NavbarItem><NavbarItem current type="button">Second</NavbarItem></NavbarSection>
        <Measurements offsets={[0, 200]} />
      </ScrollableNavbar>
    );

    expect(scrollTo).toHaveBeenCalledWith({behavior: 'smooth', left: 190});
    expect(disconnect).toHaveBeenCalled();
  });

  it('releases the old rail and clears arrows when content removes the section', () => {
    const view = renderRail();
    const oldRail = rail();
    const remove = vi.spyOn(oldRail, 'removeEventListener');
    view.rerender(<ScrollableNavbar ariaLabel="Test tabs"><span>Plain content</span></ScrollableNavbar>);

    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(disconnect).toHaveBeenCalled();
    expect(screen.queryByRole('button', {name: 'Show more tabs'})).not.toBeInTheDocument();
  });

  it('preserves consumer classes and keyboard focus without changing item schema', () => {
    render(
      <ScrollableNavbar ariaLabel="Classes" arrowClassName="app-arrow" className="app-navbar" wrapperClassName="app-wrapper">
        <NavbarSection><NavbarItem type="button">First</NavbarItem></NavbarSection>
        <Measurements offsets={[0]} />
      </ScrollableNavbar>
    );
    const arrow = screen.getByRole('button', {name: 'Show more tabs'});
    arrow.focus();

    expect(arrow).toHaveFocus();
    expect(arrow).toHaveClass('app-arrow', 'is-right');
    expect(screen.getByRole('navigation', {name: 'Classes'})).toHaveClass('app-navbar');
    expect(document.querySelector('.app-wrapper')).toHaveClass('is-overflowing');
  });

  it.each([0, -5, 2])('does not expose overflow for maximum bound %s', (bound) => {
    totalWidth = width + bound;
    renderRail();

    expect(screen.queryByRole('button', {name: 'Show more tabs'})).not.toBeInTheDocument();
    expect(document.querySelector('.scrollable-navbar')).not.toHaveClass('is-overflowing');
  });
});
