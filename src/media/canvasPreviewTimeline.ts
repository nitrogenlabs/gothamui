export interface PreviewScene {
  overlay?: boolean;
  text?: string;
  audio: {assetId: string; end: number; id: string; offset: number; start: number; url: string}[];
  end: number;
  id: string;
  sourceStart: number;
  start: number;
  transition?: {duration: number; type: string};
  visual?: {assetId: string; kind: 'video' | 'image'; url: string};
}

export const previewSourceTime = (scene: PreviewScene, position: number): number => scene.sourceStart
  + Math.max(0, Math.min(position - scene.start, scene.end - scene.start - 0.0001));

export const previewLayers = (scenes: PreviewScene[], position: number): {opacity: number; scene: PreviewScene}[] => {
  const total = Math.max(0, ...scenes.map((scene) => scene.end));
  const time = Math.min(position, Math.max(0, total - 0.0001));
  const active = scenes.filter((scene) => !scene.overlay).filter((scene) => scene.start <= time && scene.end > time);
  return active.map((scene, index) => {
    const outgoing = active[index - 1];
    if(outgoing) {
      const progress = Math.min(1, Math.max(0, (time - scene.start) / (outgoing.end - scene.start)));
      return {opacity: outgoing.transition?.type === 'fade' ? Math.max(0, (progress * 2) - 1) : progress, scene};
    }
    const incoming = active[index + 1];
    const progress = incoming ? (time - incoming.start) / (scene.end - incoming.start) : 0;
    return {opacity: incoming && scene.transition?.type === 'fade' ? Math.max(0, 1 - (progress * 2)) : 1, scene};
  }).concat(scenes.filter((scene) => scene.overlay && scene.start <= time && scene.end > time)
    .map((scene) => ({opacity: 1, scene})));
};

export const previewAudioGain = (scenes: PreviewScene[], ids: string[], time: number): number => {
  let gain = 0;
  for(const [index, scene] of scenes.entries()) {
    if(!ids.includes(scene.id) || time < scene.start || time > scene.end) {
      continue;
    }
    if(scene.overlay) {
      gain = 1;
      continue;
    }
    const prior = scenes[index - 1];
    const next = scenes[index + 1]?.overlay ? undefined : scenes[index + 1];
    const incoming = prior && prior.end > scene.start && time < prior.end
      ? (time - scene.start) / (prior.end - scene.start) : 1;
    const outgoing = next && scene.end > next.start && time >= next.start
      ? (scene.end - time) / (scene.end - next.start) : 1;
    gain = Math.max(gain, Math.min(incoming, outgoing));
  }
  return Math.max(0, Math.min(1, gain));
};

export const previewAudioReady = (
  audio: {availableUntil: number; end: number; ended: boolean; start: number}, time: number
): boolean => audio.ended || time < audio.start || time >= audio.end
  || audio.availableUntil >= Math.min(audio.end, time + 0.15) - 0.00001;
