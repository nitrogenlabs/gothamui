// @vitest-environment node
import {readFileSync} from 'node:fs';
import {expect, test} from 'vitest';

import {renderDocumentHead} from './static.js';

// Walk only runtime imports: the static entry must remain usable without presentation dependencies.
test('static runtime import graph is local, pure and independent of React/browser/router', () => {
  const seen = new Set<string>();
  const visit = (path: string) => {
    if(seen.has(path)) {
      return;
    }
    seen.add(path);
    const source = readFileSync(path, 'utf8');

    expect(source).not.toMatch(/\b(document|window)\b\s*[.[]/);

    for(const match of source.matchAll(/^(?:import(?! type)[^;]*?from|export(?! type)[^;]*?from)\s*['"]([^'"]+)['"]/gm)) {
      expect(match[1]).toMatch(/^\.\//);

      visit(new URL(match[1].replace(/\.js$/, '.ts'), `file://${path}`).pathname);
    }
  };
  visit(new URL('./static.ts', import.meta.url).pathname);

  expect(typeof document).toBe('undefined');
  expect(renderDocumentHead({metadata: {title: 'Node'}, owner: 'node'})).toBe('<title>Node</title>');
});
