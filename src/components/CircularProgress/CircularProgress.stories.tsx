import {CircularProgress} from './CircularProgress.js';

import type {Meta, StoryObj} from '@nlabs/lex/storybook';

const meta: Meta<typeof CircularProgress> = {
  args: {label: 'Uploading', size: 112, value: 64},
  component: CircularProgress,
  parameters: {backgrounds: {default: 'dark'}, layout: 'centered'},
  title: 'Application UI/Feedback/CircularProgress'
};
export default meta;
type Story = StoryObj<typeof CircularProgress>;
export const Eclipse: Story = {};
export const Thumbnail: Story = {args: {size: 96}};
export const Empty: Story = {args: {value: 0}};
export const Complete: Story = {args: {value: 100}};
