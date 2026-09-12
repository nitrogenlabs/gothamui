import {CodeEditor} from './CodeEditor.js';

import type {Meta, StoryObj} from '@nlabs/lex/storybook';

const meta: Meta<typeof CodeEditor> = {
  component: CodeEditor,
  parameters: {
    layout: 'padded'
  },
  title: 'Components/Editor/CodeEditor'
};

export default meta;

type Story = StoryObj<typeof CodeEditor>;

export const Json: Story = {
  args: {
    height: '400px',
    language: 'json',
    options: {
      minimap: {enabled: false},
      wordWrap: 'on'
    },
    value: '{\n  "framework": "GothamUI",\n  "editor": "Monaco"\n}'
  }
};
