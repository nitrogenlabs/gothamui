/**
 * Copyright (c) 2026-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {useContext} from 'react';

import {GothamContext} from './GothamContext.js';

export type AwsRumEventType = 'change' | 'click' | 'edit' | 'page_view' | 'submit' | (string & {});

export interface AwsRumTrackEvent {
  readonly name: string;
  readonly path?: string;
  readonly properties?: Record<string, boolean | number | string>;
  readonly type: AwsRumEventType;
}

export interface AwsRum {
  readonly track: (event: AwsRumTrackEvent) => void;
}

export interface AwsRumDebugOptions {
  readonly enabled?: boolean;
  readonly logger?: (message: string, event: AwsRumTrackEvent) => void;
  readonly target?: AwsRum;
}

export const GOTHAM_ANALYTICS_EVENT = 'nlabs:gotham:analytics';

const copyEvent = (event: AwsRumTrackEvent): AwsRumTrackEvent => ({
  name: event.name,
  ...(event.path ? {path: event.path} : {}),
  ...(event.properties ? {properties: {...event.properties}} : {}),
  type: event.type
});

/**
 * Emits analytics onto Gotham's browser channel. Metropolis subscribes to this
 * channel automatically, which keeps the two packages independently usable.
 */
export const createAwsRumBrowserClient = (): AwsRum => ({
  track: (event: AwsRumTrackEvent): void => {
    if(typeof globalThis.window === 'undefined' || typeof globalThis.CustomEvent !== 'function') {
      return;
    }

    const detail = copyEvent(event);

    globalThis.queueMicrotask(() => {
      globalThis.window.dispatchEvent(new CustomEvent(GOTHAM_ANALYTICS_EVENT, {detail}));
    });
  }
});

// Debug clients opt into console output so local event payloads can be inspected.
const defaultLogger = (message: string, event: AwsRumTrackEvent): void => {
  // eslint-disable-next-line no-console
  console.debug(`${message} ${JSON.stringify(event)}`, event);
};

export const createAwsRumDebugClient = ({
  enabled = true,
  logger = defaultLogger,
  target
}: AwsRumDebugOptions = {}): AwsRum => ({
  track: (event: AwsRumTrackEvent): void => {
    if(enabled) {
      logger('[GothamUI] awsRum.track', event);
    }

    target?.track(event);
  }
});

export const useAwsRum = (): AwsRum | undefined => useContext(GothamContext).awsRum;
