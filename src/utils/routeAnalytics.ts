import type {GothamRouteAnalytics, GothamRouteAnalyticsSource} from '../types/gotham.js';

export const resolveRouteAnalytics = (
  matches: readonly {readonly handle?: unknown}[],
  pathname: string
): GothamRouteAnalytics | undefined => {
  for(const match of [...matches].reverse()) {
    const source = (match.handle as {readonly analytics?: GothamRouteAnalyticsSource} | undefined)?.analytics;
    const analytics = typeof source === 'function' ? source(pathname) : source;

    if(analytics) {
      return analytics;
    }
  }

  return undefined;
};
