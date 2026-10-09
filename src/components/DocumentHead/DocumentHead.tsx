import {useEffect, useLayoutEffect, useRef} from 'react';

import {acquireDocumentHead} from '../../head/documentHeadRegistry.js';
import {prepareHeadMetadata} from '../../head/prepareHeadMetadata.js';

import type {HeadLease} from '../../head/documentHeadRegistry.js';
import type {DocumentHeadProps} from '../../head/types.js';

export type {DocumentHeadProps} from '../../head/types.js';

/* eslint-disable react-hooks/rules-of-hooks -- Compatibility rule does not recognize arrow components. */
export const DocumentHead = ({cleanup, metadata, missingTags, owner}: DocumentHeadProps): null => {
  const lease = useRef<HeadLease | undefined>(undefined);
  const prepared = prepareHeadMetadata(owner, metadata);
  const options = {cleanup, missingTags};
  const current = useRef({options, prepared});
  current.current = {options, prepared};
  const useBrowserEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;

  useBrowserEffect(() => {
    const acquired = acquireDocumentHead(document, owner, current.current.prepared, current.current.options);
    lease.current = acquired;
    return () => {
      acquired.release();
      lease.current = undefined;
    };
  }, [owner]);
  useBrowserEffect(() => {
    lease.current?.update(prepared, options);
  });
  return null;
};
/* eslint-enable react-hooks/rules-of-hooks */
