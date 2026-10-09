import {describe, expect, it} from 'vitest';

import * as video from './index.js';

describe('custom timeline engine public API', () => {
  it('exposes the engine for application-owned controls and poster capture', () => {
    expect(video.createCanvasPreview).toBeTypeOf('function');
  });

  it('exposes the compositor for transition swatches', () => {
    expect(video.paintTransition).toBeTypeOf('function');
  });
});
