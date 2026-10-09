// @vitest-environment node
import {createElement} from 'react';
import {renderToString} from 'react-dom/server';
import {expect, test, vi} from 'vitest';

import {DocumentHead} from './DocumentHead.js';

test('renders without a document or layout-effect warnings', () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});

  expect(typeof document).toBe('undefined');
  expect(renderToString(createElement(DocumentHead, {metadata: {title: 'Server'}, owner: 'server'}))).toBe('');
  expect(error).not.toHaveBeenCalled();

  error.mockRestore();
});
