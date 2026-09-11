import {Editor as MonacoEditor} from '@monaco-editor/react';

import {CodeEditor} from './CodeEditor.js';

describe('CodeEditor', () => {
  it('passes editor configuration to Monaco', () => {
    const onChange = vi.fn();
    const editor = CodeEditor({
      height: '400px',
      language: 'json',
      onChange,
      options: {
        minimap: {enabled: false},
        wordWrap: 'on'
      },
      value: '{}'
    });

    expect(editor.type).toBe(MonacoEditor);
    expect(editor.props).toMatchObject({
      height: '400px',
      language: 'json',
      onChange,
      options: {
        minimap: {enabled: false},
        wordWrap: 'on'
      },
      value: '{}'
    });
  });
});
