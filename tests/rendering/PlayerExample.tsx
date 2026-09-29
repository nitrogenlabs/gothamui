import {useState} from 'react';

import {TimelineVideoPlayer, VideoPlayer} from '../../src/video/index.js';
import '../../src/styles/index.css';

import type {TimelineVideoScene} from '../../src/video/index.js';

const scenes: TimelineVideoScene[] = [
  {audio: [], end: 2.5, id: 'first', sourceStart: 0.5, start: 0, transition: {duration: 0.5, type: 'crossfade'},
    visual: {assetId: 'first', kind: 'video', url: '/player.mp4'}},
  {audio: [{assetId: 'sound', end: 1, id: 'audio', offset: 0, start: 0, url: '/player.mp4'}], end: 4, id: 'second', sourceStart: 1, start: 2,
    visual: {assetId: 'second', kind: 'video', url: '/player.mp4'}}
];

export const PlayerExample = () => {
  const [src, setSrc] = useState('/player.mp4');
  const timeline = new URLSearchParams(window.location.search).has('timeline');
  return <main className="mx-auto max-w-3xl p-4">
    {timeline ? <TimelineVideoPlayer scenes={scenes} /> : <>
      <VideoPlayer aria-label="Demo" className="aspect-video w-full" controls muted src={src} />
      <button className="cursor-pointer" onClick={() => setSrc('/broken.mp4')} type="button">Broken source</button>
      <button className="cursor-pointer" onClick={() => setSrc('/player.mp4')} type="button">Restore source</button>
      <VideoPlayer aria-label="Poster" className="size-24" poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/%3E" src="/passive.mp4" />
    </>}
  </main>;
};
