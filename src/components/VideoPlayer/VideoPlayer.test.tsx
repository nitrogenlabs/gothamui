import {act, cleanup, fireEvent, render, screen} from '@testing-library/react';
import {createRef, StrictMode} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {VideoPlayer} from './VideoPlayer.js';

let visibility: (visible: boolean) => void;
beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function(this: HTMLMediaElement) {
    Object.defineProperty(this, 'paused', {configurable: true, value: true});
    fireEvent.pause(this);
  });
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(async function(this: HTMLMediaElement) {
    Object.defineProperty(this, 'paused', {configurable: true, value: false});
    fireEvent.play(this);
  });
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: (entries: {isIntersecting: boolean}[]) => void) {
      visibility = (visible) => callback([{isIntersecting: visible}]);
    }
    disconnect = vi.fn();
    observe = () => visibility(true);
  });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

const media = () => screen.getByLabelText('Demo', {selector: 'video'}) as HTMLVideoElement;
const metadata = (video: HTMLVideoElement, duration = 20) => {
  Object.defineProperty(video, 'duration', {configurable: true, value: duration});
  fireEvent.loadedMetadata(video);
};

describe('VideoPlayer', () => {
  it('plays, pauses, mutes and scrubs using the shared controls and native callbacks', async () => {
    const onTimeUpdate = vi.fn();
    const onVolumeChange = vi.fn();
    const onLoadedMetadata = vi.fn();
    render(<VideoPlayer aria-label="Demo" controls onLoadedMetadata={onLoadedMetadata} onTimeUpdate={onTimeUpdate} onVolumeChange={onVolumeChange} src="/one.mp4" />);
    const video = media();
    metadata(video);
    expect(video.controls).toBe(false);
    expect(onLoadedMetadata).toHaveBeenCalledOnce();
    await act(async () => fireEvent.click(screen.getByRole('button', {name: 'Play Demo'})));
    expect(screen.getByRole('button', {name: 'Pause Demo'})).toBeVisible();
    fireEvent.click(screen.getByRole('button', {name: 'Mute Demo'}));
    fireEvent.volumeChange(video);
    expect(video.muted).toBe(true);
    expect(onVolumeChange).toHaveBeenCalledOnce();
    const slider = screen.getByRole('slider', {name: 'Seek Demo'});
    fireEvent.pointerDown(slider);
    fireEvent.change(slider, {target: {value: '5'}});
    expect(video.currentTime).toBe(5);
    fireEvent.timeUpdate(video);
    expect(slider).toHaveAttribute('aria-valuetext', '00:05 of 00:20');
    expect(onTimeUpdate).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', {name: 'Play Demo'})).toBeVisible();
    await act(async () => fireEvent.click(screen.getByRole('button', {name: 'Play Demo'})));
    fireEvent.click(screen.getByRole('button', {name: 'Pause Demo'}));
    expect(video.paused).toBe(true);
  });

  it('forwards object refs, media attributes and tracks, and releases offscreen media', () => {
    const ref = createRef<HTMLVideoElement>();
    const {unmount} = render(<VideoPlayer aria-label="Demo" className="rounded-xl" loop poster="poster.jpg" ref={ref} src="/one.mp4"><track kind="captions" src="/captions.vtt" /></VideoPlayer>);
    const video = media();
    expect(ref.current).toBe(video);
    expect(video.preload).toBe('none');
    expect(video.loop).toBe(true);
    expect(video).toHaveClass('rounded-xl');
    expect(video.querySelector('track')).toHaveAttribute('src', '/captions.vtt');
    expect(screen.queryByRole('button')).toBeNull();
    act(() => visibility(false));
    expect(video).not.toHaveAttribute('src');
    act(() => visibility(true));
    expect(video).toHaveAttribute('src', '/one.mp4');
    unmount();
    expect(ref.current).toBeNull();
    expect(video).not.toHaveAttribute('src');
  });

  it('resets source errors and duration, handles media events and rejected playback', async () => {
    const onPlaybackStop = vi.fn();
    const callbacks = {onDurationChange: vi.fn(), onEmptied: vi.fn(), onEnded: vi.fn(), onError: vi.fn(), onPause: vi.fn(), onPlay: vi.fn(), onSeeked: vi.fn()};
    const {rerender} = render(<VideoPlayer {...callbacks} aria-label="Demo" controls onPlaybackStop={onPlaybackStop} src="/one.mp4" />);
    const video = media();
    metadata(video, Infinity);
    expect(screen.getByRole('slider')).toBeDisabled();
    metadata(video);
    fireEvent.durationChange(video);
    fireEvent.seeked(video);
    fireEvent.ended(video);
    expect(onPlaybackStop).toHaveBeenCalledWith('ended');
    fireEvent.error(video);
    expect(screen.getByRole('status')).toHaveTextContent('This video could not load.');
    expect(onPlaybackStop).toHaveBeenCalledWith('error');
    fireEvent.emptied(video);
    expect(screen.queryByRole('status')).toBeNull();
    rerender(<VideoPlayer {...callbacks} aria-label="Demo" controls muted onPlaybackStop={onPlaybackStop} src="/two.mp4" />);
    expect(screen.getByRole('button', {name: 'Play Demo'})).toBeVisible();
    expect(video.muted).toBe(true);
    metadata(video);
    await act(async () => fireEvent.click(screen.getByRole('button', {name: 'Play Demo'})));
    vi.mocked(video.pause).mockClear();
    fireEvent.pointerDown(screen.getByRole('slider'));
    fireEvent.change(screen.getByRole('slider'), {target: {value: '3'}});
    expect(video.pause).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', {name: 'Pause Demo'}));
    expect(onPlaybackStop).toHaveBeenCalledWith('pause');
    vi.mocked(video.play).mockRejectedValueOnce(new Error('blocked'));
    await act(async () => fireEvent.click(screen.getByRole('button', {name: 'Play Demo'})));
    expect(screen.getByRole('status')).toHaveTextContent('Unable to play');
    Object.values(callbacks).forEach((callback) => expect(callback).toHaveBeenCalled());
  });

  it('handles fullscreen support and rejection and React 19 callback ref cleanup', async () => {
    const cleanup = vi.fn();
    const callback = vi.fn(() => cleanup);
    const {unmount} = render(<StrictMode><VideoPlayer aria-label="Demo" controls ref={callback} src="/one.mp4" /></StrictMode>);
    expect(media()).toHaveAttribute('src', '/one.mp4');
    fireEvent.click(screen.getByRole('button', {name: 'Full screen Demo'}));
    expect(screen.getByRole('status')).toHaveTextContent('Full screen is unavailable.');
    const request = vi.fn().mockResolvedValue(undefined);
    media().parentElement!.requestFullscreen = request;
    await act(async () => fireEvent.click(screen.getByRole('button', {name: 'Full screen Demo'})));
    expect(request).toHaveBeenCalledOnce();
    request.mockRejectedValueOnce(new Error('denied'));
    await act(async () => fireEvent.click(screen.getByRole('button', {name: 'Full screen Demo'})));
    expect(screen.getByRole('status')).toBeVisible();
    unmount();
    expect(cleanup).toHaveBeenCalled();
  });
});
