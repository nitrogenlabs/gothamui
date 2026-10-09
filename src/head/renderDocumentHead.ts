import {prepareHeadMetadata} from './prepareHeadMetadata.js';

import type {DocumentHeadMetadata} from './types.js';

const escape = (value: string): string => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll('\'', '&#39;');

export const renderDocumentHead = ({metadata, owner}: {
  readonly metadata: DocumentHeadMetadata;
  readonly owner: string;
}): string => {
  const snapshot = prepareHeadMetadata(owner, metadata);
  const output: string[] = [];
  if(snapshot.title !== undefined) {
    output.push(`<title>${escape(snapshot.title)}</title>`);
  }
  for(const item of snapshot.meta) {
    const attribute = item.name !== undefined ? 'name' : 'property';
    output.push(`<meta ${attribute}="${escape(item[attribute]!)}" content="${escape(item.content)}" />`);
  }
  if(snapshot.canonicalUrl !== undefined) {
    output.push(`<link rel="canonical" href="${escape(snapshot.canonicalUrl)}" />`);
  }
  for(const script of snapshot.jsonLd) {
    output.push(`<script id="${escape(script.id)}" type="application/ld+json" data-gotham-head-owner="${escape(owner)}">${script.text}</script>`);
  }
  return output.join('\n');
};
