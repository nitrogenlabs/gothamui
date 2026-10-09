import {JSDOM} from 'jsdom';
import {createRequire} from 'node:module';
import {describe, expect, it} from 'vitest';

import type DOMPurify from 'dompurify';

const require = createRequire(import.meta.url);
const monacoRequire = createRequire(require.resolve('monaco-editor'));
const createDOMPurify = monacoRequire('dompurify') as typeof DOMPurify;

describe('Monaco sanitizer security', () => {
  it.each(['afterSanitizeElements', 'afterSanitizeAttributes'] as const)(
    'neutralizes detached descendants when %s removes their wrapper', (hook) => {
      const dom = new JSDOM('<!doctype html><body></body>');
      const {document} = dom.window;
      const root = document.createElement('div');
      const wrapper = document.createElement('section');
      const image = document.createElement('img');
      image.setAttribute('onerror', 'window.compromised = true');
      wrapper.append(image);
      root.append(wrapper);
      document.body.append(root);

      const sanitizer = createDOMPurify(dom.window);
      try {
        sanitizer.addHook(hook, (node) => {
          if(node === wrapper) {
            wrapper.remove();
          }
        });
        sanitizer.sanitize(root, {IN_PLACE: true});

        expect(wrapper.parentNode).toBeNull();
        expect(image.hasAttribute('onerror')).toBe(false);
      } finally {
        dom.window.close();
      }
    }
  );
});
