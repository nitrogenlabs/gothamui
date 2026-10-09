import {render} from '@nlabs/lex/test-react';
import {Component, StrictMode} from 'react';
import {expect, test, vi} from 'vitest';

import {DocumentHead} from './DocumentHead.js';

import type {ReactNode} from 'react';

test('StrictMode keeps a single live lease, updates it, changes owner and cleans up', () => {
  document.head.innerHTML = '<title>Base</title>';
  const mounted = render(<StrictMode><DocumentHead metadata={{jsonLd: [{id: 'route', value: {first: true}}], title: 'A'}} owner="A" /></StrictMode>);

  expect(document.title).toBe('A');
  expect(document.querySelectorAll('#route')).toHaveLength(1);

  mounted.rerender(<StrictMode><DocumentHead metadata={{title: 'B'}} owner="A" /></StrictMode>);

  expect(document.title).toBe('B');
  expect(document.getElementById('route')).toBeNull();

  mounted.rerender(<StrictMode><DocumentHead metadata={{title: 'C'}} owner="C" /></StrictMode>);

  expect(document.title).toBe('C');

  mounted.unmount();

  expect(document.title).toBe('Base');
});

test('React rerenders do not promote a lower mounted owner', () => {
  document.title = 'Base';
  const mounted = render(<><DocumentHead metadata={{title: 'A'}} owner="A" /><DocumentHead metadata={{title: 'B'}} owner="B" /></>);
  mounted.rerender(<><DocumentHead metadata={{title: 'A2'}} owner="A" /><DocumentHead metadata={{title: 'B'}} owner="B" /></>);

  expect(document.title).toBe('B');

  mounted.unmount();

  expect(document.title).toBe('Base');
});

class Boundary extends Component<{children: ReactNode}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError = () => ({failed: true});
  render = () => (this.state.failed ? null : this.props.children);
}

test('failed DOM acquisition reaches the boundary without partial head changes', () => {
  document.head.innerHTML = '<title>Base</title><div id="collision"></div>';
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  const mounted = render(<Boundary><DocumentHead metadata={{jsonLd: [{id: 'collision', value: {}}], title: 'Bad'}} owner="bad" /></Boundary>);

  expect(document.title).toBe('Base');
  expect(document.getElementById('collision')?.tagName).toBe('DIV');

  mounted.unmount();
  error.mockRestore();
});
