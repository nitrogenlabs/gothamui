/* @vitest-environment jsdom */
/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {render} from '@nlabs/lex/test-react';
import {Flux} from '@nlabs/arkhamjs';
import {FluxProvider} from '@nlabs/arkhamjs-utils-react';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {vi} from 'vitest';

import {GothamActions} from '../../actions/GothamActions.js';
import {Notify} from './Notify.js';

describe('Notify', () => {
  it('should render without crashing', () => {
    const {container} = render(<Notify />);

    expect(container).toBeDefined();
  });

  it('should not display notification initially', () => {
    const {queryByRole} = render(<Notify />);

    expect(queryByRole('alert')).not.toBeInTheDocument();
  });

  it('opens notifications dispatched through the Flux provider', async () => {
    if (!(Flux as any).isInit) {
      await Flux.init({name: 'gothamui-test'});
    }

    render(
      <FluxProvider flux={Flux}>
        <button onClick={() => GothamActions.notify({message: 'Preview notification'})} type="button">
          Open
        </button>
        <Notify />
      </FluxProvider>
    );

    fireEvent.click(screen.getByRole('button', {name: 'Open'}));

    expect(await screen.findByText('Preview notification')).toBeInTheDocument();
  });

  it('renders and invokes notification actions', async () => {
    const onUndo = vi.fn();

    if (!(Flux as any).isInit) {
      await Flux.init({name: 'gothamui-test'});
    }

    render(
      <FluxProvider flux={Flux}>
        <button
          onClick={() => GothamActions.notify({
            actions: [{label: 'Undo', onClick: onUndo}],
            message: 'Would you like to undo?'
          })}
          type="button"
        >
          Open
        </button>
        <Notify />
      </FluxProvider>
    );

    fireEvent.click(screen.getByRole('button', {name: 'Open'}));
    fireEvent.click(await screen.findByRole('button', {name: 'Undo'}));

    expect(screen.getByText('Would you like to undo?')).toBeInTheDocument();
    expect(onUndo).toHaveBeenCalledWith('notification');
  });

  it('renders severity alerts and dismisses them', async () => {
    if (!(Flux as any).isInit) {
      await Flux.init({name: 'gothamui-test'});
    }

    render(
      <FluxProvider flux={Flux}>
        <button
          onClick={() => GothamActions.notify({
            anchorOrigin: {horizontal: 'right', vertical: 'top'},
            autoHideDuration: 0,
            message: 'Saved successfully',
            severity: 'success'
          })}
          type="button"
        >
          Open
        </button>
        <Notify />
      </FluxProvider>
    );

    fireEvent.click(screen.getByRole('button', {name: 'Open'}));

    expect(await screen.findByText('Saved successfully')).toBeInTheDocument();
    expect(screen.queryByText('Dismiss')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Dismiss'}));

    await waitFor(() => expect(screen.queryByText('Saved successfully')).not.toBeInTheDocument());
  });
});
