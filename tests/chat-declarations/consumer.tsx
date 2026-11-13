import {Avatar, ChatItem, MessageBox} from '@nlabs/gothamui/chat';
import {Button} from '@nlabs/gothamui/components';
import {Gotham} from '@nlabs/gothamui/views';

import type {GothamConfiguration} from '@nlabs/gothamui';
import type {ComponentProps, MouseEvent} from 'react';

export const micrositeConfiguration: GothamConfiguration = {basename: '/writing', routes: []};
export const microsite = <Gotham config={micrositeConfiguration} />;
// @ts-expect-error The public basename is a string, not a numeric routing flag.
export const invalidMicrosite = <Gotham config={{basename: 1}} />;

export const chat = (props: ComponentProps<typeof ChatItem>) => <ChatItem {...props} onClick={(event) => {
  const pointer: MouseEvent = event;
  pointer.preventDefault();
}} />;
export const message = (props: ComponentProps<typeof MessageBox>) => <MessageBox {...props} />;
export const button = <Button disabled onClick={() => undefined}>Save</Button>;
// @ts-expect-error disabled remains a boolean through the public components declarations.
export const invalidButton = <Button disabled="yes">Save</Button>;

// Historical declarations permit primitive size labels through Object; packaging must preserve that ABI.
export const legacyAvatarSize: ComponentProps<typeof Avatar>['size'] = 'large';
// Function remains the historical broad callback contract, including constructors.
export const legacyDragHandler: ComponentProps<typeof ChatItem>['onDragOver'] = class DragHandler {};
// @ts-expect-error Chat item identities remain strings or numbers.
export const invalidIdentity: ComponentProps<typeof ChatItem>['id'] = false;
