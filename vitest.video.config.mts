import {defineConfig} from 'vitest/config';
import base from './vitest.config.mts';

export default defineConfig({
  ...base,
  test: {
    ...base.test,
    include: [
      'src/components/{PlaybackControls,TimelineVideoPlayer,VideoPlayer}/*.test.tsx',
      'src/media/*.test.ts',
      'src/utils/{playbackUtils,useInViewport,usePlaybackEvent}.test.{ts,tsx}'
    ],
    coverage: {
      enabled: true,
      provider: 'v8',
      include: [
        'src/components/{PlaybackControls,VideoPlayer,TimelineVideoPlayer}/*.tsx',
        'src/utils/{playbackUtils,useInViewport,usePlaybackEvent}.ts'
      ],
      exclude: ['**/*.test.tsx', '**/*.stories.tsx'],
      reporter: ['text'],
      thresholds: {lines: 90, statements: 90}
    }
  }
});
