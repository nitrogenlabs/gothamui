import type {RouteProps} from 'react-router';

export interface GothamRouteAnalytics {
  readonly route?: string;
  readonly title?: string;
  readonly viewId: string;
}

export type GothamRouteAnalyticsSource =
  | GothamRouteAnalytics
  | ((pathname: string) => GothamRouteAnalytics | undefined);

export type GothamRouteData = Omit<RouteProps, 'children'> & {
  readonly analytics?: GothamRouteAnalyticsSource;
  readonly authenticate?: boolean;
  // readonly component?: any;
  // readonly container?: 'default' | 'menu';
  // readonly exact?: boolean;
  // readonly isAuth?: () => boolean;
  // readonly location?: Location;
  // readonly name?: string;
  // readonly path?: string;

  readonly props?: any;

  readonly children?: GothamRouteData[];
  readonly index?: boolean;
  // readonly sensitive?: boolean;
  // readonly strict?: boolean;
  // readonly title?: string;
  // readonly view?: 'confirm' | 'default'| 'home' | 'markdown' | 'menu' | 'signIn' | 'notfound';
};
