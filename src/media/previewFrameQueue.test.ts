import {describe, expect, it} from 'vitest';

import {createPreviewFrameQueue} from './previewFrameQueue.js';

const samples = async function *() {
  for(let frame = 0; frame < 20; frame += 1) {
    yield {duration: 0.04, timestamp: frame * 0.04};
  }
};

describe('preview decoded frame lifetime', () => {
  it('keeps retained pixels stable with a canvas ring matching queue capacity', async () => {
    const canvases = Array.from({length: 3}, () => ({pixel: -1}));
    const pooled = async function *() {
      for(let index = 0; index < 20; index += 1) {
        const canvas = canvases[index % canvases.length]!;
        canvas.pixel = index;
        yield {canvas, duration: 1, timestamp: index};
      }
    };
    const queue = createPreviewFrameQueue(pooled(), {capacity: 3});
    await queue.fill();
    for(let index = 0; index < 18; index += 1) {
      const displayed = queue.at(index)!;
      // Background refill must not overwrite the canvas still being displayed.
      // eslint-disable-next-line no-await-in-loop
      await queue.fill();

      expect(displayed.canvas.pixel).toBe(index);
      expect(queue.size).toBeLessThanOrEqual(3);
    }
    queue.destroy();
  });

  it('waits for a delayed frame on the existing iterator without duplicate reads', async () => {
    type Sample = {duration: number; timestamp: number};
    let resolve: (result: IteratorResult<Sample>) => void = () => {};
    let reads = 0;
    const queue = createPreviewFrameQueue({next: async () => {
      reads += 1;
      if(reads === 1) {
        return {done: false, value: {duration: 1, timestamp: 0}};
      }
      return new Promise<IteratorResult<Sample>>((done) => {
        resolve = done;
      });
    }}, {capacity: 2});
    const filling = queue.fill();
    await Promise.resolve();

    expect(queue.at(0.5)?.timestamp).toBe(0);
    expect(queue.fill()).toBe(filling);
    expect(reads).toBe(2);

    resolve({done: false, value: {duration: 1, timestamp: 1}});
    await filling;

    expect(queue.at(1.1)?.timestamp).toBe(1);
    expect(reads).toBe(2);

    queue.destroy();
  });

  it('advances pooled canvases without a native-frame release callback', async () => {
    const queue = createPreviewFrameQueue(samples(), {capacity: 3});
    await queue.fill();

    expect(queue.at(0.05)?.timestamp).toBe(0.04);
    expect(queue.size).toBe(2);

    await queue.fill();

    expect(queue.size).toBe(3);
    expect(queue.at(0.09)?.timestamp).toBe(0.08);

    queue.destroy();

    expect(queue.size).toBe(0);
  });

  it('bounds decoder lookahead and releases superseded frames', async () => {
    const released: number[] = [];
    const queue = createPreviewFrameQueue(samples(), {
      capacity: 4, release: (sample) => released.push(sample.timestamp)
    });
    await queue.fill();

    expect(queue.size).toBe(4);
    expect(queue.at(0.09)?.timestamp).toBe(0.08);
    expect(released).toEqual([0, 0.04]);

    await queue.fill();

    expect(queue.size).toBe(4);

    queue.destroy();

    expect(released).toEqual([0, 0.04, 0.08, 0.12, 0.16, 0.2]);
  });

  it('releases an in-flight decoded frame when a seek cancels its queue', async () => {
    let resolve: (result: IteratorResult<{duration: number; timestamp: number}>) => void = () => {};
    const released: number[] = [];
    type Sample = {duration: number; timestamp: number};
    const queue = createPreviewFrameQueue({next: () => new Promise<IteratorResult<Sample>>((done) => {
      resolve = done;
    })}, {
      capacity: 4, release: (sample) => released.push(sample.timestamp)
    });
    const filling = queue.fill();
    queue.destroy();
    resolve({done: false, value: {duration: 0.04, timestamp: 8}});
    await filling;

    expect(queue.size).toBe(0);
    expect(released).toEqual([8]);
  });
});
