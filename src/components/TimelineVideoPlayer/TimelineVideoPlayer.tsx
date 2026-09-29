import {Camera, FastForward, Proportions, RefreshCw, Repeat, Rewind} from 'lucide-react';
import {useEffect, useImperativeHandle, useRef, useState} from 'react';

import {formatPlaybackTime, playbackRatioPresets} from '../../utils/playbackUtils.js';
import {usePlaybackEvent} from '../../utils/usePlaybackEvent.js';
import {PlaybackControls, playerButton, playerGlass} from '../PlaybackControls/PlaybackControls.js';

import type {CanvasPreviewOptions, createCanvasPreview, PreviewScene} from '../../media/canvasPreview.js';
import type {CSSProperties, ReactNode, Ref} from 'react';

export type TimelineVideoScene = PreviewScene;
export interface TimelineVideoPlayerHandle {
  readonly canvas: HTMLCanvasElement | null;
  readonly pause: () => void;
  readonly play: () => Promise<void>;
  readonly seek: (seconds: number) => Promise<void>;
}
export interface TimelineVideoPlayerProps {
  readonly 'aria-label'?: string;
  readonly children?: ReactNode;
  readonly className?: string;
  readonly defaultLoop?: boolean;
  readonly defaultMuted?: boolean;
  readonly defaultRatio?: number;
  /** Caller-owned request policy, e.g. authorization headers for trusted media origins. */
  readonly mediaRequestInit?: CanvasPreviewOptions['mediaRequestInit'];
  readonly onEnded?: () => void;
  readonly onError?: (error: Error) => void;
  readonly onMetadata?: CanvasPreviewOptions['onMetadata'];
  readonly onPlayingChange?: (playing: boolean) => void;
  /** Clock ticks can be forwarded to an ArkhamJS transport without rerendering this player. */
  readonly onPositionChange?: (seconds: number) => void;
  readonly onRatioChange?: (ratio: number) => void;
  readonly onSnapshot?: (canvas: HTMLCanvasElement, seconds: number) => void;
  readonly onStateChange?: CanvasPreviewOptions['onState'];
  readonly options?: ReactNode;
  readonly ref?: Ref<TimelineVideoPlayerHandle>;
  readonly resolveMediaUrl?: CanvasPreviewOptions['resolveMediaUrl'];
  readonly scenes: TimelineVideoScene[];
  readonly style?: CSSProperties;
}

/** Trimmed, overlapping video/image scenes with synchronized audio and shared playback controls. */
export const TimelineVideoPlayer = ({
  'aria-label': label = 'Timeline', children, className = '', defaultLoop = false, defaultMuted = false,
  defaultRatio = 16 / 9, mediaRequestInit, onEnded, onError, onMetadata, onPlayingChange, onPositionChange,
  onRatioChange, onSnapshot, onStateChange, options, ref, resolveMediaUrl, scenes, style
}: TimelineVideoPlayerProps) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const engine = useRef<ReturnType<typeof createCanvasPreview> | null>(null);
  const position = useRef(0);
  const clock = useRef<HTMLSpanElement>(null);
  const scrubber = useRef<HTMLInputElement>(null);
  const progressFill = useRef<HTMLSpanElement>(null);
  const progressThumb = useRef<HTMLSpanElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(defaultMuted);
  const [looping, setLooping] = useState(defaultLoop);
  const [ratio, setRatio] = useState(Number.isFinite(defaultRatio) && defaultRatio > 0 ? defaultRatio : 16 / 9);
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState('');
  const [status, setStatus] = useState({buffering: false, ready: false});
  const [sceneIndex, setSceneIndex] = useState(0);
  const baseScenes = scenes.filter((scene) => !scene.overlay);
  const duration = Math.max(0, ...scenes.map((scene) => scene.end));
  // Value identity avoids replacing a running decoder when the parent recreates an equivalent array.
  const signature = JSON.stringify(scenes);
  const latestScenes = useRef(scenes);
  latestScenes.current = scenes;
  const reportPlaying = usePlaybackEvent((value: boolean) => {
    setPlaying(value);
    onPlayingChange?.(value);
  });
  const reportError = usePlaybackEvent((reason: unknown) => {
    const failure = reason instanceof Error ? reason : new Error('Unable to play this timeline.');
    engine.current?.pause();
    setError(failure.message);
    reportPlaying(false);
    onError?.(failure);
  });
  const paint = usePlaybackEvent((seconds: number) => {
    const time = Math.max(0, Math.min(duration, Number.isFinite(seconds) ? seconds : 0));
    position.current = time;
    const percent = duration ? time / duration * 100 : 0;
    if(clock.current) clock.current.textContent = formatPlaybackTime(time);
    if(scrubber.current) {
      scrubber.current.value = String(time);
      scrubber.current.setAttribute('aria-valuetext', `${formatPlaybackTime(time)} of ${formatPlaybackTime(duration)}`);
    }
    if(progressFill.current) progressFill.current.style.width = `${percent}%`;
    if(progressThumb.current) progressThumb.current.style.left = `${percent}%`;
    setSceneIndex(Math.max(0, baseScenes.findLastIndex((scene) => scene.start <= time)));
    onPositionChange?.(time);
  });
  const pause = usePlaybackEvent(() => {
    engine.current?.pause();
    reportPlaying(false);
  });
  const seek = usePlaybackEvent(async (seconds: number): Promise<void> => {
    const player = engine.current;
    if(!player) return;
    pause();
    try {
      const time = Math.max(0, Math.min(duration, Number.isFinite(seconds) ? seconds : 0));
      await player.seek(time);
      if(engine.current === player) paint(time);
    } catch(reason) {
      if(engine.current === player) reportError(reason);
    }
  });
  const play = usePlaybackEvent(async (): Promise<void> => {
    const player = engine.current;
    if(!player || !status.ready || error) return;
    try {
      if(position.current >= duration - 0.001) await player.seek(0);
      // Report before awaiting decoding so a pause during buffering remains effective.
      reportPlaying(true);
      await player.play();
    } catch(reason) {
      if(engine.current === player) reportError(reason);
    }
  });
  useImperativeHandle(ref, () => ({canvas: canvas.current, pause, play, seek}), [pause, play, seek]);
  const ended = usePlaybackEvent(() => {
    onEnded?.();
    if(looping) void play();
    else reportPlaying(false);
  });
  const metadata = usePlaybackEvent((...args: Parameters<CanvasPreviewOptions['onMetadata']>) => onMetadata?.(...args));
  const stateChanged = usePlaybackEvent((next: Parameters<CanvasPreviewOptions['onState']>[0]) => {
    setStatus((previous) => previous.ready === next.ready && previous.buffering === next.buffering
      ? previous : {buffering: next.buffering, ready: next.ready});
    onStateChange?.(next);
    if(next.error) reportError(new Error(next.error));
  });
  const requestInit = usePlaybackEvent((url: string) => mediaRequestInit?.(url) ?? {});
  const resolveUrl = usePlaybackEvent((url: string) => resolveMediaUrl?.(url) ?? url);
  const configure = usePlaybackEvent((player: ReturnType<typeof createCanvasPreview>) => {
    player.setMuted(muted);
    player.setRatio(ratio);
  });
  useEffect(() => {
    let disposed = false;
    let player: ReturnType<typeof createCanvasPreview> | undefined;
    setError('');
    reportPlaying(false);
    paint(0);
    setStatus({buffering: latestScenes.current.length > 0, ready: false});
    if(latestScenes.current.length) {
      void import('../../media/canvasPreview.js').then(async ({createCanvasPreview}) => {
        if(disposed || !canvas.current) return;
        player = createCanvasPreview({
          canvas: canvas.current,
          mediaRequestInit: requestInit,
          onEnded: () => { if(!disposed) ended(); },
          onMetadata: (...args) => { if(!disposed) metadata(...args); },
          onPosition: (seconds) => { if(!disposed) paint(seconds); },
          onState: (next) => { if(!disposed) stateChanged(next); },
          resolveMediaUrl: resolveUrl,
          scenes: latestScenes.current
        });
        engine.current = player;
        configure(player);
        await player.prepare(0);
      }).catch((reason: unknown) => { if(!disposed) reportError(reason); });
    }
    return () => {
      disposed = true;
      player?.destroy();
      if(engine.current === player) engine.current = null;
    };
  }, [configure, ended, metadata, paint, reportError, reportPlaying, requestInit, resolveUrl, retry, signature, stateChanged]);
  useEffect(() => { engine.current?.setMuted(muted); }, [muted]);
  useEffect(() => { engine.current?.setRatio(ratio); }, [ratio]);
  return <section aria-label={label} className={`space-y-3 ${className}`} style={style}>
    <div className="relative mx-auto flex min-h-64 w-full items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black @container"
      ref={stage} style={{aspectRatio: ratio}}>
      <canvas aria-label={`${label} preview`} className="absolute inset-0 size-full object-contain"
        data-preview-buffering={status.buffering} data-preview-ready={status.ready} ref={canvas} role="img" />
      {status.buffering && !error && <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20" role="status">
        <RefreshCw aria-hidden="true" className="animate-spin text-violet-200" size={24} /><span className="sr-only">Preparing preview</span>
      </div>}
      {!scenes.length && <p className="relative text-sm text-white/60">No scenes to play.</p>}
      {children}
      {duration > 0 && <PlaybackControls duration={duration} label={label} markers={baseScenes.slice(1).map((scene) => scene.start)}
        muted={muted} onFullscreen={() => {
          if(!stage.current?.requestFullscreen) {
            reportError(new Error('Full screen is unavailable.'));
            return;
          }
          void stage.current.requestFullscreen().catch(reportError);
        }} onMute={() => setMuted((value) => !value)} onPause={pause} onSeek={(time) => void seek(time)}
        onToggle={() => { if(playing) pause(); else void play(); }}
        options={<><div className={`${playerGlass} relative px-3`}>
          <Proportions aria-hidden="true" className="text-white/85" size={16} />
          <select aria-label="Preview frame ratio" className="cursor-pointer bg-transparent p-2 text-xs text-white"
            onChange={(event) => { const value = Number(event.target.value); setRatio(value); onRatioChange?.(value); }} value={ratio}>
            {!playbackRatioPresets.some((item) => item.value === ratio) && <option value={ratio}>Custom</option>}
            {playbackRatioPresets.map((item) => <option className="bg-black" key={item.label} value={item.value}>{item.label}</option>)}
          </select>
        </div>{options}</>} playDisabled={!status.ready || Boolean(error)} playing={playing}
        progressFill={progressFill} progressThumb={progressThumb} scrubber={scrubber} seekLabel={`Seek ${label}`} step={1 / 30}
        time={<><span className="text-white" ref={clock}>00:00</span>/{formatPlaybackTime(duration)}</>}>
        <div className={`${playerGlass} px-1`}>
          {onSnapshot && <button aria-label="Capture poster" className={playerButton} disabled={!status.ready || status.buffering}
            onClick={() => { pause(); if(canvas.current) onSnapshot(canvas.current, position.current); }} type="button"><Camera size={17} /></button>}
          <button aria-label="Loop" aria-pressed={looping} className={playerButton} onClick={() => setLooping((value) => !value)} type="button"><Repeat size={17} /></button>
          <button aria-label="Previous scene" className={playerButton} disabled={sceneIndex <= 0 || !status.ready}
            onClick={() => void seek(baseScenes[sceneIndex - 1].start)} type="button"><Rewind size={17} /></button>
          <button aria-label="Next scene" className={playerButton} disabled={sceneIndex >= baseScenes.length - 1 || !status.ready}
            onClick={() => void seek(baseScenes[sceneIndex + 1].start)} type="button"><FastForward size={17} /></button>
        </div>
      </PlaybackControls>}
    </div>
    {error && <p className="text-sm text-amber-600" role="status">{error} <button className="cursor-pointer underline" onClick={() => setRetry((value) => value + 1)} type="button">Retry preview</button></p>}
  </section>;
};
