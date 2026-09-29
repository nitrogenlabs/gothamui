import {fireEvent, render, screen} from '@testing-library/react';
import {createRef} from 'react';
import {expect, it, vi} from 'vitest';

import {PlaybackControls} from './PlaybackControls.js';

it('renders accessible transport commands, markers, slots and progress refs', () => {
  const callbacks = {onFullscreen: vi.fn(), onMute: vi.fn(), onPause: vi.fn(), onSeek: vi.fn(), onToggle: vi.fn()};
  const scrubber = createRef<HTMLInputElement>();
  const fill = createRef<HTMLSpanElement>();
  const thumb = createRef<HTMLSpanElement>();
  const {rerender} = render(<PlaybackControls {...callbacks} duration={10} markers={[5]} muted={false} options={<span>Options</span>} playing={false} progressFill={fill} progressThumb={thumb} scrubber={scrubber} seekLabel="Position" time="00:00"><span>Extra</span></PlaybackControls>);
  expect(fill.current).toBeInTheDocument();
  expect(thumb.current).toBeInTheDocument();
  expect(screen.getByText('Options')).toBeVisible();
  expect(screen.getByText('Extra')).toBeVisible();
  fireEvent.click(screen.getByRole('button', {name: 'Play'}));
  fireEvent.click(screen.getByRole('button', {name: 'Mute'}));
  fireEvent.click(screen.getByRole('button', {name: 'Full screen'}));
  fireEvent.pointerDown(scrubber.current!);
  fireEvent.change(scrubber.current!, {target: {value: '4'}});
  expect(callbacks.onSeek).toHaveBeenCalledWith(4);
  Object.values(callbacks).forEach((callback) => expect(callback).toHaveBeenCalledOnce());
  rerender(<PlaybackControls {...callbacks} compact duration={0} label="Clip" markers={[1]} muted playDisabled playing seekLabel="Position" time="00:00" />);
  expect(screen.getByRole('button', {name: 'Pause Clip'})).toBeDisabled();
  expect(screen.getByRole('button', {name: 'Unmute Clip'})).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('slider')).toBeDisabled();
});
