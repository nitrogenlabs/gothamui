import {useFlux} from '@nlabs/arkhamjs-utils-react';
import {act, render, waitFor} from '@testing-library/react';
import {createBrowserRouter} from 'react-router';

import {GothamConstants} from '../../constants/GothamConstants.js';
import {defaultGothamConfig, GothamProvider} from './GothamProvider.js';

vi.mock('@nlabs/arkhamjs-utils-react', () => ({useFlux: vi.fn()}));
vi.mock('../../actions/GothamActions.js', () => ({GothamActions: {init: vi.fn()}}));
vi.mock('../../utils/navEventQueue.js', () => ({registerFlux: vi.fn()}));
vi.mock('react-router', async (importOriginal) => ({
  ...await importOriginal<typeof import('react-router')>(),
  RouterProvider: vi.fn(() => <div>Router</div>),
  createBrowserRouter: vi.fn(() => ({}))
}));

test('keeps the router and initialization stable across session and parent updates', async () => {
  const listeners = new Map<string, (data: unknown) => void>();
  const flux = {
    addMiddleware: vi.fn(),
    addStores: vi.fn(async () => {}),
    isInit: true,
    on: vi.fn((event, listener) => {
      listeners.set(event, listener);
    })
  };
  vi.mocked(useFlux).mockReturnValue(flux as never);
  const config = {analytics: {interactions: false}, app: {name: 'isolated-app'}, routes: []};
  const originalName = defaultGothamConfig.app?.name;
  const {rerender} = render(<GothamProvider config={config} />);
  await waitFor(() => expect(listeners.has(GothamConstants.UPDATE_SESSION)).toBe(true));
  const routerCount = vi.mocked(createBrowserRouter).mock.calls.length;
  const setupCount = flux.addStores.mock.calls.length;
  act(() => listeners.get(GothamConstants.UPDATE_SESSION)!({session: {userId: 'one'}}));
  rerender(<GothamProvider config={config} />);

  expect(createBrowserRouter).toHaveBeenCalledTimes(routerCount);
  expect(flux.addStores).toHaveBeenCalledTimes(setupCount);
  expect(defaultGothamConfig.app?.name).toBe(originalName);
});
