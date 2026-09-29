import {VideoPlayer} from './VideoPlayer.js';

import type {Meta, StoryObj} from '@nlabs/lex/storybook';

const meta: Meta<typeof VideoPlayer> = {
  args: {
    'aria-label': 'Sample video',
    className: 'aspect-video w-full max-w-2xl rounded-xl',
    controls: true,
    muted: true,
    src: new URL('../../../tests/rendering/fixtures/player.mp4', import.meta.url).href
  },
  component: VideoPlayer,
  parameters: {docs: {description: {component: 'Native video playback with responsive glass controls, caption tracks, poster-first loading, and viewport-aware cleanup.'}}},
  tags: ['autodocs'],
  title: 'Media/VideoPlayer'
};
export default meta;
type Story = StoryObj<typeof VideoPlayer>;
export const Default: Story = {};
export const Passive: Story = {args: {controls: false}};
export const Compact: Story = {args: {className: 'aspect-video w-64 rounded-xl'}};

export const PosterFirst: Story = {
  args: {poster: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="640" height="360"%3E%3Crect width="640" height="360" fill="%2315182b"/%3E%3Ctext x="320" y="180" text-anchor="middle" fill="white" font-size="24"%3EPlay the sample%3C/text%3E%3C/svg%3E'}
};
