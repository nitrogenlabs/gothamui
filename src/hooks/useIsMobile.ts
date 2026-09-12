import {useSyncExternalStore} from 'react';

const query = '(max-width: 768px)';
const getSnapshot = () => window.matchMedia(query).matches;
const getServerSnapshot = () => false;
const subscribe = (listener: () => void) => {
  const mediaQuery = window.matchMedia(query);
  mediaQuery.addEventListener('change', listener);
  return () => mediaQuery.removeEventListener('change', listener);
};

export const useIsMobile = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
