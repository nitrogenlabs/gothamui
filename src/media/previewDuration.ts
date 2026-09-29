import type {Input} from 'mediabunny';

/** Avoid scanning remote packets when the container already supplies a duration. */
export const previewDuration = async (
  input: Pick<Input, 'computeDuration' | 'getDurationFromMetadata'>
): Promise<number> => (await input.getDurationFromMetadata()) ?? input.computeDuration();
