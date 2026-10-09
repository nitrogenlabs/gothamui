import {GothamConstants} from '../constants/GothamConstants.js';

type Handler = (data: any) => void;

const queue: Map<string, any[]> = new Map();
const handlers: Map<string, Handler> = new Map();

export const enqueue = (type: string, data: any): void => {
  const list = queue.get(type) || [];
  list.push(data);
  queue.set(type, list);
};

export const registerHandler = (type: string, handler: Handler): void => {
  handlers.set(type, handler);

  const queued = queue.get(type);
  if(queued && queued.length) {
    // Flush queued items
    queued.forEach((item) => {
      try {
        handler(item);
      } catch(e) {
        // swallow errors to avoid breaking app init
      }
    });
    queue.delete(type);
  }
};

export const clear = (): void => {
  queue.clear();
  handlers.clear();
};

export const registerFlux = (flux: any): (() => void) => {
  if(!flux || typeof flux.on !== 'function') {
    return () => undefined;
  }

  const capture = (type: string) => (data: any) => {
    const handler = handlers.get(type);
    if(handler) {
      try {
        handler(data);
      } catch(e) {
        // ignore
      }
    } else {
      enqueue(type, data);
    }
  };

  const subscriptions = [
    GothamConstants.NAV_GOTO,
    GothamConstants.NAV_REPLACE,
    GothamConstants.NAV_BACK,
    GothamConstants.NAV_FORWARD
  ].map((type) => ({listener: capture(type), type}));

  subscriptions.forEach(({listener, type}) => flux.on(type, listener));

  return () => subscriptions.forEach(({listener, type}) => flux.off?.(type, listener));
};
