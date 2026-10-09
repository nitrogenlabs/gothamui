export type JsonValue = null | boolean | number | string | readonly JsonValue[] | {readonly [key: string]: JsonValue};
export type HeadMeta = {readonly content: string; readonly name: string; readonly property?: never}
  | {readonly content: string; readonly name?: never; readonly property: string};
export interface HeadJsonLd {
  readonly id: string;
  readonly value: JsonValue;
}
export interface DocumentHeadMetadata {
  readonly canonicalUrl?: string;
  readonly jsonLd?: readonly HeadJsonLd[];
  readonly meta?: readonly HeadMeta[];
  readonly title?: string;
}
export interface DocumentHeadCleanup {
  readonly metadata?: 'restore' | 'retain';
  readonly structuredData?: 'restore' | 'retain' | 'remove';
}
export interface DocumentHeadOptions {
  readonly cleanup?: DocumentHeadCleanup;
  readonly missingTags?: 'create' | 'ignore';
}
export interface DocumentHeadProps extends DocumentHeadOptions {
  readonly metadata: DocumentHeadMetadata;
  readonly owner: string;
}
export interface PreparedHeadSnapshot {
  readonly canonicalUrl?: string;
  readonly jsonLd: readonly {readonly id: string; readonly text: string}[];
  readonly meta: readonly HeadMeta[];
  readonly owner: string;
  readonly title?: string;
}
