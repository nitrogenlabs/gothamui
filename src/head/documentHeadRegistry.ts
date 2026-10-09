import type {DocumentHeadOptions, PreparedHeadSnapshot} from './types.js';

type Kind = 'canonical' | 'jsonLd' | 'meta' | 'title';
interface Entry {
  attribute?: 'name' | 'property';
  identity?: string;
  key: string;
  kind: Kind;
  value: string;
}
interface LeaseState {
  keys: Set<string>;
  options: DocumentHeadOptions;
  order: number;
  owner: string;
}
interface Claim {
  entry: Entry;
  lease: LeaseState;
}
interface NodeSnapshot {
  attributes: Record<string, string | null>;
  text?: string;
}
interface Field {
  baseline: NodeSnapshot;
  claims: Map<string, Claim>;
  created: boolean;
  entry: Entry;
  last?: NodeSnapshot;
  node: Element;
}
interface Registry {
  fields: Map<string, Field>;
  leases: Map<string, LeaseState>;
  order: number;
}
export interface HeadLease {
  release: () => void;
  update: (snapshot: PreparedHeadSnapshot, options: DocumentHeadOptions) => void;
}

const registries = new WeakMap<Document, Registry>();
const marker = 'data-gotham-head-owner';
const tagNames: Record<Kind, string> = {canonical: 'link', jsonLd: 'script', meta: 'meta', title: 'title'};
const attributeNames: Record<Kind, string[]> = {canonical: ['href'], jsonLd: ['id', 'type', marker], meta: ['content'], title: []};
const entriesFor = (snapshot: PreparedHeadSnapshot): Entry[] => [
  ...(snapshot.title === undefined ? [] : [{key: 'title', kind: 'title' as const, value: snapshot.title}]),
  ...(snapshot.canonicalUrl === undefined ? [] : [{key: 'canonical', kind: 'canonical' as const, value: snapshot.canonicalUrl}]),
  ...snapshot.meta.map((meta): Entry => {
    const attribute = meta.name !== undefined ? 'name' : 'property';
    const identity = meta[attribute]!;
    return {attribute, identity, key: `meta:${attribute}:${identity}`, kind: 'meta', value: meta.content};
  }),
  ...snapshot.jsonLd.map((script): Entry => ({identity: script.id, key: `jsonLd:${script.id}`, kind: 'jsonLd', value: script.text}))
];

const findNode = (doc: Document, entry: Entry, owner: string): Element | null => {
  if(entry.kind === 'title') {
    return doc.head.querySelector('title');
  }
  if(entry.kind === 'canonical') {
    return [...doc.head.querySelectorAll('link')].find((node) => node.getAttribute('rel') === 'canonical') ?? null;
  }
  if(entry.kind === 'meta') {
    return [...doc.head.querySelectorAll('meta')].find((node) => node.getAttribute(entry.attribute!) === entry.identity) ?? null;
  }
  const matches = [...doc.querySelectorAll('[id]')].filter((node) => node.id === entry.identity);
  const node = matches[0];
  if(matches.length > 1 || (node && (!doc.head.contains(node) || node.tagName !== 'SCRIPT'
    || node.getAttribute('type') !== 'application/ld+json'
    || (node.hasAttribute(marker) && node.getAttribute(marker) !== owner)))) {
    throw new Error(`Conflicting JSON-LD script ID: ${entry.identity}`);
  }
  return node ?? null;
};

const snapshotNode = (field: Pick<Field, 'entry' | 'node'>): NodeSnapshot => {
  const {kind} = field.entry;
  const names = attributeNames[kind];
  return {
    attributes: Object.fromEntries([
      ...[...field.node.attributes].map((attribute) => [attribute.name, attribute.value]),
      ...names.map((name) => [name, field.node.getAttribute(name)])
    ]),
    ...kind === 'jsonLd' || kind === 'title' ? {text: field.node.textContent ?? ''} : {}
  };
};
const unchanged = (doc: Document, field: Field): boolean => doc.head.contains(field.node)
  && JSON.stringify(snapshotNode(field)) === JSON.stringify(field.last);
const restore = (field: Field): void => {
  for(const [name, value] of Object.entries(field.baseline.attributes)) {
    if(value === null) {
      field.node.removeAttribute(name);
    } else {
      field.node.setAttribute(name, value);
    }
  }
  if(field.baseline.text !== undefined) {
    field.node.textContent = field.baseline.text;
  }
};
const write = (field: Field, claim: Claim): void => {
  const {kind, value} = claim.entry;
  if(kind === 'meta') {
    field.node.setAttribute('content', value);
  } else if(kind === 'canonical') {
    field.node.setAttribute('href', value);
  } else {
    field.node.textContent = value;
  }
  if(kind === 'jsonLd' || field.created) {
    field.node.setAttribute(marker, claim.lease.owner);
  }
  field.last = snapshotNode(field);
};
const winner = (field: Field): Claim | undefined => [...field.claims.values()]
  .sort((left, right) => right.lease.order - left.lease.order)[0];
const releaseField = (doc: Document, registry: Registry, lease: LeaseState, key: string): void => {
  const field = registry.fields.get(key)!;
  field.claims.delete(lease.owner);
  const next = winner(field);
  if(unchanged(doc, field)) {
    if(next) {
      write(field, next);
    } else {
      const policy = field.entry.kind === 'jsonLd' ? lease.options.cleanup?.structuredData ?? 'restore'
        : lease.options.cleanup?.metadata ?? 'restore';
      if(policy === 'remove' || (policy === 'restore' && field.created)) {
        field.node.remove();
      } else if(policy === 'restore') {
        restore(field);
      }
    }
  }
  if(!next) {
    registry.fields.delete(key);
  }
};
const createNode = (doc: Document, entry: Entry): Element => {
  const tag = tagNames[entry.kind];
  const node = doc.createElement(tag);
  if(entry.kind === 'canonical') {
    node.setAttribute('rel', 'canonical');
  }
  if(entry.kind === 'meta') {
    node.setAttribute(entry.attribute!, entry.identity!);
  }
  if(entry.kind === 'jsonLd') {
    node.id = entry.identity!;
    node.setAttribute('type', 'application/ld+json');
  }
  doc.head.append(node);
  return node;
};

export const acquireDocumentHead = (doc: Document, owner: string, snapshot: PreparedHeadSnapshot,
  options: DocumentHeadOptions): HeadLease => {
  let registry = registries.get(doc);
  if(!registry) {
    registry = {fields: new Map(), leases: new Map(), order: 0};
    registries.set(doc, registry);
  }
  if(registry.leases.has(owner)) {
    throw new Error(`Document head owner already mounted: ${owner}`);
  }
  const state = registry;
  const lease: LeaseState = {keys: new Set(), options, order: state.order + 1, owner};
  let released = false;
  const update = (next: PreparedHeadSnapshot, nextOptions: DocumentHeadOptions): void => {
    if(released || next.owner !== owner) {
      throw new Error('Invalid document head lease update');
    }
    const targets = entriesFor(next).map((entry) => ({entry, node: findNode(doc, entry, owner)}));
    const active = targets.filter(({entry, node}) => node || entry.kind === 'title' || nextOptions.missingTags !== 'ignore');
    const nextKeys = new Set(active.map(({entry}) => entry.key));
    for(const key of lease.keys) {
      if(!nextKeys.has(key)) {
        releaseField(doc, state, lease, key);
      }
    }
    lease.options = nextOptions;
    lease.keys = nextKeys;
    for(const {entry, node: target} of active) {
      let field = state.fields.get(entry.key);
      if(!field || field.node !== target) {
        const node = target ?? createNode(doc, entry);
        field = {
          baseline: snapshotNode({entry, node}), claims: field?.claims ?? new Map(), created: !target, entry, node
        };
        state.fields.set(entry.key, field);
      } else if(field.last && !unchanged(doc, field)) {
        field.baseline = snapshotNode(field);
        field.created = false;
      }
      field.claims.set(owner, {entry, lease});
      write(field, winner(field)!);
    }
  };
  update(snapshot, options);
  state.order = lease.order;
  state.leases.set(owner, lease);
  return {
    release: () => {
      if(released) {
        return;
      }
      for(const key of lease.keys) {
        releaseField(doc, state, lease, key);
      }
      state.leases.delete(owner);
      released = true;
      if(!state.leases.size) {
        registries.delete(doc);
      }
    },
    update
  };
};
