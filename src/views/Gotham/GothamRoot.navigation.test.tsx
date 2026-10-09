import {act, render} from '@nlabs/lex/test-react';
import {createMemoryRouter, RouterProvider} from 'react-router';
import {vi} from 'vitest';

import {GothamConstants} from '../../constants/GothamConstants.js';
import {GothamContext} from '../../utils/GothamContext.js';
import {GothamRoot} from './GothamRoot.js';

const listeners = vi.hoisted(() => new Map<string, (data?: unknown) => void>());
vi.mock('@nlabs/arkhamjs-utils-react', () => ({
  useFluxListener: (event: string, listener: (data?: unknown) => void) => listeners.set(event, listener)
}));
vi.mock('../../components/Notify/Notify.js', () => ({Notify: () => null}));
vi.mock('../LoaderView/LoaderView.js', () => ({LoaderView: () => null}));

it('registered Flux callbacks preserve state and replace the current history entry', async () => {
  const router = createMemoryRouter([{children: [{element: <div>Page</div>, path: '*'}], element: <GothamRoot />, path: '/'}], {
    initialEntries: ['/start', '/about']
  });
  const mounted = render(<GothamContext.Provider value={{Flux: {} as never, awsRum: {track: vi.fn()}}}><RouterProvider router={router} /></GothamContext.Provider>);
  await act(async () => listeners.get(GothamConstants.NAV_GOTO)?.({params: {state: {id: 7}}, path: '/projects'}));
  expect(router.state.location.pathname).toBe('/projects');
  expect(router.state.location.state).toEqual({id: 7});
  await act(async () => listeners.get(GothamConstants.NAV_REPLACE)?.({params: {replace: false, state: {id: 8}}, path: '/support'}));
  expect(router.state.location.pathname).toBe('/support');
  expect(router.state.historyAction).toBe('REPLACE');
  await act(async () => listeners.get(GothamConstants.NAV_BACK)?.());
  expect(router.state.location.pathname).toBe('/about');
  await act(async () => listeners.get(GothamConstants.NAV_FORWARD)?.());
  expect(router.state.location.pathname).toBe('/support');
  expect(router.state.location.state).toEqual({id: 8});
  mounted.unmount();
  router.dispose();
});
