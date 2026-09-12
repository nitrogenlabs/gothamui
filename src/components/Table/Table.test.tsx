/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/react';
import {Profiler} from 'react';

import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from './Table.js';

describe('Table', () => {
  it('renders table sections and linked rows', () => {
    render(
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow href="/projects/1" title="Open GothamUI">
            <TableCell>GothamUI</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByRole('columnheader', {name: 'Name'})).toBeInTheDocument();
    expect(screen.getByText('GothamUI')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Open GothamUI'})).toHaveAttribute('href', '/projects/1');
  });
});

test('does not invalidate unchanged table context when wrapper props change', () => {
  const onRender = vi.fn();
  const children = <TableBody><Profiler id="row" onRender={onRender}><TableRow><TableCell>Stable cell</TableCell></TableRow></Profiler></TableBody>;
  const {rerender} = render(<Table className="first">{children}</Table>);
  const renders = onRender.mock.calls.length;
  rerender(<Table className="second">{children}</Table>);

  expect(onRender).toHaveBeenCalledTimes(renders);

  rerender(<Table className="second" dense>{children}</Table>);

  expect(onRender).toHaveBeenCalledTimes(renders + 1);
});
