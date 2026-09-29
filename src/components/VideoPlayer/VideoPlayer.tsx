import {useCallback, useEffect, useRef, useState} from 'react';

import {formatPlaybackTime as formatClock} from '../../utils/playbackUtils.js';
import {useInViewport} from '../../utils/useInViewport.js';
import {usePlaybackEvent} from '../../utils/usePlaybackEvent.js';
import {PlaybackControls} from '../PlaybackControls/PlaybackControls.js';

import type {ReactElement, Ref, VideoHTMLAttributes} from 'react';

export interface VideoPlayerProps extends VideoHTMLAttributes<HTMLVideoElement> {
  readonly onPlaybackStop?: (reason: 'ended' | 'error' | 'pause') => void;
  readonly ref?: Ref<HTMLVideoElement>;
}

/** Lightweight single-file playback. No Mediabunny import, decoder pool, or AudioContext per video. */
export const VideoPlayer = ({'aria-label': label = 'Video', className, controls = false, muted: initialMuted = false,
  onDurationChange, onEmptied, onEnded, onError, onLoadedMetadata, onPause, onPlay, onPlaybackStop,
  onSeeked, onTimeUpdate, onVolumeChange, playsInline = true, poster, preload = poster ? 'none' : 'metadata', ref, src, ...props
}: VideoPlayerProps): ReactElement => {
  const video = useRef<HTMLVideoElement>(null);
  const [element, setElement] = useState<HTMLVideoElement | null>(null);
  const visible = useInViewport(element);
  const stage = useRef<HTMLDivElement>(null);
  const scrubber = useRef<HTMLInputElement>(null);
  const progressFill = useRef<HTMLSpanElement>(null);
  const progressThumb = useRef<HTMLSpanElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(initialMuted);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const setVideo = useCallback((element: HTMLVideoElement | null) => {
    video.current = element;
    setElement(element);
    if(typeof ref === 'function') {
      const cleanup = ref(element);
      if(typeof cleanup === 'function') {
        return () => { video.current = null; setElement(null); cleanup(); };
      }
      return undefined;
    }
    if(ref) {
      ref.current = element;
    }
    return undefined;
  }, [ref]);
  const paint = (): void => {
    const element = video.current;
    const seconds = element && Number.isFinite(element.currentTime) ? element.currentTime : 0;
    const total = element && Number.isFinite(element.duration) ? element.duration : 0;
    const percent = total ? Math.min(100, seconds / total * 100) : 0;
    if(scrubber.current) {
      scrubber.current.value = String(seconds);
      scrubber.current.setAttribute('aria-valuetext', `${formatClock(seconds)} of ${formatClock(total)}`);
    }
    if(clock.current) {
      clock.current.textContent = formatClock(seconds);
    }
    if(progressFill.current) {
      progressFill.current.style.width = `${percent}%`;
    }
    if(progressThumb.current) {
      progressThumb.current.style.left = `${percent}%`;
    }
  };
  const updateClock = usePlaybackEvent(paint);
  useEffect(() => {
    if(!controls || !playing) {
      return undefined;
    }
    let frame = 0;
    const tick = (): void => {
      updateClock();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [controls, playing]);
  const reset = (): void => {
    setDuration(0);
    setError('');
    setPlaying(false);
    paint();
  };
  useEffect(() => {
    if(controls) {
      reset();
    }
    // A changed file must not inherit playback state from the previous source.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls, src]);
  useEffect(() => {
    setMuted(initialMuted);
    if(element) element.muted = initialMuted;
  }, [element, initialMuted]);
  useEffect(() => {
    if(!element) {
      return undefined;
    }
    // Restore after a StrictMode lifecycle probe or source replacement cleanup.
    if(visible && src && element.getAttribute('src') !== src) {
      element.setAttribute('src', src);
    }
    return () => {
      element.pause();
      element.removeAttribute('src');
      element.load();
    };
  }, [element, src, visible]);
  const media = <video {...props} aria-label={label} className={controls ? 'block h-full max-h-[inherit] w-full object-contain' : className}
    muted={muted} onDurationChange={(event) => {
      if(controls) {
        setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0);
        paint();
      }
      onDurationChange?.(event);
    }} onEmptied={(event) => {
      if(controls) {
        reset();
      }
      onEmptied?.(event);
    }} onEnded={(event) => {
      if(controls) {
        setPlaying(false);
        paint();
      }
      onEnded?.(event);
      onPlaybackStop?.('ended');
    }} onError={(event) => {
      if(controls) {
        setPlaying(false);
        setError('This video could not load.');
      }
      onError?.(event);
      onPlaybackStop?.('error');
    }} onLoadedMetadata={(event) => {
      if(controls) {
        setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0);
        paint();
      }
      onLoadedMetadata?.(event);
    }} onPause={(event) => {
      if(controls) {
        setPlaying(false);
        paint();
      }
      onPause?.(event);
      onPlaybackStop?.('pause');
    }} onPlay={(event) => {
      if(controls) {
        setPlaying(true);
        setError('');
      }
      onPlay?.(event);
    }} onSeeked={(event) => {
      if(controls) {
        paint();
      }
      onSeeked?.(event);
    }} onTimeUpdate={(event) => {
      if(controls) {
        paint();
      }
      onTimeUpdate?.(event);
    }} onVolumeChange={(event) => {
      if(controls) {
        setMuted(event.currentTarget.muted);
      }
      onVolumeChange?.(event);
    }} playsInline={playsInline} poster={poster} preload={preload} ref={setVideo} src={visible ? src : undefined} />;
  if(!controls) {
    return media;
  }
  return <div className={`relative overflow-hidden bg-black @container ${className || ''}`} ref={stage}>
    {media}
    {error && <p className="absolute inset-x-2 top-2 rounded-lg bg-black/80 p-2 text-xs text-white" role="status">{error}</p>}
    <PlaybackControls compact duration={duration} label={label} muted={muted} onFullscreen={() => {
      if(!stage.current?.requestFullscreen) {
        setError('Full screen is unavailable.');
        return;
      }
      void stage.current.requestFullscreen().catch(() => setError('Full screen is unavailable.'));
    }} onMute={() => {
      if(video.current) {
        video.current.muted = !video.current.muted;
      }
    }} onPause={() => {
      // Poster previews keep playing during a scrub; pausing would dispose their player.
      if(!onPlaybackStop) {
        video.current?.pause();
      }
    }} onSeek={(seconds) => {
      if(video.current) {
        if(!onPlaybackStop) {
          video.current.pause();
        }
        video.current.currentTime = seconds;
        paint();
      }
    }} onToggle={() => {
      const element = video.current;
      if(!element) {
        return;
      }
      if(element.paused) {
        void element.play().catch(() => {
          if(video.current === element && element.getAttribute('src') === src) {
            setPlaying(false);
            setError('Unable to play this video. Try again.');
            onPlaybackStop?.('error');
          }
        });
      } else {
        element.pause();
      }
    }} playing={playing} progressFill={progressFill} progressThumb={progressThumb} scrubber={scrubber}
    seekLabel={`Seek ${label}`} time={<><span className="text-white" ref={clock}>00:00</span>/{formatClock(duration)}</>} />
  </div>;
};
