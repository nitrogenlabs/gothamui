import type {DocumentHeadMetadata, HeadMeta, PreparedHeadSnapshot} from './types.js';

const stringValue = (value: unknown, label: string, nonempty = false): string => {
  if(typeof value !== 'string' || (nonempty && !value.trim())) {
    throw new TypeError(`Invalid document head ${label}`);
  }
  return value;
};

const rejectSerializationHooks = (value: object): void => {
  let current: object | null = value;
  while(current) {
    const descriptor = Object.getOwnPropertyDescriptor(current, 'toJSON');
    if(descriptor && (!('value' in descriptor) || typeof descriptor.value === 'function')) {
      throw new TypeError('JSON-LD cannot contain serialization hooks');
    }
    current = Object.getPrototypeOf(current);
  }
};

const validateJson = (value: unknown, ancestors: Set<object>): void => {
  if(value === null || typeof value === 'boolean' || typeof value === 'string') {
    return;
  }
  if(typeof value === 'number' && Number.isFinite(value)) {
    return;
  }
  if(typeof value !== 'object' || ancestors.has(value)) {
    throw new TypeError('Invalid JSON-LD value');
  }
  const prototype = Object.getPrototypeOf(value);
  if(!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) {
    throw new TypeError('JSON-LD requires plain JSON objects');
  }
  if(Object.getOwnPropertySymbols(value).length) {
    throw new TypeError('JSON-LD cannot contain symbol keys');
  }
  if(Array.isArray(value) && Object.hasOwn(value, 'toJSON')) {
    throw new TypeError('JSON-LD arrays cannot define toJSON');
  }
  rejectSerializationHooks(value);
  ancestors.add(value);
  if(Array.isArray(value)) {
    for(let index = 0; index < value.length; index++) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
      if(!descriptor || !('value' in descriptor)) {
        throw new TypeError('JSON-LD cannot contain array holes or accessors');
      }
      validateJson(descriptor.value, ancestors);
    }
  } else {
    for(const descriptor of Object.values(Object.getOwnPropertyDescriptors(value))) {
      if(!('value' in descriptor)) {
        throw new TypeError('JSON-LD cannot contain accessors');
      }
      validateJson(descriptor.value, ancestors);
    }
  }
  ancestors.delete(value);
};

const unique = (seen: Set<string>, key: string): void => {
  if(seen.has(key)) {
    throw new TypeError(`Duplicate document head identity: ${key}`);
  }
  seen.add(key);
};

export const prepareHeadMetadata = (owner: string, metadata: DocumentHeadMetadata): PreparedHeadSnapshot => {
  stringValue(owner, 'owner', true);
  if(!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    throw new TypeError('Invalid document head metadata');
  }
  const {canonicalUrl, jsonLd = [], meta = [], title} = metadata;
  if(!Array.isArray(meta) || !Array.isArray(jsonLd)) {
    throw new TypeError('Head descriptors must be arrays');
  }
  if(title !== undefined) {
    stringValue(title, 'title');
  }
  if(canonicalUrl !== undefined) {
    stringValue(canonicalUrl, 'canonical URL');
  }
  const seenMeta = new Set<string>();
  const seenScripts = new Set<string>();
  const preparedMeta: HeadMeta[] = meta.map((item) => {
    if(!item || (item.name !== undefined) === (item.property !== undefined)) {
      throw new TypeError('Meta requires exactly one name or property');
    }
    const attribute = item.name !== undefined ? 'name' : 'property';
    const key = stringValue(item[attribute], 'meta key', true);
    const content = stringValue(item.content, 'meta content');
    unique(seenMeta, `${attribute}:${key}`);
    return Object.freeze(attribute === 'name' ? {content, name: key} : {content, property: key});
  });
  const preparedScripts = jsonLd.map((item) => {
    if(!item) {
      throw new TypeError('Invalid JSON-LD descriptor');
    }
    const id = stringValue(item.id, 'script ID', true);
    unique(seenScripts, id);
    validateJson(item.value, new Set());
    const text = JSON.stringify(item.value).replaceAll('<', '\\u003c')
      .replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029');
    return Object.freeze({id, text});
  });
  return Object.freeze({
    canonicalUrl, jsonLd: Object.freeze(preparedScripts), meta: Object.freeze(preparedMeta), owner, title
  });
};
