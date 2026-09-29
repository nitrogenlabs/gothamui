import {Maximize, Pause, Play, Volume2, VolumeX} from 'lucide-react';

import type {ReactElement, ReactNode, Ref} from 'react';

export const playerButton = 'flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white/85 transition hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-violet-300 disabled:cursor-not-allowed disabled:opacity-35';
export const playerGlass = 'flex h-12 shrink-0 items-center gap-0.5 rounded-xl bg-white/[0.14] shadow-lg backdrop-blur-xl';

export interface PlaybackControlsProps {
  readonly children?: ReactNode;
  readonly compact?: boolean;
  readonly duration: number;
  readonly label?: string;
  readonly markers?: number[];
  readonly muted: boolean;
  readonly onFullscreen: () => void;
  readonly onMute: () => void;
  readonly onPause: () => void;
  readonly onSeek: (seconds: number) => void;
  readonly onToggle: () => void;
  readonly options?: ReactNode;
  readonly playDisabled?: boolean;
  readonly playing: boolean;
  readonly progressFill?: Ref<HTMLSpanElement>;
  readonly progressThumb?: Ref<HTMLSpanElement>;
  readonly scrubber?: Ref<HTMLInputElement>;
  readonly seekLabel: string;
  readonly step?: number;
  readonly time: ReactNode;
}

/** Presentation only: native media and the Flux timeline retain their own clocks and commands. */
export const PlaybackControls = ({children, compact = false, duration, label = '', markers = [], muted,
  onFullscreen, onMute, onPause, onSeek, onToggle, options, playDisabled, playing,
  progressFill, progressThumb, scrubber, seekLabel, step = 0.01, time}: PlaybackControlsProps): ReactElement => {
  const name = (action: string): string => (label ? `${action} ${label}` : action);
  return <div aria-label={name('Playback')} className={`absolute flex items-center gap-1.5 ${compact ? 'inset-x-1 bottom-1' : 'inset-x-3 bottom-3 flex-wrap sm:inset-x-4 sm:bottom-4'}`} role="group">
    <div className={`${playerGlass} px-1`}>
      <button aria-label={name(playing ? 'Pause' : 'Play')} className={playerButton} disabled={playDisabled} onClick={onToggle} type="button">{playing ? <Pause size={17} /> : <Play size={17} />}</button>
      <span className={`${compact ? 'hidden @[380px]:block' : ''} w-[6.5rem] shrink-0 whitespace-nowrap px-1 text-center font-mono text-[13px] tabular-nums text-white/60`}>{time}</span>
      <button aria-label={name(muted ? 'Unmute' : 'Mute')} aria-pressed={muted} className={`${playerButton} ${compact ? 'hidden @[220px]:flex' : ''}`} onClick={onMute} type="button">{muted ? <VolumeX size={17} /> : <Volume2 size={17} />}</button>
    </div>
    {children}
    <div className={`${playerGlass} relative min-w-0 flex-1 px-3 ${compact ? 'hidden @[170px]:flex' : 'order-last w-full min-w-24 sm:order-none sm:w-auto'}`}>
      <div className="relative mx-3.5 h-1.5 flex-1 rounded-full bg-white/25">
        <span className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#e0e7ff,#c084fc)]" ref={progressFill} />
        {markers.map((position, index) => <span className="absolute inset-y-0 w-px -translate-x-1/2 bg-[#2a2a2e]" key={`${index}-${position}`} style={{left: `${duration ? position / duration * 100 : 0}%`}} />)}
        <span className="pointer-events-none absolute top-1/2 flex h-5 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-lg backdrop-blur" ref={progressThumb}><span className="h-2.5 w-px bg-violet-500 shadow-[3px_0_0_#8b5cf6,-3px_0_0_#8b5cf6]" /></span>
        <input aria-label={seekLabel} className="absolute -inset-y-3 inset-x-0 z-10 h-7 w-full cursor-pointer appearance-none bg-transparent opacity-0 [&::-moz-range-thumb]:size-0 [&::-webkit-slider-thumb]:size-0 [&::-webkit-slider-thumb]:appearance-none" defaultValue={0} disabled={!duration} max={duration} min={0}
          onChange={(event) => onSeek(Number(event.target.value))} onPointerDown={onPause} ref={scrubber} step={step} type="range" />
      </div>
    </div>
    {options}
    <div className={`${playerGlass} px-1 ${compact ? 'hidden @[260px]:flex' : ''}`}>
      <button aria-label={name('Full screen')} className={playerButton} onClick={onFullscreen} type="button"><Maximize size={17} /></button>
    </div>
  </div>;
};
