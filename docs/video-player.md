# Shared video players

GothamUI provides three public components, extracted from Reactorbox's playback implementation:

- `VideoPlayer`: native single-file video, optional glass controls, poster-first loading, and viewport-aware media cleanup.
- `TimelineVideoPlayer`: canvas playback for trimmed video/image scenes, overlapping transitions, text overlays, and layered audio.
- `PlaybackControls`: presentation-only transport controls for a custom media engine or an existing ArkhamJS transport.

Import from `@nlabs/gothamui/video` to use the dedicated entry point. The components and their prop types are also exported from the package root and `@nlabs/gothamui/components`. Load `@nlabs/gothamui/styles/tailwind.css` once in your app.

```tsx
import {VideoPlayer} from '@nlabs/gothamui/video';

<VideoPlayer
  aria-label="Product demonstration"
  className="aspect-video w-full rounded-xl"
  controls
  poster="/media/poster.jpg"
  src="/media/demo.mp4"
/>
```

`VideoPlayer` forwards native video attributes, media events, child caption tracks, and a React 19 ref to the video element. With `controls`, `className` styles the surrounding player; without controls it styles the video itself. `preload` defaults to `none` with a poster and `metadata` otherwise. Sources are attached while visible and released when offscreen or unmounted. `muted` changes are synchronized; play/pause, seek, mute and fullscreen buttons operate on the native element. Source changes clear stale errors and transport state.

`onPlaybackStop(reason)` receives `pause`, `ended`, or `error`. Use it for a poster preview that unmounts on stop. When supplied, scrubbing leaves playback running so it does not dispose a preview midway through a seek.

```tsx
import {TimelineVideoPlayer} from '@nlabs/gothamui/video';
import type {TimelineVideoScene} from '@nlabs/gothamui/video';

const scenes: TimelineVideoScene[] = [
  {
    audio: [],
    end: 5,
    id: 'opening',
    sourceStart: 2,
    start: 0,
    transition: {duration: 1, type: 'crossfade'},
    visual: {assetId: 'clip-a', kind: 'video', url: '/media/a.mp4'}
  },
  {
    audio: [
      {assetId: 'voice', end: 3, id: 'narration', offset: 0, start: 0, url: '/media/voice.mp3'}
    ],
    end: 8,
    id: 'closing',
    sourceStart: 0,
    start: 4,
    visual: {assetId: 'clip-b', kind: 'video', url: '/media/b.mp4'}
  }
];

<TimelineVideoPlayer
  aria-label="Presentation"
  onSnapshot={(canvas, seconds) => {
    // The host app decides how to store or upload the selected frame.
    canvas.toBlob((blob) => {
      if(!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `poster-${seconds.toFixed(2)}.png`;
      link.href = url;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  }}
  scenes={scenes}
/>
```

Times are seconds. Scene `start`/`end` are timeline bounds; `sourceStart` is the retained source in-point. Put base scenes in chronological order. Overlap adjacent scene bounds to create a transition, and set the transition on the outgoing scene. Audio `start`/`end` are source trim bounds and `offset` is its offset from the scene's start. Use unique scene/audio IDs and stable asset IDs. `overlay: true` adds an image, video, text, or audio layer above the base sequence. Supply finite, nonnegative bounds with `end > start`.

The timeline retains the original decoder's bounded frame queues, synchronized audio, and transition compositor. Mediabunny is loaded lazily when a nonempty timeline mounts. Native `VideoPlayer` never creates a canvas compositor or AudioContext. Media must use browser-supported codecs; serve seekable media with HTTP range support and appropriate CORS headers. Capturing a frame also requires canvas-compatible CORS.

Supported transitions are exported as `VIDEO_TRANSITIONS` and `TRANSITIONS`: cuts, crossfade, dips to black/white, directional wipes/slides/pushes, zoom, blur, iris, and pixel dissolve. The legacy aliases `dissolve`, `fade`, and `match` remain accepted.

Timeline controls include seeking, mute, loop, previous/next scene, fullscreen, ratio selection, and optional frame capture. `children` adds a stage overlay; `options` adds a custom group to the control bar. `defaultLoop`, `defaultMuted`, and `defaultRatio` set initial presentation preferences.

For application-owned playback, use a `ref` of type `TimelineVideoPlayerHandle` to call `play()`, `pause()`, or `seek(seconds)`, and subscribe via `onPositionChange`, `onPlayingChange`, `onStateChange`, `onMetadata`, and `onEnded`. An ArkhamJS event listener can call these commands and forward clock ticks into its transport; no Reactorbox stores or providers are required. Clocks and scrubbers update imperatively, rather than rerendering the player on every tick. Equivalent scene arrays retain the decoder; changed scene contents reset playback and recreate it. Late events from disposed engines are ignored.

`resolveMediaUrl(url)` lets the host resolve a media URL when a source is opened. `mediaRequestInit(url)` supplies request options for decoded video/audio, such as fresh authorization headers for trusted origins. These callbacks receive current props without restarting the decoder. Images use native image loading; use public or signed image URLs. Authentication, asset selection, workspace persistence, codec policy, timeline editing UI, and server-side poster saving remain responsibilities of the host application.

For an existing engine, `PlaybackControls` exposes play/pause/mute/fullscreen callbacks, duration, scene markers, a clock slot, custom groups, and refs for the scrubber/progress indicators. It owns no store or clock. All interactive controls include `cursor-pointer` and accessible names.

## Application-owned canvas preview

For custom editor controls or offscreen poster capture, import `createCanvasPreview` and the
`CanvasPreviewOptions`/`PreviewScene` types from `@nlabs/gothamui/video`. The factory uses the same
decoder, timeline, frame queue, audio synchronization and transitions as `TimelineVideoPlayer`.
It returns `prepare(seconds)`, `play()`, `pause()`, `seek(seconds)`, `setMuted(boolean)`,
`setRatio(number)` and `destroy()`. Prepare a frame before reading the supplied canvas; always
destroy the engine when the operation finishes, is canceled, or its owner unmounts.

The host supplies the canvas, scenes, and `onEnded`/`onMetadata`/`onPosition`/`onState` callbacks.
`resolveMediaUrl` applies to images and decoded streams; `mediaRequestInit` applies only to
decoded video/audio and receives the resolved URL. Native images still need public or signed
URLs. A host that removes expiring query grants from private streams must retain signed image
URLs and attach session headers only to its trusted media paths. A mutable `Headers` instance
allows later range requests to observe session rotation without recreating the decoder.

`paintTransition` is also exported from the video entry point for canvas transition swatches.
It accepts a canvas context, width, height, transition name, progress from zero to one, and
outgoing/incoming drawing callbacks. The host owns asset selection and export configuration.

## Component API

### VideoPlayer

| Prop | Type / default | Purpose |
| --- | --- | --- |
| `src` | `string` | Native video source. |
| `controls` | `boolean = false` | Enables the shared glass control bar. |
| `aria-label` | `string = 'Video'` | Names the media and its transport controls. |
| `className` | `string` | Styles the wrapper when controls are enabled, or the video otherwise. |
| `poster` | `string` | Image displayed before playback. |
| `preload` | `'none' \| 'metadata' \| 'auto'` | Defaults to `none` with a poster, otherwise `metadata`. |
| `muted` | `boolean = false` | Initial mute state, synchronized when the prop changes. |
| `onPlaybackStop` | `(reason: 'pause' \| 'ended' \| 'error') => void` | Receives stop events; also keeps scrubbing from pausing a disposable preview. |
| `ref` | `Ref<HTMLVideoElement>` | Native media commands and properties. |
| Native props / children | `VideoHTMLAttributes<HTMLVideoElement>` | Includes playback events, loop, autoPlay, crossOrigin, and caption tracks. |

### TimelineVideoPlayer

| Prop | Type / default | Purpose |
| --- | --- | --- |
| `scenes` | `TimelineVideoScene[]` (required) | Chronological base scenes and overlays; times are seconds. |
| `aria-label` | `string = 'Timeline'` | Names the preview and transport controls. |
| `defaultLoop` / `defaultMuted` | `boolean = false` | Initial transport preferences. |
| `defaultRatio` | `number = 16 / 9` | Initial aspect ratio. |
| `ref` | `Ref<TimelineVideoPlayerHandle>` | `canvas`, `play()`, `pause()`, and `seek(seconds)`. |
| `onPositionChange` | `(seconds: number) => void` | Clock updates for an external transport. |
| `onPlayingChange` | `(playing: boolean) => void` | Play/pause state updates. |
| `onStateChange` | `(state: {buffering: boolean; ready: boolean; error?: string}) => void` | Decoder readiness and failures. |
| `onMetadata` | `(assetId, duration, width?, height?) => void` | Source metadata. |
| `onEnded` / `onError` | `() => void` / `(error: Error) => void` | Completion and failure notifications. |
| `onRatioChange` | `(ratio: number) => void` | User-selected aspect ratio. |
| `onSnapshot` | `(canvas: HTMLCanvasElement, seconds: number) => void` | Enables the frame-capture button. |
| `resolveMediaUrl` | `(url: string) => string` | Resolves a source URL when opened. |
| `mediaRequestInit` | `(url: string) => RequestInit` | Host-owned request policy for decoded video/audio. |
| `children` / `options` | `ReactNode` | Stage overlays / additional control groups. |
| `className` / `style` | `string` / `CSSProperties` | Styles the outer section. |

### PlaybackControls

| Prop | Type / default | Purpose |
| --- | --- | --- |
| `duration` | `number` (required) | Total seconds; zero disables seeking. |
| `playing` / `muted` | `boolean` (required) | Current transport state. |
| `onToggle`, `onPause`, `onMute`, `onFullscreen` | `() => void` (required) | Host-owned commands; `onPause` runs when pointer scrubbing begins. |
| `onSeek` | `(seconds: number) => void` (required) | Host-owned seek command. |
| `seekLabel` | `string` (required) | Accessible slider name. |
| `time` | `ReactNode` (required) | Clock content. |
| `compact` | `boolean = false` | Uses container-query layouts; place within an `@container` wrapper. |
| `label` | `string = ''` | Accessible button-name suffix. |
| `markers` | `number[] = []` | Seek-track marker positions in seconds. |
| `playDisabled` | `boolean` | Disables play/pause during preparation. |
| `step` | `number = 0.01` | Seek increment, e.g. `1 / 30` for frame-aligned seeking. |
| `scrubber` | `Ref<HTMLInputElement>` | Update value and `aria-valuetext` from the host clock. |
| `progressFill` / `progressThumb` | `Ref<HTMLSpanElement>` | Update `style.width` / `style.left` with progress percentages. |
| `children` / `options` | `ReactNode` | Custom groups after the transport / before fullscreen. |

## Custom native player example

This complete example uses `PlaybackControls` with a native video element. For a larger editor, keep its high-frequency clock in refs or an external transport.

```tsx
import {formatPlaybackTime, PlaybackControls} from '@nlabs/gothamui/video';
import * as React from 'react';

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

```
