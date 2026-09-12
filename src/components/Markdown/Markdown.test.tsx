/* @vitest-environment jsdom */
import {render} from '@nlabs/lex/test-react';
import {act, screen} from '@testing-library/react';
import {Profiler} from 'react';

import {fetchJsonFromUrl} from '../../utils/contentUtils.js';
import {Markdown} from './Markdown.js';

vi.mock('../../utils/contentUtils.js', async (importOriginal) => ({
  ...await importOriginal<typeof import('../../utils/contentUtils.js')>(),
  fetchJsonFromUrl: vi.fn()
}));

describe('Markdown', () => {
  it('should render with custom className when provided', () => {
    const customClass = 'custom-class';
    const {container} = render(
      <Markdown className={customClass} content="Some content" />
    );

    const markdownContainer = container.firstChild as HTMLElement;

    expect(markdownContainer).toHaveClass('markdown-container', customClass);
  });

  it('should render with default className when no className is provided', () => {
    const {container} = render(<Markdown content="Some content" />);

    const markdownContainer = container.firstChild as HTMLElement;

    expect(markdownContainer).toHaveClass('markdown-container');
  });

  it('should apply correct default styles', () => {
    const {container} = render(<Markdown content="Some content" />);

    const markdownContainer = container.firstChild as HTMLElement;
    const styles = markdownContainer.getAttribute('style');

    expect(styles).toContain('background-color: transparent');
    expect(styles).toContain('height: 100%');
    expect(styles).toContain('overflow: auto');
    expect(styles).toContain('width: 100%');
  });
});

test('renders inline content in one commit and clears removed content', () => {
  const onRender = vi.fn();
  const {rerender} = render(<Profiler id="markdown" onRender={onRender}><Markdown content="Hello {{name}}" values={{name: 'Gotham'}} /></Profiler>);

  expect(screen.getByText('Hello Gotham')).toBeInTheDocument();
  expect(onRender).toHaveBeenCalledTimes(1);

  rerender(<Profiler id="markdown" onRender={onRender}><Markdown content="" /></Profiler>);

  expect(screen.queryByText('Hello Gotham')).not.toBeInTheDocument();
});

test('does not refetch when template values change and ignores stale responses', async () => {
  let resolveOld: (value: string) => void;
  vi.mocked(fetchJsonFromUrl).mockImplementationOnce(() => new Promise((resolve) => {
    resolveOld = resolve;
  }));
  vi.mocked(fetchJsonFromUrl).mockResolvedValueOnce('Hello {{name}}');
  const {rerender} = render(<Markdown url="/old" />);
  rerender(<Markdown url="/new" values={{name: 'First'}} />);
  await screen.findByText('Hello First');
  rerender(<Markdown url="/new" values={{name: 'Second'}} />);

  expect(screen.getByText('Hello Second')).toBeInTheDocument();
  expect(fetchJsonFromUrl).toHaveBeenCalledTimes(2);

  await act(async () => resolveOld('Stale response'));

  expect(screen.queryByText('Stale response')).not.toBeInTheDocument();
  expect(screen.getByText('Hello Second')).toBeInTheDocument();
});
