import {spawnSync} from 'node:child_process';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

test('preserves React 19 callbacks and refs through public built TextField declarations', () => {
  const directory = mkdtempSync(join(process.cwd(), '.gotham-textfield-types-'));
  const filename = join(directory, 'consumer.tsx');
  const source = `
    import {TextField} from '@nlabs/gothamui';
    import {TextField as ComponentTextField} from '@nlabs/gothamui/components';
    import type {TextFieldProps} from '@nlabs/gothamui/components';
    import {createRef} from 'react';
    import type {ChangeEvent, FocusEvent} from 'react';
    const ref = createRef<HTMLInputElement | HTMLTextAreaElement>();
    const props: TextFieldProps = {name: 'password', passwordToggleTabIndex: -1, ref, type: 'password'};
    const root = <TextField {...props} onChange={(event) => {
      const typed: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> = event;
      typed.currentTarget.value.toLowerCase();
    }} onFocus={(event) => {
      const typed: FocusEvent<HTMLInputElement | HTMLTextAreaElement> = event;
      typed.currentTarget.focus();
    }} />;
    const component = <ComponentTextField name="confirmPassword" passwordToggleTabIndex={-1}
      ref={(element) => { element?.focus(); }} showPasswordToggle type="password" />;
  `;

  try {
    writeFileSync(filename, source);
    const result = spawnSync(process.execPath, [
      join(process.cwd(), 'node_modules/typescript/bin/tsc'),
      '--ignoreConfig', '--noEmit', '--skipLibCheck', '--strict', '--jsx', 'react-jsx',
      '--module', 'ESNext', '--moduleResolution', 'bundler', '--target', 'ES2022', filename
    ], {encoding: 'utf8'});

    expect({output: result.stdout + result.stderr, status: result.status}).toEqual({output: '', status: 0});
  } finally {
    rmSync(directory, {force: true, recursive: true});
  }
});
