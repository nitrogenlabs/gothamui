import {useCallback, useLayoutEffect, useRef} from 'react';

/** Stable callbacks for media subscriptions, compatible with all React 19 releases. */
export const usePlaybackEvent = <Args extends unknown[], Result>(callback: (...args: Args) => Result) => {
  const latest = useRef(callback);
  useLayoutEffect(() => {
    latest.current = callback;
  }, [callback]);
  return useCallback((...args: Args): Result => latest.current(...args), []);
};
