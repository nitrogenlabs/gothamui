/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/react';

import {CircularProgress} from './CircularProgress.js';

describe('CircularProgress', () => {
  it('exposes determinate progress and clamps invalid values', () => {
    const {rerender} = render(<CircularProgress label="Upload clip" value={64} />);

    expect(screen.getByRole('progressbar', {name: 'Upload clip'})).toHaveAttribute('aria-valuenow', '64');

    rerender(<CircularProgress value={150} />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');

    rerender(<CircularProgress value={Number.NaN} />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('keeps SVG definitions unique across uploader and thumbnails', () => {
    const {container} = render(<><CircularProgress value={20} /><CircularProgress value={70} /></>);
    const ids = [...container.querySelectorAll('[id]')].map((node) => node.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
