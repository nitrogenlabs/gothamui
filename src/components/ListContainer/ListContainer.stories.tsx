import React from 'react';

import {interactWithCanvas} from '../../utils/storyInteractions.js';
import {Avatar} from '../Avatar/Avatar.js';
import {MediaObject} from '../MediaObject/MediaObject.js';
import {ListContainer, ListItem} from './ListContainer.js';

import type {Meta, StoryObj} from '@nlabs/lex/storybook';

const meta: Meta<typeof ListContainer> = {
  component: ListContainer,
  parameters: {
    layout: 'padded'
  },
  title: 'Application UI/Lists/ListContainer'
};

export default meta;

type Story = StoryObj<typeof ListContainer>;

export const Card: Story = {
  args: {
    variant: 'card'
  },
  play: interactWithCanvas,
  render: (args) => (
    <ListContainer {...args}>
      <ListItem>
        <MediaObject
          description="Updated the release checklist."
          media={<Avatar initials="NG" />}
          title="Nitrogen Labs"
        />
      </ListItem>
      <ListItem>
        <MediaObject
          description="Published component stories."
          media={<Avatar initials="JS" />}
          title="GothamUI"
        />
      </ListItem>
    </ListContainer>
  )
};
