import {useState} from 'react';

import {MarkdownEditor} from './MarkdownEditor.js';

import type {Meta, StoryObj} from '@nlabs/lex/storybook';

const meta: Meta<typeof MarkdownEditor> = {
  component: MarkdownEditor,
  parameters: {
    layout: 'padded'
  },
  title: 'Components/Editor/MarkdownEditor'
};

export default meta;

type Story = StoryObj<typeof MarkdownEditor>;

const sample = '# Chapter one\n\nStart writing with **markdown** shortcuts.\n\n- First\n- Second\n\n> A quote';

const ControlledExample = (props: Partial<Parameters<typeof MarkdownEditor>[0]>) => {
  const [value, setValue] = useState(sample);

  return (
    <div className="grid gap-3">
      <MarkdownEditor aria-label="Story editor" height={360} onChange={setValue} value={value} {...props} />
      <pre className="rounded bg-slate-100 p-2 text-xs dark:bg-slate-800">{value}</pre>
    </div>
  );
};

export const Default: Story = {render: () => <ControlledExample />};

export const WithPlaceholder: Story = {render: () => <ControlledExample placeholder="Write something…" />};

export const ReadOnly: Story = {render: () => <ControlledExample readOnly />};

export const WithHighlights: Story = {
  render: () => (
    <ControlledExample
      highlights={[{end: 29, id: 'bold', start: 22, text: 'markdown'}]}
      onHighlightClick={({highlight}) => window.alert(`Highlight ${highlight.id}`)}
    />
  )
};
