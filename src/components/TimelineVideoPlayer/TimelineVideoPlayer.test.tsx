import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {createRef} from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import {createCanvasPreview} from '../../media/canvasPreview.js';
import {TimelineVideoPlayer} from './TimelineVideoPlayer.js';

import type {CanvasPreviewOptions} from '../../media/canvasPreview.js';
import type {TimelineVideoPlayerHandle, TimelineVideoScene} from './TimelineVideoPlayer.js';

vi.mock('../../media/canvasPreview.js', () => ({createCanvasPreview: vi.fn()}));
let configuration: CanvasPreviewOptions;
const player = {destroy: vi.fn(), pause: vi.fn(), play: vi.fn(), prepare: vi.fn(), seek: vi.fn(), setMuted: vi.fn(), setRatio: vi.fn()};
const scenes: TimelineVideoScene[] = [
  {audio: [], end: 5, id: 'first', sourceStart: 1, start: 0, visual: {assetId: 'one', kind: 'video', url: '/one.mp4'}},
  {audio: [], end: 9, id: 'second', sourceStart: 0, start: 4, visual: {assetId: 'two', kind: 'video', url: '/two.mp4'}}
];
beforeEach(() => {
  vi.clearAllMocks();
  player.play.mockResolvedValue(undefined);
  player.seek.mockResolvedValue(undefined);
  player.prepare.mockImplementation(async () => configuration.onState({buffering: false, ready: true}));
  vi.mocked(createCanvasPreview).mockImplementation((options) => { configuration = options; return player; });
});
const ready = async () => waitFor(() => expect(screen.getByRole('button', {name: 'Play Timeline'})).toBeEnabled());

describe('TimelineVideoPlayer', () => {
  it('prepares a composition, plays, scrubs, navigates scenes and captures a frame', async () => {
    const ref = createRef<TimelineVideoPlayerHandle>();
    const onPositionChange = vi.fn();
    const onPlayingChange = vi.fn();
    const onSnapshot = vi.fn();
    const onMetadata = vi.fn();
    const onRatioChange = vi.fn();
    const mediaRequestInit = vi.fn(() => ({credentials: 'same-origin' as const}));
    const resolveMediaUrl = vi.fn((url: string) => `${url}?signed`);
    render(<TimelineVideoPlayer mediaRequestInit={mediaRequestInit} onMetadata={onMetadata} onPlayingChange={onPlayingChange} onPositionChange={onPositionChange} onRatioChange={onRatioChange} onSnapshot={onSnapshot} options={<span>Custom options</span>} ref={ref} resolveMediaUrl={resolveMediaUrl} scenes={scenes}><span>Overlay</span></TimelineVideoPlayer>);
    await ready();
    expect(player.prepare).toHaveBeenCalledWith(0);
    expect(configuration.scenes).toEqual(scenes);
    expect(configuration.resolveMediaUrl!('/one.mp4')).toBe('/one.mp4?signed');
    expect(configuration.mediaRequestInit!('/one.mp4')).toEqual({credentials: 'same-origin'});
    act(() => configuration.onMetadata('one', 10));
    expect(onMetadata).toHaveBeenCalledWith('one', 10);
    await act(async () => fireEvent.click(screen.getByRole('button', {name: 'Play Timeline'})));
    expect(player.play).toHaveBeenCalledOnce();
    expect(onPlayingChange).toHaveBeenLastCalledWith(true);
    act(() => configuration.onPosition(2));
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '00:02 of 00:09');
    expect(onPositionChange).toHaveBeenLastCalledWith(2);
    fireEvent.click(screen.getByRole('button', {name: 'Pause Timeline'}));
    expect(player.pause).toHaveBeenCalled();
    fireEvent.pointerDown(screen.getByRole('slider'));
    await act(async () => fireEvent.change(screen.getByRole('slider'), {target: {value: '3'}}));
    expect(player.seek).toHaveBeenLastCalledWith(3);
    await act(async () => fireEvent.click(screen.getByRole('button', {name: 'Next scene'})));
    expect(player.seek).toHaveBeenLastCalledWith(4);
    expect(screen.getByRole('button', {name: 'Next scene'})).toBeDisabled();
    await act(async () => fireEvent.click(screen.getByRole('button', {name: 'Previous scene'})));
    expect(player.seek).toHaveBeenLastCalledWith(0);
    fireEvent.click(screen.getByRole('button', {name: 'Mute Timeline'}));
    expect(player.setMuted).toHaveBeenLastCalledWith(true);
    fireEvent.change(screen.getByRole('combobox'), {target: {value: '1'}});
    expect(player.setRatio).toHaveBeenLastCalledWith(1);
    expect(onRatioChange).toHaveBeenCalledWith(1);
    fireEvent.click(screen.getByRole('button', {name: 'Capture poster'}));
    expect(onSnapshot).toHaveBeenCalledWith(ref.current!.canvas, 0);
    await act(async () => ref.current!.seek(100));
    expect(player.seek).toHaveBeenLastCalledWith(9);
    await act(async () => ref.current!.play());
    expect(player.seek).toHaveBeenLastCalledWith(0);
    act(() => ref.current!.pause());
    expect(screen.getByText('Custom options')).toBeVisible();
    expect(screen.getByText('Overlay')).toBeVisible();
  });

  it('loops at the end, reports completion and preserves a decoder for equivalent scene arrays', async () => {
    const onEnded = vi.fn();
    const {rerender, unmount} = render(<TimelineVideoPlayer onEnded={onEnded} scenes={scenes} />);
    await ready();
    rerender(<TimelineVideoPlayer onEnded={onEnded} scenes={structuredClone(scenes)} />);
    expect(createCanvasPreview).toHaveBeenCalledOnce();
    act(() => { configuration.onPosition(9); configuration.onEnded(); });
    expect(onEnded).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', {name: 'Loop'}));
    await act(async () => configuration.onEnded());
    expect(player.seek).toHaveBeenLastCalledWith(0);
    expect(player.play).toHaveBeenCalled();
    rerender(<TimelineVideoPlayer scenes={[scenes[0]]} />);
    await waitFor(() => expect(createCanvasPreview).toHaveBeenCalledTimes(2));
    expect(player.destroy).toHaveBeenCalledOnce();
    unmount();
    expect(player.destroy).toHaveBeenCalledTimes(2);
  });

  it('handles errors, retry, fullscreen, custom ratios and stale decoder callbacks', async () => {
    const onError = vi.fn();
    const onStateChange = vi.fn();
    const {unmount} = render(<TimelineVideoPlayer defaultRatio={2} onError={onError} onStateChange={onStateChange} scenes={scenes} />);
    await ready();
    expect(screen.getByRole('option', {name: 'Custom'})).toBeInTheDocument();
    const canvas = screen.getByRole('img');
    const fullscreen = vi.fn().mockResolvedValue(undefined);
    canvas.parentElement!.requestFullscreen = fullscreen;
    await act(async () => fireEvent.click(screen.getByRole('button', {name: 'Full screen Timeline'})));
    expect(fullscreen).toHaveBeenCalledOnce();
    fullscreen.mockRejectedValueOnce(new Error('Fullscreen denied'));
    await act(async () => fireEvent.click(screen.getByRole('button', {name: 'Full screen Timeline'})));
    expect(screen.getByRole('status')).toHaveTextContent('Fullscreen denied');
    fireEvent.click(screen.getByRole('button', {name: 'Retry preview'}));
    await ready();
    player.play.mockRejectedValueOnce(new Error('Decoder failed'));
    await act(async () => fireEvent.click(screen.getByRole('button', {name: 'Play Timeline'})));
    expect(onError).toHaveBeenLastCalledWith(expect.objectContaining({message: 'Decoder failed'}));
    fireEvent.click(screen.getByRole('button', {name: 'Retry preview'}));
    await ready();
    act(() => configuration.onState({buffering: false, error: 'Bad source', ready: false}));
    expect(screen.getByRole('status')).toHaveTextContent('Bad source');
    expect(onStateChange).toHaveBeenCalled();
    const stale = configuration;
    unmount();
    const count = onError.mock.calls.length;
    act(() => { stale.onPosition(3); stale.onEnded(); stale.onMetadata('stale', 1); stale.onState({buffering: false, error: 'stale', ready: false}); });
    expect(onError).toHaveBeenCalledTimes(count);
  });

  it('renders empty timelines without loading a decoder', () => {
    render(<TimelineVideoPlayer defaultRatio={NaN} scenes={[]} />);
    expect(screen.getByText('No scenes to play.')).toBeVisible();
    expect(createCanvasPreview).not.toHaveBeenCalled();
    expect(screen.queryByRole('slider')).toBeNull();
  });
});
