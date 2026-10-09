/* @vitest-environment jsdom */
import {render} from '@nlabs/lex/test-react';
import {beforeEach, vi} from 'vitest';

import {GothamContext} from '../../utils/GothamContext.js';

const location = {
  hash: '',
  pathname: '/home',
  search: '',
  state: undefined
};
let matches: Array<{handle?: Record<string, unknown>}> = [];

vi.mock('@nlabs/arkhamjs-utils-react', () => ({
  useFluxListener: vi.fn()
}));

vi.mock('react-router', () => ({
  Outlet: () => <div data-testid="outlet" />,
  useLocation: () => location,
  useMatches: () => matches,
  useNavigate: () => vi.fn()
}));

vi.mock('../../components/Notify/Notify.js', () => ({Notify: () => null}));
vi.mock('../LoaderView/LoaderView.js', () => ({LoaderView: () => null}));

const {GothamRoot} = await import('./GothamRoot.js');

beforeEach(() => {
  location.hash = '';
  location.pathname = '/home';
  location.search = '';
  matches = [];
});

describe('GothamRoot analytics', () => {
  it('calls awsRum.track once for each distinct sanitized route', () => {
    const awsRum = {track: vi.fn()};
    document.title = 'Gotham';
    const value = {Flux: {} as any, awsRum};
    const {rerender} = render(
      <GothamContext.Provider value={value}>
        <GothamRoot />
      </GothamContext.Provider>
    );

    expect(awsRum.track).toHaveBeenCalledWith({
      name: 'page_view',
      path: '/home',
      properties: {title: 'Gotham', viewId: '/home'},
      type: 'page_view'
    });

    location.search = '?token=private';
    rerender(
      <GothamContext.Provider value={value}>
        <GothamRoot />
      </GothamContext.Provider>
    );

    expect(awsRum.track).toHaveBeenCalledTimes(1);

    location.pathname = '/docs';
    rerender(
      <GothamContext.Provider value={value}>
        <GothamRoot />
      </GothamContext.Provider>
    );

    expect(awsRum.track).toHaveBeenLastCalledWith(expect.objectContaining({path: '/docs'}));
  });

  it('uses stable analytics metadata instead of a dynamic pathname or title', () => {
    const awsRum = {track: vi.fn()};
    matches = [{handle: {analytics: {route: '/stories/:storyId', title: 'Story', viewId: 'story.detail'}}}];
    location.pathname = '/stories/private-story-id';

    render(<GothamContext.Provider value={{Flux: {} as any, awsRum}}><GothamRoot /></GothamContext.Provider>);

    expect(awsRum.track).toHaveBeenCalledWith({
      name: 'page_view',
      path: '/stories/:storyId',
      properties: {title: 'Story', viewId: 'story.detail'},
      type: 'page_view'
    });

    matches = [];
  });
});

it('tracks resolved aliases, fallback and each project while excluding query/hash-only changes', () => {
  const awsRum = {track: vi.fn()};
  matches = [{handle: {analytics: (pathname: string) => {
    const route = pathname === '/contact' ? '/support' : pathname.startsWith('/projects/') ? pathname : '/';
    return {route, title: 'Resolved title', viewId: route};
  }}}, {handle: {analytics: () => undefined}}];
  location.pathname = '/contact';
  const node = <GothamContext.Provider value={{Flux: {} as never, awsRum}}><GothamRoot /></GothamContext.Provider>;
  const {rerender} = render(node);
  expect(awsRum.track).toHaveBeenLastCalledWith(expect.objectContaining({path: '/support', properties: {title: 'Resolved title', viewId: '/support'}}));
  for(const pathname of ['/projects/a', '/projects/b', '/unknown']) {
    location.pathname = pathname;
    rerender(<GothamContext.Provider value={{Flux: {} as never, awsRum}}><GothamRoot /></GothamContext.Provider>);
  }
  expect(awsRum.track.mock.calls.map(([event]) => event.path)).toEqual(['/support', '/projects/a', '/projects/b', '/']);
  location.pathname = '/another-unknown';
  location.hash = '#programs';
  location.search = '?private=secret';
  rerender(<GothamContext.Provider value={{Flux: {} as never, awsRum}}><GothamRoot /></GothamContext.Provider>);
  expect(awsRum.track).toHaveBeenCalledTimes(4);
});
