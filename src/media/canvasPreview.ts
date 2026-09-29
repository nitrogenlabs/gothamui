import {ALL_FORMATS, AudioBufferSink, CanvasSink, Input, UrlSource} from 'mediabunny';

import {previewAudioGain, previewAudioReady, previewLayers, previewSourceTime} from './canvasPreviewTimeline.js';
import {paintTransition} from './paintTransition.js';
import {previewDuration} from './previewDuration.js';
import {createPreviewFrameQueue} from './previewFrameQueue.js';

import type {InputAudioTrack, InputVideoTrack, WrappedAudioBuffer, WrappedCanvas} from 'mediabunny';
import type {PreviewScene} from './canvasPreviewTimeline.js';

export type {PreviewScene} from './canvasPreviewTimeline.js';

export interface CanvasPreviewOptions {
  mediaRequestInit?: (url: string) => RequestInit;
  canvas: HTMLCanvasElement;
  onEnded: () => void;
  onMetadata: (assetId: string, duration: number, width?: number, height?: number) => void;
  onPosition: (seconds: number) => void;
  onState: (state: {buffering: boolean; error?: string; ready: boolean}) => void;
  resolveMediaUrl?: (url: string) => string;
  scenes: PreviewScene[];
}
interface Source {
  audio: InputAudioTrack | null;
  duration: number;
  input: Input;
  video: InputVideoTrack | null;
}
interface VideoRun {
  assetId: string;
  end: number;
  id: string;
  sourceStart: number;
  start: number;
  url: string;
}
interface AudioRun extends VideoRun {
  embedded: boolean;
  sceneIds: string[];
}
interface VideoWindow {
  canceled: boolean;
  loading: Promise<void>;
  queue?: ReturnType<typeof createPreviewFrameQueue<WrappedCanvas>>;
  run: VideoRun;
  source?: Source;
}
interface AudioWindow {
  buffers: WrappedAudioBuffer[];
  canceled: boolean;
  ended: boolean;
  iterator?: AsyncGenerator<WrappedAudioBuffer, void, unknown>;
  loading: Promise<void>;
  pending?: Promise<void>;
  run: AudioRun;
  scheduledUntil: number;
}

const LOOKAHEAD_SECONDS = 2;
const AUDIO_AHEAD_SECONDS = 0.75;
// CanvasSink already predecodes internally. Keep only the displayed frame and two
// upcoming canvases, freeing native VideoFrames as soon as they are rasterized.
const FRAME_CAPACITY = 3;

/** A single decoded-frame compositor. No HTML media element owns playback or switches sources at a cut. */
export const createCanvasPreview = ({
  canvas, mediaRequestInit, onEnded, onMetadata, onPosition, onState, resolveMediaUrl, scenes
}: CanvasPreviewOptions) => {
  const context = canvas.getContext('2d', {alpha: false});
  if(!context) {
    throw new Error('Canvas playback is unavailable in this browser.');
  }
  const total = Math.max(0, ...scenes.map((scene) => scene.end));
  const sources = new Map<string, {error?: unknown; input: Input; ready: Promise<Source>}>();
  const images = new Map<string, {image: HTMLImageElement; ready: Promise<void>}>();
  const videos = new Map<string, VideoWindow>();
  const audios = new Map<string, AudioWindow>();
  const metadata = new Set<string>();
  const playingNodes = new Map<AudioBufferSourceNode, GainNode>();
  const runs: VideoRun[] = [];
  const sceneRuns = new Map<string, VideoRun>();
  const audioRuns: AudioRun[] = [];
  let audioContext: AudioContext | undefined;
  let output: GainNode | undefined;
  let destroyed = false;
  let playing = false;
  let buffering = false;
  let ready = false;
  let muted = false;
  let position = 0;
  let anchorPosition = 0;
  let anchorTime = 0;
  let epoch = 0;
  let command = 0;
  let animation = 0;
  let preparePromise: Promise<void> | undefined;
  let playPromise: Promise<void> | undefined;
  let stateKey = '';
  let paintedKey = '';

  for(const [index, scene] of scenes.entries()) {
    const previous = scenes[index - 1];
    const {visual} = scene;
    if(visual?.kind === 'video') {
      const prior = previous && sceneRuns.get(previous.id);
      if(!scene.overlay && !previous?.overlay && prior && previous?.visual?.url === visual.url
        && Math.abs(prior.end - scene.start) < 0.001
        && Math.abs(prior.sourceStart + prior.end - prior.start - scene.sourceStart) < 0.001
        && (!previous.transition || ['cut', 'match'].includes(previous.transition.type))) {
        prior.end = scene.end;
        sceneRuns.set(scene.id, prior);
      } else {
        const run = {assetId: visual.assetId, end: scene.end, id: scene.id, sourceStart: scene.sourceStart,
          start: scene.start, url: visual.url};
        runs.push(run);
        sceneRuns.set(scene.id, run);
      }
    }
    for(const audio of scene.audio) {
      const start = scene.start + audio.offset;
      audioRuns.push({assetId: audio.assetId, embedded: false,
        end: Math.min(scene.end, start + audio.end - audio.start),
        id: `${scene.id}/${audio.id}`, sceneIds: [scene.id], sourceStart: audio.start, start, url: audio.url});
    }
  }
  audioRuns.push(...runs.map((run) => ({...run, embedded: true, id: `embedded/${run.id}`,
    sceneIds: scenes.filter((scene) => sceneRuns.get(scene.id) === run).map((scene) => scene.id)})));

  const emitState = (error?: string): void => {
    if(destroyed) {
      return;
    }
    const next = JSON.stringify([buffering, error, ready]);
    if(next !== stateKey) {
      stateKey = next;
      onState({buffering, error, ready});
    }
  };
  const stopAudio = (): void => {
    for(const [node, gain] of playingNodes) {
      node.onended = null;
      try {
        node.stop();
      } catch{ /* Already ended. */ }
      node.disconnect();
      gain.disconnect();
    }
    playingNodes.clear();
  };
  const clearAudioWindows = (): void => {
    stopAudio();
    for(const window of audios.values()) {
      window.canceled = true;
      window.buffers.length = 0;
      void window.iterator?.return().catch(() => {});
    }
    audios.clear();
  };
  const currentPosition = (): number => (playing && !buffering && audioContext
    ? Math.min(total, anchorPosition + audioContext.currentTime - anchorTime) : position);
  const fail = (error: unknown): void => {
    if(destroyed) {
      return;
    }
    position = currentPosition();
    playing = false;
    buffering = false;
    ready = false;
    canvas.dataset.previewPaused = 'true';
    cancelAnimationFrame(animation);
    clearAudioWindows();
    emitState(error instanceof Error ? error.message : 'The preview could not decode this media.');
  };
  const openSource = (url: string, assetId: string): Promise<Source> => {
    const existing = sources.get(url);
    if(existing) {
      return existing.ready;
    }
    const resolvedUrl = resolveMediaUrl?.(url) || url;
    const input = new Input({formats: ALL_FORMATS, source: new UrlSource(resolvedUrl, {
      getRetryDelay: (attempt) => (attempt < 2 ? 0.5 : null),
      handleUnhandledError: (error) => {
        const source = sources.get(url);
        if(source) {
          source.error = error;
        }
      },
      maxCacheSize: 16 * 1024 * 1024,
      requestInit: mediaRequestInit?.(resolvedUrl)
    })});
    const sourceReady = (async (): Promise<Source> => {
      const [video, audio, duration] = await Promise.all([
        input.getPrimaryVideoTrack(), input.getPrimaryAudioTrack(), previewDuration(input)
      ]);
      if(!destroyed && !metadata.has(assetId)) {
        metadata.add(assetId);
        onMetadata(assetId, duration, video ? await video.getDisplayWidth() : undefined,
          video ? await video.getDisplayHeight() : undefined);
      }
      return {audio, duration, input, video};
    })();
    sources.set(url, {input, ready: sourceReady});
    return sourceReady;
  };
  const openImage = (scene: PreviewScene): Promise<void> => {
    const visual = scene.visual!;
    const existing = images.get(visual.url);
    if(existing) {
      return existing.ready;
    }
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = resolveMediaUrl?.(visual.url) || visual.url;
    const currentImage = () => !destroyed && images.get(visual.url)?.image === image;
    const imageReady = image.decode().then(() => {
      if(currentImage() && !metadata.has(visual.assetId)) {
        metadata.add(visual.assetId);
        onMetadata(visual.assetId, 0, image.naturalWidth, image.naturalHeight);
      }
    }).catch((error: unknown) => {
      if(currentImage()) {
        throw error;
      }
    });
    images.set(visual.url, {image, ready: imageReady});
    return imageReady;
  };
  const openVideo = (run: VideoRun, time: number): VideoWindow => {
    const existing = videos.get(run.id);
    if(existing) {
      return existing;
    }
    const window: VideoWindow = {canceled: false, loading: Promise.resolve(), run};
    videos.set(run.id, window);
    window.loading = (async () => {
      const source = await openSource(run.url, run.assetId);
      if(window.canceled || destroyed) {
        return;
      }
      if(!source.video || !await source.video.canDecode()) {
        throw new Error('This browser cannot decode a video in this story. Try a browser with WebCodecs support.');
      }
      window.source = source;
      const from = run.sourceStart + Math.max(0, time - run.start);
      const until = Math.min(source.duration, run.sourceStart + run.end - run.start);
      const [width, height] = await Promise.all([source.video.getDisplayWidth(), source.video.getDisplayHeight()]);
      const scale = Math.min(1, 1280 / width, 720 / height);
      const sink = new CanvasSink(source.video, {
        fit: 'contain', height: Math.max(1, Math.round(height * scale)), poolSize: FRAME_CAPACITY,
        width: Math.max(1, Math.round(width * scale))
      });
      const iterator = sink.canvases(Math.min(from, until - 0.0001), until);
      // Never retain more canvases than the sink pool: the next yield may reuse
      // an old canvas. The queue drops it before requesting its replacement.
      const queue = createPreviewFrameQueue(iterator, {capacity: FRAME_CAPACITY});
      window.queue = queue;
      if(window.canceled || destroyed) {
        queue.destroy();
        return;
      }
      await queue.fill();
    })().catch((error: unknown) => {
      if(!window.canceled && !destroyed) {
        throw error;
      }
    });
    return window;
  };
  const fillAudio = (window: AudioWindow): Promise<void> => {
    if(window.pending) {
      return window.pending;
    }
    window.pending = (async () => {
      while(!window.canceled && !window.ended && window.iterator && window.buffers.length < 64) {
        // Sequential decoder iteration is required to retain presentation order.
        // eslint-disable-next-line no-await-in-loop
        const next = await window.iterator.next();
        if(next.done) {
          window.ended = true;
        } else if(!window.canceled) {
          window.buffers.push(next.value);
        }
      }
    })().finally(() => {
      window.pending = undefined;
    });
    return window.pending;
  };
  const openAudio = (run: AudioRun, time: number): AudioWindow => {
    const existing = audios.get(run.id);
    if(existing) {
      return existing;
    }
    const window: AudioWindow = {buffers: [], canceled: false, ended: false, loading: Promise.resolve(), run,
      scheduledUntil: Math.max(run.start, time)};
    audios.set(run.id, window);
    window.loading = (async () => {
      const source = await openSource(run.url, run.assetId);
      if(window.canceled || destroyed) {
        return;
      }
      if(!source.audio) {
        window.ended = true;
        return;
      }
      if(!await source.audio.canDecode()) {
        throw new Error('This browser cannot decode an audio track in this story.');
      }
      window.iterator = new AudioBufferSink(source.audio).buffers(run.sourceStart + Math.max(0, time - run.start),
        run.sourceStart + run.end - run.start);
      if(window.canceled || destroyed) {
        void window.iterator.return().catch(() => {});
        return;
      }
      await fillAudio(window);
    })().catch((error: unknown) => {
      if(!window.canceled && !destroyed) {
        throw error;
      }
    });
    return window;
  };
  const neededRuns = (time: number): VideoRun[] => {
    const active = runs.filter((run) => run.start <= time && run.end > time);
    const next = runs.filter((run) => run.start > time).sort((a, b) => a.start - b.start)[0];
    return next ? [...active, next] : active;
  };
  const maintain = (positionToPrepare: number): Promise<void>[] => {
    const time = Math.min(positionToPrepare, Math.max(0, total - 0.0001));
    const needed = neededRuns(Math.min(time, total - 0.0001));
    const wantedVideos = new Set(needed.map((run) => run.id));
    const neededScenes = scenes.filter((scene) => scene.end > time && scene.start <= time + LOOKAHEAD_SECONDS);
    const nextScene = scenes.filter((scene) => scene.start > time).sort((a, b) => a.start - b.start)[0];
    if(nextScene && !neededScenes.includes(nextScene)) {
      neededScenes.push(nextScene);
    }
    const wantedAudio = audioRuns.filter((run) => run.end > time && (run.start <= time + LOOKAHEAD_SECONDS
      || (run.embedded && needed.some((video) => `embedded/${video.id}` === run.id))));
    const wantedAudioIds = new Set(wantedAudio.map((run) => run.id));
    const wantedUrls = new Set([...needed.map((run) => run.url), ...wantedAudio.map((run) => run.url)]);
    const wantedImages = new Set(neededScenes.filter((scene) => scene.visual?.kind === 'image').map((scene) => scene.visual!.url));
    for(const [id, window] of videos) {
      if(!wantedVideos.has(id)) {
        window.canceled = true;
        window.queue?.destroy();
        videos.delete(id);
      }
    }
    for(const [id, window] of audios) {
      if(!wantedAudioIds.has(id)) {
        window.canceled = true;
        window.buffers.length = 0;
        void window.iterator?.return().catch(() => {});
        audios.delete(id);
      }
    }
    for(const [url, source] of sources) {
      if(!wantedUrls.has(url)) {
        source.input.dispose();
        sources.delete(url);
      }
    }
    for(const [url, {image}] of images) {
      if(!wantedImages.has(url)) {
        image.removeAttribute('src');
        images.delete(url);
      }
    }
    const required: Promise<void>[] = [];
    const warm = (pending: Promise<void>, active: boolean): void => {
      if(active) {
        required.push(pending);
      } else {
        // A slow future clip must not delay the current frame. Its rejected promise is
        // retained by its window and becomes a visible error if playback reaches it.
        void pending.catch(() => {});
      }
    };
    for(const run of needed) {
      const active = run.start <= time;
      warm(openVideo(run, time).loading, active);
      const error = sources.get(run.url)?.error;
      if(active && error) {
        required.push(Promise.reject(error));
      }
    }
    for(const run of wantedAudio) {
      const active = run.start <= time;
      warm(openAudio(run, time).loading, active);
      const error = sources.get(run.url)?.error;
      if(active && error) {
        required.push(Promise.reject(error));
      }
    }
    for(const scene of neededScenes) {
      if(scene.visual?.kind === 'image') {
        warm(openImage(scene), scene.start <= time);
      }
    }
    return required;
  };
  const draw = (time: number): boolean => {
    const layers = previewLayers(scenes, time);
    const frames = new Map<string, WrappedCanvas>();
    for(const {scene} of layers) {
      if(scene.visual?.kind === 'video') {
        const run = sceneRuns.get(scene.id)!;
        const window = videos.get(run.id);
        const queue = window?.queue;
        const sourceTime = previewSourceTime(scene, time);
        const sample = queue?.at(sourceTime);
        if(!sample || (sourceTime >= sample.timestamp + Math.max(0.045, sample.duration) && !queue?.ended)) {
          void queue?.fill().catch((error: unknown) => {
            if(!window?.canceled) {
              fail(error);
            }
          });
          return false;
        }
        frames.set(scene.id, sample);
        void queue?.fill().catch((error: unknown) => {
          if(!window?.canceled) {
            fail(error);
          }
        });
      } else if(scene.visual?.kind === 'image' && !images.get(scene.visual.url)?.image.complete) {
        return false;
      }
    }
    // The clock and Flux listeners still advance on every tick. Only upload/composite
    // pixels when a source frame or transition opacity actually changes.
    canvas.dataset.previewPosition = String(time);
    const paintKey = JSON.stringify(layers.map(({opacity, scene}) => [
      sceneRuns.get(scene.id)?.id || scene.id, frames.get(scene.id)?.timestamp, opacity
    ]));
    if(paintKey === paintedKey) {
      return true;
    }
    paintedKey = paintKey;
    context.globalAlpha = 1;
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    const drawScene = (scene: PreviewScene): void => {
      const drawVisual = (source: CanvasImageSource, sourceWidth: number, sourceHeight: number): void => {
        const scale = Math.min(canvas.width / sourceWidth, canvas.height / sourceHeight);
        const width = sourceWidth * scale;
        const height = sourceHeight * scale;
        const x = (canvas.width - width) / 2;
        const y = (canvas.height - height) / 2;
        if(!scene.overlay) {
          context.fillStyle = '#000';
          context.fillRect(0, 0, canvas.width, y);
          context.fillRect(0, y + height, canvas.width, y);
          context.fillRect(0, y, x, height);
          context.fillRect(x + width, y, x, height);
        }
        context.drawImage(source, x, y, width, height);
      };
      const sample = frames.get(scene.id);
      if(scene.text) {
        context.font = `${Math.max(18, Math.round(canvas.height / 18))}px sans-serif`;
        context.textAlign = 'center';
        context.fillStyle = 'white';
        context.strokeStyle = 'black';
        context.lineWidth = 3;
        context.strokeText(scene.text, canvas.width / 2, canvas.height * 0.88, canvas.width * 0.9);
        context.fillText(scene.text, canvas.width / 2, canvas.height * 0.88, canvas.width * 0.9);
      }
      if(sample) {
        drawVisual(sample.canvas, sample.canvas.width, sample.canvas.height);
        canvas.dataset.previewSourceTime = String(sample.timestamp);
        canvas.dataset.previewSourceDuration = String(videos.get(sceneRuns.get(scene.id)!.id)?.source?.duration || 0);
      } else if(scene.visual?.kind === 'image') {
        const {image} = (images.get(scene.visual.url)!);
        drawVisual(image, image.naturalWidth, image.naturalHeight);
      } else if(!scene.overlay && !scene.text) {
        context.fillStyle = '#000';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
    };
    const base = layers.filter(({scene}) => !scene.overlay);
    if(base.length === 2) {
      const outgoing = base[0]!.scene;
      const incoming = base[1]!.scene;
      paintTransition(context, canvas.width, canvas.height, outgoing.transition?.type || 'crossfade',
        (time - incoming.start) / (outgoing.end - incoming.start),
        () => drawScene(outgoing), () => drawScene(incoming));
    } else if(base[0]) {
      drawScene(base[0].scene);
    }
    for(const {scene} of layers.filter((layer) => layer.scene.overlay)) {
      drawScene(scene);
    }
    context.globalAlpha = 1;
    return true;
  };
  const scheduleAudio = (time: number): void => {
    if(!audioContext || !output) {
      return;
    }
    for(const window of audios.values()) {
      const {run} = window;
      while(window.buffers.length) {
        const data = window.buffers[0]!;
        const timelineStart = run.start + data.timestamp - run.sourceStart;
        if(timelineStart > time + AUDIO_AHEAD_SECONDS) {
          break;
        }
        window.buffers.shift();
        const start = Math.max(time, run.start, timelineStart);
        const end = Math.min(run.end, timelineStart + data.duration);
        if(end <= start) {
          continue;
        }
        const node = audioContext.createBufferSource();
        node.buffer = data.buffer;
        const gain = audioContext.createGain();
        node.connect(gain);
        gain.connect(output);
        node.onended = () => {
          playingNodes.delete(node);
          node.disconnect();
          gain.disconnect();
        };
        playingNodes.set(node, gain);
        const when = Math.max(audioContext.currentTime, anchorTime + start - anchorPosition);
        gain.gain.setValueAtTime(previewAudioGain(scenes, run.sceneIds, start), when);
        gain.gain.linearRampToValueAtTime(previewAudioGain(scenes, run.sceneIds, end), when + end - start);
        node.start(when, start - timelineStart, end - start);
        window.scheduledUntil = Math.max(window.scheduledUntil, end);
      }
      void fillAudio(window).catch((error: unknown) => {
        if(!window.canceled) {
          fail(error);
        }
      });
    }
  };
  const audioReady = (time: number): boolean => [...audios.values()].every((window) => {
    const last = window.buffers.at(-1);
    const availableUntil = Math.max(window.scheduledUntil,
      last ? window.run.start + last.timestamp + last.duration - window.run.sourceStart : 0);
    return previewAudioReady({availableUntil, end: window.run.end, ended: window.ended, start: window.run.start}, time);
  });
  const tick = (): void => {
    if(destroyed || !playing) {
      return;
    }
    const next = currentPosition();
    for(const pending of maintain(next)) {
      void pending.catch(fail);
    }
    if(audioReady(next) && draw(next)) {
      if(buffering) {
        buffering = false;
        anchorPosition = position;
        anchorTime = audioContext!.currentTime;
        emitState();
      }
      position = next;
      onPosition(position);
      scheduleAudio(position);
      if(position >= total) {
        playing = false;
        canvas.dataset.previewPaused = 'true';
        clearAudioWindows();
        onEnded();
        return;
      }
    } else if(!buffering) {
      position = next;
      buffering = true;
      clearAudioWindows();
      emitState();
    }
    animation = requestAnimationFrame(tick);
  };
  const prepare = (time: number): Promise<void> => {
    if(destroyed) {
      return Promise.resolve();
    }
    const target = Math.max(0, Math.min(total, time));
    if(preparePromise && Math.abs(position - target) < 0.001) {
      return preparePromise;
    }
    if(ready && Math.abs(position - target) < 0.001 && draw(target)) {
      return Promise.resolve();
    }
    const version = ++epoch;
    paintedKey = '';
    position = target;
    buffering = true;
    ready = false;
    for(const window of videos.values()) {
      window.canceled = true;
      window.queue?.destroy();
    }
    videos.clear();
    clearAudioWindows();
    emitState();
    preparePromise = Promise.all(maintain(target)).then(() => {
      if(version !== epoch || destroyed) {
        return;
      }
      if(!draw(target)) {
        throw new Error('The first preview frame could not be decoded.');
      }
      // Construct the audio graph during preparation; cold device initialization can
      // otherwise block the first Play click. No resume or audio scheduling occurs here.
      ensureAudioContext();
      ready = true;
      buffering = false;
      anchorPosition = position;
      anchorTime = audioContext?.currentTime || 0;
      emitState();
    }).catch((error: unknown) => {
      if(version === epoch) {
        fail(error);
        throw error;
      }
    }).finally(() => {
      if(version === epoch) {
        preparePromise = undefined;
      }
    });
    return preparePromise;
  };
  const ensureAudioContext = (): AudioContext => {
    if(!audioContext) {
      audioContext = new AudioContext();
      output = audioContext.createGain();
      output.gain.value = muted ? 0 : 1;
      output.connect(audioContext.destination);
    }
    return audioContext;
  };
  const pause = (): void => {
    command += 1;
    position = currentPosition();
    playing = false;
    playPromise = undefined;
    canvas.dataset.previewPaused = 'true';
    cancelAnimationFrame(animation);
    clearAudioWindows();
    if(ready && buffering) {
      buffering = false;
      emitState();
    }
  };
  const play = (): Promise<void> => {
    if(destroyed) {
      return Promise.resolve();
    }
    if(playPromise) {
      return playPromise;
    }
    if(playing) {
      return Promise.resolve();
    }
    // Resume occurs synchronously in the user gesture, before any async preparation.
    const resumed = ensureAudioContext().resume();
    const version = ++command;
    playing = true;
    canvas.dataset.previewPaused = 'false';
    buffering = true;
    if(position >= total) {
      position = 0;
      ready = false;
    }
    playPromise = (async () => {
      await resumed;
      if(version !== command || destroyed) {
        return;
      }
      await prepare(position);
      if(version !== command || destroyed) {
        return;
      }
      await Promise.all(maintain(position));
      if(version !== command || !playing || destroyed) {
        return;
      }
      buffering = false;
      anchorPosition = position;
      anchorTime = audioContext!.currentTime;
      emitState();
      scheduleAudio(position);
      cancelAnimationFrame(animation);
      animation = requestAnimationFrame(tick);
    })().catch((error: unknown) => {
      if(version === command) {
        fail(error);
      }
    }).finally(() => {
      if(version === command) {
        playPromise = undefined;
      }
    });
    return playPromise;
  };
  const seek = async (time: number): Promise<void> => {
    pause();
    await prepare(time);
  };
  const setRatio = (ratio: number): void => {
    if(!Number.isFinite(ratio) || ratio <= 0) {
      return;
    }
    // Bound the compositor raster; originals stay untouched and are used for export.
    paintedKey = '';
    canvas.width = Math.round(Math.min(1280, 720 * ratio));
    canvas.height = Math.round(canvas.width / ratio);
    if(ready) {
      draw(position);
    }
  };
  setRatio(16 / 9);
  canvas.dataset.previewPaused = 'true';
  return {
    destroy: (): void => {
      pause();
      destroyed = true;
      epoch += 1;
      for(const window of videos.values()) {
        window.canceled = true;
        window.queue?.destroy();
      }
      videos.clear();
      for(const source of sources.values()) {
        source.input.dispose();
      }
      sources.clear();
      for(const {image} of images.values()) {
        image.removeAttribute('src');
      }
      images.clear();
      output?.disconnect();
      void audioContext?.close().catch(() => {});
      // Release the compositor's native backing store, including while a replacement is prepared.
      canvas.width = 0;
      canvas.height = 0;
    },
    pause,
    play,
    prepare,
    seek,
    setMuted: (value: boolean): void => {
      muted = value;
      if(output) {
        output.gain.value = value ? 0 : 1;
      }
    },
    setRatio
  };
};
