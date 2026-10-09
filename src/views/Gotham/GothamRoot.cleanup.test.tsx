import {Flux} from '@nlabs/arkhamjs';
import {FluxProvider} from '@nlabs/arkhamjs-utils-react';
import {act, render, waitFor} from '@nlabs/lex/test-react';
import {createMemoryRouter, RouterProvider} from 'react-router';
import {StrictMode} from 'react';
import {vi} from 'vitest';

import {GothamConstants} from '../../constants/GothamConstants.js';
import {GothamContext} from '../../utils/GothamContext.js';
import {GothamRoot} from './GothamRoot.js';
import {GothamProvider} from './GothamProvider.js';

vi.mock('../../components/Notify/Notify.js', () => ({Notify: () => null}));
vi.mock('../LoaderView/LoaderView.js', () => ({LoaderView: () => null}));

it('real Flux navigation subscriptions stop navigating after unmount', async () => {
  await Flux.init({name: 'routing-cleanup', stores: []});
  const router = createMemoryRouter([{children: [{element: <div>Page</div>, path: '*'}], element: <GothamRoot />, path: '/'}]);
  const mounted = render(<FluxProvider flux={Flux}><GothamContext.Provider value={{Flux, awsRum: {track: vi.fn()}}}><RouterProvider router={router} /></GothamContext.Provider></FluxProvider>);
  await act(async () => {await Flux.dispatch({path: '/about', type: GothamConstants.NAV_GOTO});});
  expect(router.state.location.pathname).toBe('/about');
  mounted.unmount();
  await Flux.dispatch({path: '/support', type: GothamConstants.NAV_GOTO});
  expect(router.state.location.pathname).toBe('/about');
  router.dispose();
});

it('provider releases queue, signout and session subscriptions after unmount', async () => {
  await Flux.init({name: 'routing-provider-cleanup', stores: []});
  const events = [GothamConstants.NAV_GOTO, GothamConstants.SIGN_OUT, GothamConstants.UPDATE_SESSION];
  const counts = () => events.map((event) => Flux.listenerCount(event));
  const before = counts();
  const mounted = render(<FluxProvider flux={Flux}><GothamProvider config={{analytics: {interactions: false}, awsRum: {track: vi.fn()}, routes: [{element: <div>Ready</div>, path: '*'}]}} /></FluxProvider>);
  await waitFor(() => expect(counts()[0]).toBe(before[0] + 2));
  mounted.unmount();
  expect(counts()).toEqual(before);
});

it('releases browser history listeners and aborts pending navigation in StrictMode', async () => {
  const active = new Set<EventListenerOrEventListenerObject>();
  const originalAdd = window.addEventListener.bind(window);
  const originalRemove = window.removeEventListener.bind(window);
  vi.spyOn(window, 'addEventListener').mockImplementation((type, listener, options) => {
    if(type === 'popstate' && listener) active.add(listener);
    originalAdd(type, listener, options);
  });
  vi.spyOn(window, 'removeEventListener').mockImplementation((type, listener, options) => {
    if(type === 'popstate' && listener) active.delete(listener);
    originalRemove(type, listener, options);
  });
  window.history.replaceState({}, '', '/');
  await Flux.init({name: 'routing-disposal', stores: []});
  let signal: AbortSignal | undefined;
  const routes = [{element: <div>Ready</div>, path: '/'}, {element: <div>Slow</div>, loader: ({request}: {request: Request}) => {
    signal = request.signal;
    return new Promise(() => undefined);
  }, path: '/slow'}];
  const config = {analytics: {interactions: false}, awsRum: {track: vi.fn()}, routes};
  const mounted = render(<StrictMode><FluxProvider flux={Flux}><GothamProvider config={config} /></FluxProvider></StrictMode>);
  await waitFor(() => expect(active.size).toBe(1));
  await waitFor(() => expect(Flux.listenerCount(GothamConstants.NAV_GOTO)).toBe(2));
  const previousListener = [...active][0];
  mounted.rerender(<StrictMode><FluxProvider flux={Flux}><GothamProvider config={{...config, awsRum: {track: vi.fn()}}} /></FluxProvider></StrictMode>);
  expect(active.size).toBe(1);
  expect(active.has(previousListener)).toBe(true);
  mounted.rerender(<StrictMode><FluxProvider flux={Flux}><GothamProvider config={{...config, routes: [...routes]}} /></FluxProvider></StrictMode>);
  await waitFor(() => expect(active.size).toBe(1));
  expect(active.has(previousListener)).toBe(false);
  await act(async () => {await Flux.dispatch({path: '/slow', type: GothamConstants.NAV_GOTO});});
  await waitFor(() => expect(signal).toBeDefined());
  mounted.unmount();
  expect(signal?.aborted).toBe(true);
  expect(active.size).toBe(0);
  vi.restoreAllMocks();
});
