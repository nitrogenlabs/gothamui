/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {throttle} from '@nlabs/utils';
import {useEffect, useMemo, useState} from 'react';

const getCurrentBreakpoint = (setBreakpoint) => (): void => {
  const breakpoints = {
    values: {
      lg: 1200,
      md: 900,
      sm: 600,
      xl: 1536
    }
  };
  const {values: {lg, md, sm, xl}} = breakpoints;
  const {innerWidth} = window;

  if(innerWidth < sm) {
    setBreakpoint(0);
  } else if(innerWidth < md) {
    setBreakpoint(1);
  } else if(innerWidth < lg) {
    setBreakpoint(2);
  } else if(innerWidth < xl) {
    setBreakpoint(3);
  } else {
    setBreakpoint(4);
  }
};

const breakpointValues = ['xs', 'sm', 'md', 'lg', 'xl'];

export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState(0);

  useEffect(() => {
    const onResizeBreakpoint = getCurrentBreakpoint(setBreakpoint);
    const onResize = throttle(onResizeBreakpoint, 100);

    // Inital sizing
    onResizeBreakpoint();

    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, []);

  return useMemo(() => ({
    at: (size: string): boolean => size === breakpointValues[breakpoint],
    down: (size: string): boolean => breakpointValues.indexOf(size) >= breakpoint,
    up: (size: string): boolean => breakpointValues.indexOf(size) <= breakpoint,
    value: (): string => breakpointValues[breakpoint]
  }), [breakpoint]);
};
