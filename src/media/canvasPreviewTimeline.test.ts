import {describe, expect, it} from 'vitest';

import {previewAudioGain, previewAudioReady, previewLayers, previewSourceTime} from './canvasPreviewTimeline.js';

const scenes = [
  {audio: [], end: 4, id: 'first', sourceStart: 2, start: 0, transition: {duration: 1, type: 'dissolve'}},
  {audio: [], end: 7, id: 'next', sourceStart: 10, start: 3}
];

describe('canvas preview composition', () => {
  it('advances both trimmed source clocks during a dissolve', () => {
    const layers = previewLayers(scenes, 3.5);

    expect(layers.map(({opacity, scene}) => [scene.id, opacity, previewSourceTime(scene, 3.5)])).toEqual([
      ['first', 1, 5.5], ['next', 0.5, 10.5]
    ]);
  });

  it('draws one scene at a cut and holds the last frame at the timeline end', () => {
    const cuts = [{...scenes[0]!, transition: undefined}, {...scenes[1]!, start: 4}];

    expect(previewLayers(cuts, 4).map(({scene}) => scene.id)).toEqual(['next']);
    expect(previewLayers(cuts, 7).map(({scene}) => scene.id)).toEqual(['next']);
  });

  it('dips to black at the center of a fade instead of freezing the incoming clip', () => {
    const fading = [{...scenes[0]!, transition: {duration: 1, type: 'fade'}}, scenes[1]!];

    expect(previewLayers(fading, 3.25).map(({opacity}) => opacity)).toEqual([0.5, 0]);
    expect(previewLayers(fading, 3.5).map(({opacity}) => opacity)).toEqual([0, 0]);
    expect(previewLayers(fading, 3.75).map(({opacity}) => opacity)).toEqual([0, 0.5]);
  });
});

describe('preview transition audio', () => {
  it('crossfades audio rather than doubling volume during overlapping scenes', () => {
    expect(previewAudioGain(scenes, ['first'], 3)).toBe(1);
    expect(previewAudioGain(scenes, ['first'], 3.5)).toBe(0.5);
    expect(previewAudioGain(scenes, ['next'], 3.5)).toBe(0.5);
    expect(previewAudioGain(scenes, ['next'], 4)).toBe(1);
  });

  it('keeps a single audio run at full level across contiguous cuts', () => {
    const cuts = [{...scenes[0]!, transition: undefined}, {...scenes[1]!, start: 4}];

    expect(previewAudioGain(cuts, ['first', 'next'], 4)).toBe(1);
  });
});

describe('preview audio buffering', () => {
  it('waits for audio data instead of allowing the picture to silently run ahead', () => {
    expect(previewAudioReady({availableUntil: 2, end: 8, ended: false, start: 0}, 2)).toBe(false);
    expect(previewAudioReady({availableUntil: 2.25, end: 8, ended: false, start: 0}, 2)).toBe(true);
  });

  it('allows silent tails, future audio offsets, and the final buffered fraction', () => {
    expect(previewAudioReady({availableUntil: 2, end: 8, ended: true, start: 0}, 3)).toBe(true);
    expect(previewAudioReady({availableUntil: 0, end: 8, ended: false, start: 4}, 3)).toBe(true);
    expect(previewAudioReady({availableUntil: 8, end: 8, ended: false, start: 0}, 7.95)).toBe(true);
  });
});

describe('independent track composition', () => {
  it('keeps overlapping tracks opaque without turning them into scene transitions', () => {
    const layers = previewLayers([...scenes,
      {audio: [], end: 6, id: 'title', overlay: true, sourceStart: 0, start: 1, text: 'Title'},
      {audio: [], end: 5, id: 'overlay', overlay: true, sourceStart: 2, start: 2}
    ], 3.5);

    expect(layers.map(({opacity, scene}) => [scene.id, opacity])).toEqual([
      ['first', 1], ['next', 0.5], ['title', 1], ['overlay', 1]
    ]);
  });

  it('does not fade independent audio at unrelated scene boundaries', () => {
    const timeline = [...scenes, {audio: [], end: 6, id: 'music', overlay: true, sourceStart: 0, start: 1}];

    expect(previewAudioGain(timeline, ['music'], 3.5)).toBe(1);
    expect(previewAudioGain(timeline, ['music'], 0.5)).toBe(0);
  });
});
