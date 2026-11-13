import {act, cleanup, fireEvent, render, screen} from '@nlabs/lex/test-react';
import {createBrowserRouter, Link, useNavigate, useParams} from 'react-router';
import {afterEach, beforeEach, expect, test, vi} from 'vitest';

import {GothamProvider} from './GothamProvider.js';

import type {GothamConfiguration} from './GothamProvider.js';

vi.mock('@nlabs/arkhamjs-utils-react', () => ({useFlux: () => undefined}));
vi.mock('../../actions/GothamActions.js', () => ({GothamActions: {init: vi.fn()}}));
vi.mock('./GothamRoot.js', async () => ({GothamRoot: (await import('react-router')).Outlet}));
vi.mock('react-router', async (original) => {
  const router = await original<typeof import('react-router')>();
  return {...router, createBrowserRouter: vi.fn(router.createBrowserRouter)};
});

const Page = () => {
  const navigate = useNavigate();
  const {bookId} = useParams();
  return <div><p>Book: {bookId ?? 'library'}</p><Link to="/books/next">Next book</Link>
    <button onClick={() => navigate('/books/chosen')}>Choose book</button></div>;
};
const routes: GothamConfiguration['routes'] = [{Component: Page, index: true},
  {Component: Page, path: '*'}, {Component: Page, path: '/books/:bookId'}];
const config = (basename?: string): GothamConfiguration => ({analytics: {interactions: false},
  ...basename === undefined ? {} : {basename}, routes, storageType: false});

beforeEach(() => {
  vi.clearAllMocks();
  window.history.replaceState({}, '', '/');
});

afterEach(() => {
  cleanup();
  window.history.replaceState({}, '', '/');
});

test('basename makes an absolute public Link stay within the configured microsite', async () => {
  window.history.replaceState({}, '', '/writing');
  await act(async () => render(<GothamProvider config={config('/writing')} />));

  expect(screen.getByRole('link', {name: 'Next book'})).toHaveAttribute('href', '/writing/books/next');
});

test('basename preserves absolute useNavigate destinations and deep-link route parameters', async () => {
  window.history.replaceState({}, '', '/writing/books/original');
  await act(async () => render(<GothamProvider config={config('/writing')} />));

  expect(screen.getByText('Book: original')).toBeInTheDocument();

  await act(async () => fireEvent.click(screen.getByRole('button', {name: 'Choose book'})));

  expect(window.location.pathname).toBe('/writing/books/chosen');
  expect(screen.getByText('Book: chosen')).toBeInTheDocument();
});

test('omitting basename preserves root routing', async () => {
  await act(async () => render(<GothamProvider config={config()} />));

  expect(screen.getByRole('link', {name: 'Next book'})).toHaveAttribute('href', '/books/next');

  await act(async () => fireEvent.click(screen.getByRole('button', {name: 'Choose book'})));

  expect(window.location.pathname).toBe('/books/chosen');
});

test('changing basename disposes the old router and unmount disposes its replacement', async () => {
  window.history.replaceState({}, '', '/writing');
  const mounted = await act(async () => render(<GothamProvider config={config('/writing')} />));
  const original = vi.mocked(createBrowserRouter).mock.results[0].value as ReturnType<typeof createBrowserRouter>;
  const dispose = vi.spyOn(original, 'dispose');
  window.history.replaceState({}, '', '/reading');
  await act(async () => mounted.rerender(<GothamProvider config={config('/reading')} />));

  expect(dispose).toHaveBeenCalledOnce();
  expect(screen.getByRole('link', {name: 'Next book'})).toHaveAttribute('href', '/reading/books/next');

  const current = vi.mocked(createBrowserRouter).mock.results.at(-1)!.value as ReturnType<typeof createBrowserRouter>;
  const finalDispose = vi.spyOn(current, 'dispose');
  mounted.unmount();

  expect(finalDispose).toHaveBeenCalledOnce();
});
