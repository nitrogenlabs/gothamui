/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {Flux} from '@nlabs/arkhamjs';
import React from 'react';
import {Outlet, redirect} from 'react-router';

import {AuthRoute} from '../components/AuthRoute/AuthRoute.js';
import {Config} from '../config/appConfig.js';

import type {RouteObject} from 'react-router';


// Define a type for our custom route objects
export type CustomRouteProps = RouteObject & {
  readonly analytics?: {
    readonly route?: string;
    readonly title?: string;
    readonly viewId: string;
  };
  readonly authenticate?: boolean;
  readonly props?: Record<string, unknown>;
  readonly routes?: CustomRouteProps[];
}

export const parseRoutes = (routes: CustomRouteProps[] = [], parentPath = ''): RouteObject[] => routes.map((route) => {
  const {
    analytics,
    authenticate,
    element,
    props,
    ...standardRouteProps
  } = route;

  const nestedRoutes = (route as any).routes || (route as any).children;
  const currentPath = typeof standardRouteProps.path === 'string'
    ? standardRouteProps.path.replace(/^\//, '')
    : '';
  const fullPath = parentPath ? (parentPath + (currentPath ? `/${currentPath}` : '')) : currentPath;
  const authRoute = (Config.get('authRoute') as string) || '/signIn';
  let routeElement = element;

  if(React.isValidElement(element)) {
    routeElement = React.cloneElement(element, {route} as any);
  } else if(typeof element === 'function' || (
    element !== null
    && typeof element === 'object'
    && '$$typeof' in element
    && element.$$typeof === Symbol.for('react.memo')
  )) {
    routeElement = React.createElement(element as any, {route});
  }

  let authFlag = authenticate;

  if(authFlag === undefined && React.isValidElement(element)) {
    const elemProps: any = (element as React.ReactElement).props;
    authFlag = Boolean(elemProps && (elemProps.authenticate || (elemProps.route && elemProps.route.authenticate)));
  }

  if(authFlag) {
    if(!routeElement) {
      routeElement = <AuthRoute><Outlet/></AuthRoute>;
    } else {
      routeElement = <AuthRoute>{routeElement}</AuthRoute>;
    }
  }

  const normalizedChildren = nestedRoutes?.length
    ? nestedRoutes.map((child) => {
      let childPath = typeof child.path === 'string' ? child.path.replace(/^\/*/, '') : child.path;

      if(fullPath && typeof childPath === 'string') {
        const prefix = `${fullPath}/`;
        if(childPath.startsWith(prefix)) {
          childPath = childPath.replace(new RegExp(`^${prefix}`), '');
        }
      }

      return {
        ...child,
        path: childPath
      };
    })
    : undefined;

  const loader = (route as any).loader || (authFlag ? makeRequireAuthLoader(authRoute) : undefined);
  const handle = analytics ? {...(standardRouteProps.handle || {}), analytics} : standardRouteProps.handle;

  if(normalizedChildren?.length) {
    return {
      ...standardRouteProps,
      authenticate: authFlag,
      children: parseRoutes(normalizedChildren as CustomRouteProps[], fullPath),
      element: routeElement,
      handle,
      loader,
      path: currentPath || standardRouteProps.path
    } as any;
  }

  return {
    ...standardRouteProps,
    authenticate: authFlag,
    element: routeElement,
    handle,
    loader,
    path: currentPath || standardRouteProps.path
  } as any;
});

const makeRequireAuthLoader = (authRoute: string): any => async ({request}: {request: Request}) => {
  let token: string | undefined;

  try {
    if(Flux && typeof Flux.getState === 'function') {
      token = Flux.getState(['user', 'session', 'token']) as string || Flux.getState(['session', 'token']) as string || Flux.getState(['user', 'token']) as string;
    }
  } catch(_e) {
    // ignore errors accessing Flux
  }

  const isAuthFn = Config.get('isAuth', () => false) as () => boolean;
  const sessionAuth = Boolean(token) || (isAuthFn && isAuthFn());

  if(!sessionAuth) {
    const url = new URL(request.url);
    const redirectParam = encodeURIComponent(`${url.pathname}${url.search}${url.hash}`);

    return redirect(`${authRoute}?redirect=${redirectParam}`);
  }

  return null;
};
