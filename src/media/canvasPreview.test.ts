import {afterEach, describe, expect, it, vi} from 'vitest';

import {createCanvasPreview} from '../video/index.js';

import type {PreviewScene} from './canvasPreview.js';

const setup = (scenes?: PreviewScene[]) => {
  const clock = {time: 0};
  const contexts: unknown[] = [];
  let frame: () => void = () => {};
  let resume: () => void = () => {};
  const requestedImages: string[] = [];
  const resumeRequests: Promise<void>[] = [];
  vi.stubGlobal('AudioContext', class {
    destination = {};
    constructor() {
      contexts.push(this);
    }
    get currentTime() {
      return clock.time;
    }
    close = async () => {};
    createGain = () => ({connect: () => {}, disconnect: () => {}, gain: {value: 1}});
    resume = () => {
      const request = new Promise<void>((resolve) => {
        resume = resolve;
      });
      resumeRequests.push(request);
      return request;
    };
  });
  vi.stubGlobal('Image', class {
    complete = true;
    failed = false;
    naturalHeight = 1;
    naturalWidth = 1;
    set src(url: string) {
      requestedImages.push(url);
      this.complete = url !== '/pending.png';
      this.failed = url === '/broken.png';
    }
    removeAttribute = () => {};
    decode = async () => {
      if(this.failed) {
        throw new Error('Future image unavailable');
      }
      if(!this.complete) {
        await new Promise(() => {});
      }
    };
  });
  vi.stubGlobal('cancelAnimationFrame', () => {});
  vi.stubGlobal('requestAnimationFrame', (callback: () => void) => {
    frame = callback;
    return 1;
  });
  const draws = vi.fn();
  const canvas = {dataset: {},
    getContext: () => ({beginPath: () => {}, clip: () => {}, drawImage: draws, fillRect: () => {},
      rect: () => {}, restore: () => {}, save: () => {}, scale: () => {}, translate: () => {}})
  } as unknown as HTMLCanvasElement;
  const states: {buffering: boolean; error?: string; ready: boolean}[] = [];
  const engine = createCanvasPreview({canvas, onEnded: () => {}, onMetadata: () => {}, onPosition: () => {},
    onState: (state) => states.push(state), scenes: scenes || [{audio: [], end: 5, id: 'image', sourceStart: 0, start: 0,
      visual: {assetId: 'image', kind: 'image', url: '/frame.png'}}]});
  return {clock, contexts, draws, engine, frame: () => frame(), requestedImages,
    resume: () => resume(), resumeRequests, states};
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('canvas playback lifecycle', () => {
  it('only repaints changed visuals while keeping the clock live, and redraws after resizing', async () => {
    const {clock, draws, engine, frame, resume} = setup();
    await engine.prepare(0);
    const playing = engine.play();
    resume();
    await playing;
    for(const time of [0.01, 0.02, 0.03, 0.04]) {
      clock.time = time;
      frame();
    }

    expect(draws).toHaveBeenCalledTimes(1);

    engine.setRatio(1);

    expect(draws).toHaveBeenCalledTimes(2);

    engine.destroy();
  });

  it('repaints both still images throughout a dissolve even when the source pixels stay unchanged', async () => {
    const {clock, draws, engine, frame, resume} = setup([
      {audio: [], end: 3, id: 'a', sourceStart: 0, start: 0, transition: {duration: 1, type: 'dissolve'},
        visual: {assetId: 'a', kind: 'image', url: '/a.png'}},
      {audio: [], end: 5, id: 'b', sourceStart: 0, start: 2,
        visual: {assetId: 'b', kind: 'image', url: '/b.png'}}
    ]);
    await engine.prepare(2.1);
    const playing = engine.play();
    resume();
    await playing;
    const before = draws.mock.calls.length;
    clock.time = 0.1;
    frame();
    clock.time = 0.2;
    frame();

    expect(draws.mock.calls.length - before).toBe(4);

    engine.destroy();
  });

  it('constructs the audio clock while preparing but resumes only on Play', async () => {
    const {contexts, engine, resume, resumeRequests} = setup();
    await engine.prepare(0);

    expect(contexts).toHaveLength(1);
    expect(resumeRequests).toHaveLength(0);

    const playing = engine.play();

    expect(contexts).toHaveLength(1);
    expect(resumeRequests).toHaveLength(1);

    resume();
    await playing;
    engine.destroy();
  });

  it('keeps a future preparation failure out of the current scene and reports it when selected', async () => {
    const {engine, states} = setup([0, 1].map((index) => ({
      audio: [], end: (index + 1) * 3, id: `image-${index}`, sourceStart: 0, start: index * 3,
      visual: {assetId: `image-${index}`, kind: 'image', url: index ? '/broken.png' : '/first.png'}
    })));
    await engine.prepare(0);

    expect(states.at(-1)).toMatchObject({buffering: false, error: undefined, ready: true});
    await expect(engine.seek(3)).rejects.toThrow('Future image unavailable');
    expect(states.at(-1)).toMatchObject({error: 'Future image unavailable', ready: false});

    engine.destroy();
  });

  it('prepares the first frame without waiting for a slow future image', async () => {
    const {engine, requestedImages, states} = setup([0, 1].map((index) => ({
      audio: [], end: (index + 1) * 3, id: `image-${index}`, sourceStart: 0, start: index * 3,
      visual: {assetId: `image-${index}`, kind: 'image', url: index ? '/pending.png' : '/first.png'}
    })));
    void engine.prepare(0);
    try {
      await vi.waitFor(() => expect(states.at(-1)).toMatchObject({buffering: false, ready: true}), {timeout: 150});

      expect(requestedImages).toEqual(['/first.png', '/pending.png']);
    } finally {
      engine.destroy();
    }
  });

  it('clears the buffering indicator when pausing a prepared but starved preview', async () => {
    const {clock, engine, frame, resume, states} = setup([0, 1, 2].map((index) => ({
      audio: [], end: (index + 1) * 3, id: `image-${index}`, sourceStart: 0, start: index * 3,
      visual: {assetId: `image-${index}`, kind: 'image', url: index === 2 ? '/pending.png' : `/frame-${index}.png`}
    })));
    await engine.prepare(0);
    const playing = engine.play();
    resume();
    await playing;
    clock.time = 6.01;
    frame();

    expect(states.at(-1)).toMatchObject({buffering: true, ready: true});

    engine.pause();

    expect(states.at(-1)).toMatchObject({buffering: false, ready: true});

    engine.destroy();
  });

  it('does not request media after destruction while audio activation is pending', async () => {
    const {engine, requestedImages, resume, states} = setup();
    const playing = engine.play();
    engine.destroy();
    resume();
    await playing;

    expect(requestedImages).toEqual([]);
    expect(states).toEqual([]);
  });

  it('shares pending activation instead of creating another unhandled resume request', async () => {
    const {engine, resume, resumeRequests} = setup();
    const first = engine.play();
    const duplicate = engine.play();
    engine.destroy();
    resume();

    expect(first).toBe(duplicate);
    expect(resumeRequests).toHaveLength(1);

    await first;
  });
});
