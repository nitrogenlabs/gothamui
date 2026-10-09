/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {get, merge} from '@nlabs/utils';

export class Config {
  static values: Record<string, unknown> = {};

  static set = (values: Record<string, unknown>): Record<string, unknown> => {
    const {i18n, ...settings} = values;
    merge(this.values, settings);
    // Translation engines contain cyclic runtime references and must remain
    // the supplied instance rather than recursively merging their internals.
    if(Object.hasOwn(values, 'i18n')) {
      this.values.i18n = i18n;
    }
    return this.values;
  };

  static get(path: string | string[], defaultValue?: unknown): unknown {
    const environment: string = (globalThis as any).process?.env?.NODE_ENV || 'development';
    const configValues: Record<string, unknown> = {...this.values, environment};
    return get(configValues, path, defaultValue);
  }
}
