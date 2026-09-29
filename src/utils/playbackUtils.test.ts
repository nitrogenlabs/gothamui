import {expect, test} from 'vitest';

import {formatPlaybackTime, playbackRatioPresets} from './playbackUtils.js';

test('formats safe clocks and exposes standard frame ratios', () => {
  expect(formatPlaybackTime(65.9)).toBe('01:05');
  expect(formatPlaybackTime(-1)).toBe('00:00');
  expect(formatPlaybackTime(Infinity)).toBe('00:00');
  expect(formatPlaybackTime(NaN)).toBe('00:00');
  expect(playbackRatioPresets).toHaveLength(6);
});
