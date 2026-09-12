import {useEffect} from 'react';
import {Flux} from '@nlabs/arkhamjs';
import {FluxProvider} from '@nlabs/arkhamjs-utils-react';

import {GothamActions} from '../../actions/GothamActions.js';
import {interactWithCanvas} from '../../utils/storyInteractions.js';
import {Notify} from './Notify.js';
import {NotifyExample} from './NotifyExample.js';

import type {Meta, StoryObj} from '@nlabs/lex/storybook';
import type {GothamNotifyParams} from './Notify.js';

if (!(Flux as any).isInit) {
  void Flux.init({name: 'gothamui-storybook'});
}

const NotifyTrigger = ({notification}: {readonly notification: GothamNotifyParams}) => {
  useEffect(() => () => {
    GothamActions.notifyClose();
  }, []);

  return (
    <div className="flex min-h-64 items-center justify-center p-8">
      <button
        className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        onClick={() => GothamActions.notify(notification)}
        type="button"
      >
        Open
      </button>
    </div>
  );
};

const meta: Meta<typeof Notify> = {
  argTypes: {
    anchorOrigin: {
      control: 'object'
    },
    message: {
      control: 'text'
    },
    severity: {
      control: 'select',
      options: ['error', 'info', 'success', 'warning']
    }
  },
  component: Notify,
  decorators: [
    (Story) => (
      <FluxProvider flux={Flux}>
        <Story />
        <Notify />
      </FluxProvider>
    )
  ],
  parameters: {
    layout: 'fullscreen'
  },
  title: 'Components/Notify'
};

export default meta;
type Story = StoryObj<typeof Notify>;

export const Basic: Story = {
  play: interactWithCanvas,
  render: () => (
    <NotifyTrigger
      notification={{
        autoHideDuration: 5000,
        message: 'This is a basic notification'
      }}
    />
  )
};

export const Success: Story = {
  play: interactWithCanvas,
  render: () => (
    <NotifyTrigger
      notification={{
        message: 'Operation completed successfully',
        severity: 'success'
      }}
    />
  )
};

export const Error: Story = {
  play: interactWithCanvas,
  render: () => (
    <NotifyTrigger
      notification={{
        message: 'An error occurred',
        severity: 'error'
      }}
    />
  )
};

export const Warning: Story = {
  play: interactWithCanvas,
  render: () => (
    <NotifyTrigger
      notification={{
        message: 'This is a warning message',
        severity: 'warning'
      }}
    />
  )
};

export const Info: Story = {
  play: interactWithCanvas,
  render: () => (
    <NotifyTrigger
      notification={{
        message: 'This is an informational message',
        severity: 'info'
      }}
    />
  )
};

export const TopRight: Story = {
  play: interactWithCanvas,
  render: () => (
    <NotifyTrigger
      notification={{
        anchorOrigin: {
          horizontal: 'right',
          vertical: 'top'
        },
        message: 'This appears in the top right'
      }}
    />
  )
};

export const WithActions: Story = {
  play: interactWithCanvas,
  render: () => (
    <NotifyTrigger
      notification={{
        actions: [
          {
            label: 'Undo',
            onClick: (key) => {
              console.log('Undo clicked', key);
              // Perform undo action
            }
          },
          {
            icon: 'close',
            onClick: (key) => {
              console.log('Close clicked', key);
              GothamActions.notifyClose();
            }
          }
        ],
        message: 'Would you like to undo?'
      }}
    />
  )
};

export const Examples: Story = {
  play: interactWithCanvas,
  render: () => <NotifyExample />
};
