import {describe, expect, it, vi} from 'vitest';

import {previewDuration} from './previewDuration.js';

describe('preview source duration', () => {
  it('uses container metadata without scanning media packets', async () => {
    const input = {computeDuration: vi.fn(async () => 12), getDurationFromMetadata: vi.fn(async () => 10)};

    expect(await previewDuration(input)).toBe(10);
    expect(input.computeDuration).not.toHaveBeenCalled();
  });

  it('computes duration when the container has none', async () => {
    const input = {computeDuration: vi.fn(async () => 12), getDurationFromMetadata: vi.fn(async () => null)};

    expect(await previewDuration(input)).toBe(12);
    expect(input.computeDuration).toHaveBeenCalledTimes(1);
  });

  it('preserves a zero duration rather than treating it as absent', async () => {
    const input = {computeDuration: vi.fn(async () => 12), getDurationFromMetadata: vi.fn(async () => 0)};

    expect(await previewDuration(input)).toBe(0);
    expect(input.computeDuration).not.toHaveBeenCalled();
  });
});
