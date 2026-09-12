import {Editor as MonacoEditor} from '@monaco-editor/react';
import {render} from '@testing-library/react';

import {CodeEditor} from './CodeEditor.js';

vi.mock('@monaco-editor/react', () => ({Editor: vi.fn(() => null)}));

describe('CodeEditor', () => {
  it('passes configuration to Monaco and skips unchanged parent updates', () => {
    const onChange = vi.fn();
    const options = {minimap: {enabled: false}, wordWrap: 'on' as const};
    const props = {height: '400px', language: 'json', onChange, options, value: '{}'};
    const {rerender} = render(<CodeEditor {...props} />);

    expect(MonacoEditor).toHaveBeenLastCalledWith(props, undefined);

    const renders = vi.mocked(MonacoEditor).mock.calls.length;
    rerender(<CodeEditor {...props} />);

    expect(MonacoEditor).toHaveBeenCalledTimes(renders);

    rerender(<CodeEditor {...props} value="[]" />);

    expect(MonacoEditor).toHaveBeenCalledTimes(renders + 1);
    expect(MonacoEditor).toHaveBeenLastCalledWith({...props, value: '[]'}, undefined);

    const nextOnChange = vi.fn();
    rerender(<CodeEditor {...props} onChange={nextOnChange} />);

    expect(MonacoEditor).toHaveBeenLastCalledWith({...props, onChange: nextOnChange}, undefined);
  });
});
