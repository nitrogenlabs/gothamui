import React from 'react';
import {interactWithCanvas} from '../../utils/storyInteractions.js';
import {Badge} from '../Badge/Badge.js';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from './Table.js';

import type {Meta, StoryObj} from '@nlabs/lex/storybook';

const meta: Meta<typeof Table> = {
  component: Table,
  parameters: {
    layout: 'padded'
  },
  title: 'Components/Table'
};

export default meta;

type Story = StoryObj<typeof Table>;

export const Default: Story = {
  args: {
    striped: true
  },
  play: interactWithCanvas,
  render: (args) => (
    <Table {...args}>
      <TableHead>
        <TableRow>
          <TableHeader>Package</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Version</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow href="#" title="Open GothamUI">
          <TableCell>GothamUI</TableCell>
          <TableCell><Badge variant="secondary">Ready</Badge></TableCell>
          <TableCell>1.1.0</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>ArkhamJS</TableCell>
          <TableCell><Badge variant="outline">Peer</Badge></TableCell>
          <TableCell>3.31.9</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
};
