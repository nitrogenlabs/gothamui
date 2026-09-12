import {Markdown} from '../../index.js';
import {focusCanvas} from '../../utils/storyInteractions.js';

import type {Meta, StoryObj} from '@nlabs/lex/storybook';

const meta: Meta<typeof Markdown> = {
  argTypes: {
    className: {
      control: 'text'
    },
    content: {
      control: 'text'
    }
  },
  component: Markdown,
  parameters: {
    docs: {
      description: {
        component: 'Renders inline or remote Markdown content with optional template values. Publicly import it from `@nlabs/gothamui` or `@nlabs/gothamui/components`.'
      }
    }
  },
  tags: ['autodocs'],
  title: 'Components/Markdown'
};

export default meta;
type Story = StoryObj<typeof Markdown>;

export const Primary: Story = {
  args: {
    className: 'test',
    content: '# Hello\n**Bold text**\n*Italic text*\n- List item'
  },
  play: focusCanvas
};
