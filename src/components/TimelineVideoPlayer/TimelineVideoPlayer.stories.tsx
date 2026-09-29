import {TimelineVideoPlayer} from './TimelineVideoPlayer.js';

import type {Meta, StoryObj} from '@nlabs/lex/storybook';

const url = new URL('../../../tests/rendering/fixtures/player.mp4', import.meta.url).href;
const meta: Meta<typeof TimelineVideoPlayer> = {
  args: {
    className: 'w-full max-w-3xl',
    scenes: [
      {audio: [], end: 2.5, id: 'opening', sourceStart: 0.5, start: 0, transition: {duration: 0.5, type: 'crossfade'},
        visual: {assetId: 'sample', kind: 'video', url}},
      {audio: [], end: 4, id: 'closing', sourceStart: 1, start: 2,
        visual: {assetId: 'sample', kind: 'video', url}}
    ]
  },
  component: TimelineVideoPlayer,
  parameters: {docs: {description: {component: 'Compose trimmed video and image scenes with transitions, layered audio, looping, frame ratios, and scene navigation. The decoder is loaded only when a nonempty timeline mounts.'}}},
  tags: ['autodocs'],
  title: 'Media/TimelineVideoPlayer'
};
export default meta;
type Story = StoryObj<typeof TimelineVideoPlayer>;
export const Default: Story = {};
export const Looping: Story = {args: {defaultLoop: true}};
export const Empty: Story = {args: {scenes: []}};

export const LayeredAudio: Story = {
  args: {
    scenes: [
      ...meta.args!.scenes!,
      {audio: [{assetId: 'sound', end: 3, id: 'audio-layer', offset: 0, start: 0, url}],
        end: 3, id: 'overlay', overlay: true, sourceStart: 0, start: 0, text: 'Layered timeline'}
    ]
  }
};
