import {act, cleanup, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, expect, test, vi} from 'vitest';

import {PlaybackControlsExample} from './PlaybackControlsExample.js';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

test('wires shared controls to a native custom player', async () => {
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(async function(this: HTMLMediaElement) {
    fireEvent.play(this);
  });
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function(this: HTMLMediaElement) {
    fireEvent.pause(this);
  });
  render(<PlaybackControlsExample src="/sample.mp4" />);
  const video = screen.getByLabelText('Custom player media') as HTMLVideoElement;
  Object.defineProperty(video, 'duration', {configurable: true, value: 4});
  fireEvent.loadedMetadata(video);
  await act(async () => fireEvent.click(screen.getByRole('button', {name: 'Play Custom player'})));

  expect(screen.getByRole('button', {name: 'Pause Custom player'})).toBeVisible();

  fireEvent.change(screen.getByRole('slider'), {target: {value: '2'}});

  expect(video.currentTime).toBe(2);

  fireEvent.timeUpdate(video);

  expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '00:02 of 00:04');

  fireEvent.click(screen.getByRole('button', {name: 'Unmute Custom player'}));

  expect(screen.getByRole('button', {name: 'Mute Custom player'})).toBeVisible();

  fireEvent.click(screen.getByRole('button', {name: 'Full screen Custom player'}));

  expect(screen.getByRole('status')).toHaveTextContent('Full screen is unavailable.');
});
