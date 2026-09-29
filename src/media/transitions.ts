export type TransitionFamily = 'cut' | 'dissolve' | 'dip' | 'wipe' | 'slide' | 'push' | 'zoom' | 'blur' | 'iris' | 'pixel';
export type TransitionDirection = 'left' | 'right' | 'up' | 'down' | 'in' | 'out';
interface TransitionDefinition {
  color?: 'black' | 'white';
  direction?: TransitionDirection;
  family: TransitionFamily;
  label: string;
  order: number;
  /** Conservative provisional export seconds per overlap second at 720p. */
  renderWeight: number;
}

/** Transition styles supported by the timeline compositor. */
export const TRANSITIONS = {
  black: {color: 'black', family: 'dip', label: 'Dip to black', order: 2, renderWeight: 3},
  blur: {family: 'blur', label: 'Blur dissolve', order: 18, renderWeight: 160},
  crossfade: {family: 'dissolve', label: 'Cross dissolve', order: 1, renderWeight: 2},
  cut: {family: 'cut', label: 'Cut', order: 0, renderWeight: 0},
  'iris-close': {direction: 'in', family: 'iris', label: 'Iris close', order: 20, renderWeight: 8},
  'iris-open': {direction: 'out', family: 'iris', label: 'Iris open', order: 19, renderWeight: 8},
  'pixel-dissolve': {family: 'pixel', label: 'Pixel dissolve', order: 21, renderWeight: 12},
  'push-down': {direction: 'down', family: 'push', label: 'Push down', order: 15, renderWeight: 12},
  'push-left': {direction: 'left', family: 'push', label: 'Push left', order: 12, renderWeight: 12},
  'push-right': {direction: 'right', family: 'push', label: 'Push right', order: 13, renderWeight: 12},
  'push-up': {direction: 'up', family: 'push', label: 'Push up', order: 14, renderWeight: 12},
  'slide-down': {direction: 'down', family: 'slide', label: 'Slide down', order: 11, renderWeight: 8},
  'slide-left': {direction: 'left', family: 'slide', label: 'Slide left', order: 8, renderWeight: 8},
  'slide-right': {direction: 'right', family: 'slide', label: 'Slide right', order: 9, renderWeight: 8},
  'slide-up': {direction: 'up', family: 'slide', label: 'Slide up', order: 10, renderWeight: 8},
  white: {color: 'white', family: 'dip', label: 'Dip to white', order: 3, renderWeight: 3},
  'wipe-down': {direction: 'down', family: 'wipe', label: 'Wipe down', order: 7, renderWeight: 4},
  'wipe-left': {direction: 'left', family: 'wipe', label: 'Wipe left', order: 4, renderWeight: 4},
  'wipe-right': {direction: 'right', family: 'wipe', label: 'Wipe right', order: 5, renderWeight: 4},
  'wipe-up': {direction: 'up', family: 'wipe', label: 'Wipe up', order: 6, renderWeight: 4},
  'zoom-in': {direction: 'in', family: 'zoom', label: 'Zoom in', order: 16, renderWeight: 20},
  'zoom-out': {direction: 'out', family: 'zoom', label: 'Zoom out', order: 17, renderWeight: 20}
} as const satisfies Record<string, TransitionDefinition>;
export type VideoTransition = keyof typeof TRANSITIONS;
export type TimelineTransition = VideoTransition | 'dissolve' | 'fade' | 'match';
export const VIDEO_TRANSITIONS = (Object.keys(TRANSITIONS) as VideoTransition[])
  .sort((a, b) => TRANSITIONS[a].order - TRANSITIONS[b].order);
export const isVideoTransition = (value: unknown): value is VideoTransition => typeof value === 'string'
  && Object.hasOwn(TRANSITIONS, value);
export const isTimelineTransition = (value: unknown): value is TimelineTransition => isVideoTransition(value)
  || value === 'dissolve' || value === 'fade' || value === 'match';
export const normalizeTransition = (value: string): VideoTransition => {
  const legacy: Record<string, VideoTransition> = {dissolve: 'crossfade', fade: 'black', match: 'cut'};
  if(Object.hasOwn(legacy, value)) {
    return legacy[value]!;
  }
  if(!isVideoTransition(value)) {
    throw new RangeError('Choose a supported transition.');
  }
  return value;
};
export const transitionDefinition = (value: string): TransitionDefinition => TRANSITIONS[normalizeTransition(value)];
export const TRANSITION_STYLE = {blurRadius: 0.03, blurSteps: 4, pixelColumns: 32, pixelRows: 18, zoom: 0.4} as const;
export const transitionPixelRank = (column: number, row: number): number =>
  ((column * 73) + (row * 151) + (column * row * 19)) % 997 / 997;
