import {PlaybackControlsExample} from '../../examples/PlaybackControlsExample.js';
import {PlaybackControls} from './PlaybackControls.js';

import type {Meta, StoryObj} from '@nlabs/lex/storybook';

const meta: Meta<typeof PlaybackControls> = {
  component: PlaybackControls,
  parameters: {docs: {description: {component: 'Presentation-only glass transport controls. The host player owns the media, playback clock, commands, and progress refs. This example connects the controls to a native video element.'}}},
  tags: ['autodocs'],
  title: 'Media/PlaybackControls'
};
export default meta;
type Story = StoryObj<typeof PlaybackControls>;
export const NativeVideoIntegration: Story = {
  render: () => <PlaybackControlsExample src={new URL('../../../tests/rendering/fixtures/player.mp4', import.meta.url).href} />
};
