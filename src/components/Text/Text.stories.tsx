import {interactWithCanvas} from '../../utils/storyInteractions.js';
import {Code, Strong, Text, TextLink} from './Text.js';

import type {Meta, StoryObj} from '@nlabs/lex/storybook';

const meta: Meta<typeof Text> = {
  component: Text,
  parameters: {
    layout: 'centered'
  },
  title: 'Components/Text'
};

export default meta;

type Story = StoryObj<typeof Text>;

export const Default: Story = {
  play: interactWithCanvas,
  render: () => (
    <Text className="max-w-md">
      GothamUI now includes typography primitives with <Strong>strong text</Strong>, inline <Code>code</Code>, and <TextLink href="#">links</TextLink>.
    </Text>
  )
};
