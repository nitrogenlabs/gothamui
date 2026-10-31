import '@testing-library/jest-dom/vitest';
import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {Tab, TabGroup, TabList, TabPanel, TabPanels} from './index.js';

const Example = ({manual = false, onChange}: {manual?: boolean; onChange?: (index: number) => void}) =>
  <TabGroup defaultIndex={0} manual={manual} onChange={onChange}>
    <TabList aria-label="Media type">
      <Tab className={({selected}) => (selected ? 'selected' : 'unselected')}>Image</Tab>
      <Tab disabled>Unavailable</Tab>
      <Tab>Video</Tab>
      <Tab>Audio</Tab>
    </TabList>
    <TabPanels>
      <TabPanel unmount={false}>Image settings</TabPanel>
      <TabPanel unmount={false}>Unavailable settings</TabPanel>
      <TabPanel unmount={false}>Video settings</TabPanel>
      <TabPanel unmount={false}>Audio settings</TabPanel>
    </TabPanels>
  </TabGroup>;

afterEach(cleanup);

describe('public tab-panel primitives', () => {
  it('owns selected state, reciprocal ARIA relationships and hidden inactive panels', () => {
    const onChange = vi.fn();
    render(<Example onChange={onChange} />);
    const image = screen.getByRole('tab', {name: 'Image'});
    const panel = screen.getByRole('tabpanel', {name: 'Image'});

    expect(screen.getByRole('tablist', {name: 'Media type'})).toBeVisible();
    expect(image).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', image.id);
    expect(image).toHaveAttribute('aria-selected', 'true');
    expect(image).toHaveClass('selected');
    expect(screen.getByText('Video settings')).not.toBeVisible();
    expect(screen.getByRole('tab', {name: 'Unavailable'})).toBeDisabled();

    fireEvent.click(screen.getByRole('tab', {name: 'Video'}));

    expect(screen.getByRole('tabpanel', {name: 'Video'})).toBeVisible();
    expect(image).toHaveAttribute('aria-selected', 'false');
    expect(onChange).toHaveBeenCalledWith(2);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('supports roving focus, wrapping, disabled skipping and Home/End activation', async () => {
    render(<Example />);
    const image = screen.getByRole('tab', {name: 'Image'});
    const video = screen.getByRole('tab', {name: 'Video'});
    const audio = screen.getByRole('tab', {name: 'Audio'});
    image.focus();
    fireEvent.keyDown(image, {key: 'ArrowRight'});
    await waitFor(() => expect(video).toHaveFocus());

    expect(video).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(video, {key: 'End'});

    expect(audio).toHaveFocus();

    fireEvent.keyDown(audio, {key: 'ArrowRight'});

    expect(image).toHaveFocus();

    fireEvent.keyDown(image, {key: 'ArrowLeft'});

    expect(audio).toHaveFocus();

    fireEvent.keyDown(audio, {key: 'Home'});

    expect(image).toHaveFocus();
  });

  it('supports manual activation without selecting a tab merely on focus', async () => {
    render(<Example manual />);
    const image = screen.getByRole('tab', {name: 'Image'});
    const video = screen.getByRole('tab', {name: 'Video'});
    image.focus();
    fireEvent.keyDown(image, {key: 'ArrowRight'});
    await waitFor(() => expect(video).toHaveFocus());

    expect(image).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(video, {key: 'Enter'});

    expect(video).toHaveAttribute('aria-selected', 'true');
  });
});
