/** Owns bounded sequential lookahead; disposal releases samples and cancels their iterator. */
export const createPreviewFrameQueue = <T extends {duration: number; timestamp: number}>(
  iterator: AsyncIterator<T>, options: {capacity: number; release?: (sample: T) => void}
) => {
  const samples: T[] = [];
  let destroyed = false;
  let ended = false;
  let pending: Promise<void> | undefined;
  const fill = (): Promise<void> => {
    if(pending) {
      return pending;
    }
    pending = (async () => {
      while(!destroyed && !ended && samples.length < options.capacity) {
        // Decoder iteration must stay sequential to preserve presentation order.
        // eslint-disable-next-line no-await-in-loop
        const next = await iterator.next();
        if(next.done) {
          ended = true;
        } else if(destroyed) {
          options.release?.(next.value);
        } else {
          samples.push(next.value);
        }
      }
    })().finally(() => {
      pending = undefined;
    });
    return pending;
  };
  return {
    at: (time: number): T | undefined => {
      while(samples.length > 1 && samples[1]!.timestamp <= time + 0.00001) {
        const previous = samples.shift()!;
        options.release?.(previous);
      }
      return samples[0];
    },
    destroy: (): void => {
      destroyed = true;
      for(const sample of samples.splice(0)) {
        options.release?.(sample);
      }
      // Generator.return waits for any pending next; its eventual result is disposed above.
      void iterator.return?.().catch(() => {});
    },
    get ended(): boolean {
      return ended;
    },
    fill,
    get size(): number {
      return samples.length;
    }
  };
};
