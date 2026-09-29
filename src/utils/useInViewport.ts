import {useEffect, useState} from 'react';

/** Releases offscreen media, with a fallback for browsers without intersection observation. */
export const useInViewport = (element: HTMLElement | null): boolean => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if(!element) {
      return undefined;
    }
    if(typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)));
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  return visible;
};
