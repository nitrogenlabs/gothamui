import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {Drawer} from './Drawer.js';

describe('Drawer', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {configurable: true, value: () => ({
      addEventListener: () => {}, matches: false, removeEventListener: () => {}
    })});
  });

  it('retains the panel during exit and calls completion after sliding away', async () => {
    const finished = vi.fn();
    const close = vi.fn();
    const {rerender} = render(<Drawer aria-label="Images" onAfterClose={finished} onClose={close} open><button>Choose</button></Drawer>);
    const panel = document.querySelector('[data-slot="drawer-panel"]') as HTMLElement;
    await waitFor(() => expect(panel.style.transform).toBe('translate3d(0%,0,0)'), {timeout: 2000});
    fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Escape'});
    expect(close).toHaveBeenCalledWith(false);
    rerender(<Drawer aria-label="Images" onAfterClose={finished} onClose={close} open={false}><button>Choose</button></Drawer>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(finished).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), {timeout: 2000});
    expect(finished).toHaveBeenCalledTimes(1);
  });

  it('can reverse an exit without completing the close', async () => {
    const finished = vi.fn();
    const props = {onAfterClose: finished, onClose: () => {}};
    const {rerender} = render(<Drawer {...props} open><button>Choose</button></Drawer>);
    await waitFor(() => expect(document.querySelector<HTMLElement>('[data-slot="drawer-panel"]')?.style.transform).toBe('translate3d(0%,0,0)'), {timeout: 2000});
    rerender(<Drawer {...props} open={false}><button>Choose</button></Drawer>);
    rerender(<Drawer {...props} open><button>Choose</button></Drawer>);
    await waitFor(() => expect(document.querySelector<HTMLElement>('[data-slot="drawer-panel"]')?.style.transform).toBe('translate3d(0%,0,0)'));
    expect(finished).not.toHaveBeenCalled();
  });

  it('settles immediately with reduced motion', async () => {
    Object.defineProperty(window, 'matchMedia', {value: () => ({
      addEventListener: () => {}, matches: true, removeEventListener: () => {}
    })});
    const {rerender} = render(<Drawer onClose={() => {}} open side="left"><button>Choose</button></Drawer>);
    await waitFor(() => expect(document.querySelector<HTMLElement>('[data-slot="drawer-panel"]')?.style.transform).toBe('translate3d(0%,0,0)'));
    rerender(<Drawer onClose={() => {}} open={false} side="left"><button>Choose</button></Drawer>);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
