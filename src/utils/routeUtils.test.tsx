import {parseRoutes} from './routeUtils.js';

test('retains callback identity and other handle metadata during parsing', () => {
  const analytics = () => ({route: '/support', title: 'Support', viewId: '/support'});
  const [route] = parseRoutes([{analytics, element: <div>Page</div>, handle: {breadcrumb: 'Contact'}, path: '/contact'}]);

  expect(route.handle).toEqual({analytics, breadcrumb: 'Contact'});
  expect(route.path).toBe('contact');
});
