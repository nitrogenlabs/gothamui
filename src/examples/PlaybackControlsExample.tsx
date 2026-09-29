import * as React from 'react';

import {PlaybackControls} from '../components/PlaybackControls/PlaybackControls.js';
import {formatPlaybackTime} from '../utils/playbackUtils.js';

/** Connect the presentation-only controls to a native video element. */
export const PlaybackControlsExample = ({src}: {readonly src: string}) => {
  const video = React.useRef<HTMLVideoElement>(null);
  const stage = React.useRef<HTMLDivElement>(null);
  const [duration, setDuration] = React.useState(0);
  const [position, setPosition] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [muted, setMuted] = React.useState(true);
  const [error, setError] = React.useState('');
  const scrubber = React.useRef<HTMLInputElement>(null);
  const progressFill = React.useRef<HTMLSpanElement>(null);
  const progressThumb = React.useRef<HTMLSpanElement>(null);
  const paint = (seconds: number) => {
    setPosition(seconds);
    if(scrubber.current) {
      scrubber.current.value = String(seconds);
      scrubber.current.setAttribute('aria-valuetext', `${formatPlaybackTime(seconds)} of ${formatPlaybackTime(duration)}`);
    }
    const progress = duration ? seconds / duration * 100 : 0;
    if(progressFill.current) {
      progressFill.current.style.width = `${progress}%`;
    }
    if(progressThumb.current) {
      progressThumb.current.style.left = `${progress}%`;
    }
  };
  return <div className="w-full max-w-2xl">
    <div className="relative aspect-video overflow-hidden rounded-xl bg-black @container" ref={stage}>
      <video aria-label="Custom player media" className="size-full object-contain" muted={muted}
        onEnded={() => setPlaying(false)} onError={() => setError('The sample video could not load.')}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)} onTimeUpdate={(event) => paint(event.currentTarget.currentTime)}
        playsInline preload="metadata" ref={video} src={src} />
      <PlaybackControls compact duration={duration} label="Custom player" markers={[1, 2, 3]} muted={muted}
        onFullscreen={() => {
          if(!stage.current?.requestFullscreen) {
            setError('Full screen is unavailable.');
            return;
          }
          void stage.current.requestFullscreen().catch(() => setError('Full screen is unavailable.'));
        }} onMute={() => setMuted((value) => !value)} onPause={() => video.current?.pause()}
        onSeek={(seconds) => {
          if(video.current) {
            video.current.pause();
            video.current.currentTime = seconds;
            paint(seconds);
          }
        }}
        onToggle={() => {
          if(playing) {
            video.current?.pause();
          } else {
            void video.current?.play().catch(() => setError('Playback is unavailable.'));
          }
        }} playing={playing} progressFill={progressFill} progressThumb={progressThumb} scrubber={scrubber}
        seekLabel="Custom player position" time={`${formatPlaybackTime(position)} / ${formatPlaybackTime(duration)}`} />
    </div>
    {error && <p role="status">{error}</p>}
  </div>;
};
