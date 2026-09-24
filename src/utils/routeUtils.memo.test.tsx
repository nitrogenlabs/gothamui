import {render, screen} from '@testing-library/react';
import {memo} from 'react';

import {parseRoutes} from './routeUtils.js';

import type {CustomRouteProps} from './routeUtils.js';

test('renders memoized views supplied directly as route elements', () => {
  const View = memo(({route}: {route: {path: string}}) => <div>{route.path}</div>);
  const routes = parseRoutes([{element: View, path: '/memo-view'}] as unknown as CustomRouteProps[]);
  render(routes[0].element);

  expect(screen.getByText('/memo-view')).toBeInTheDocument();
});
