import {defineConfig} from 'vitest/config';

// Keep the audited capabilities at 90% per file within the shared suite.
const auditedFiles = [
  'src/components/AuthSignInForm/AuthSignInForm.tsx',
  'src/components/AuthSignUpForm/AuthSignUpForm.tsx',
  'src/components/DocumentHead/DocumentHead.tsx',
  'src/components/ScrollableNavbar/ScrollableNavbar.tsx',
  'src/config/appConfig.tsx',
  'src/form/authSchemas.ts',
  'src/head/documentHeadRegistry.ts',
  'src/head/prepareHeadMetadata.ts',
  'src/head/renderDocumentHead.ts',
  'src/utils/navEventQueue.ts',
  'src/utils/navigationHandlers.ts',
  'src/utils/routeAnalytics.ts',
  'src/views/AuthSignInView/AuthSignInView.tsx',
  'src/views/AuthSignUpView/AuthSignUpView.tsx'
];

const videoFiles = 'src/{components/{PlaybackControls,VideoPlayer,TimelineVideoPlayer}/*.tsx,utils/{playbackUtils,useInViewport,usePlaybackEvent}.ts}';

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      exclude: [
        'src/**/*.stories.{ts,tsx}',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/components/Chat/**',
        'src/components/Notify/NotifyExample.tsx',
        'src/views/Gotham/GothamProvider.tsx',
        'src/views/Gotham/GothamRoot.tsx'
      ],
      include: [
        'src/components/**/*.{ts,tsx}',
        'src/views/**/*.{ts,tsx}',
        ...auditedFiles,
        videoFiles
      ],
      provider: 'v8',
      thresholds: {
        ...Object.fromEntries(auditedFiles.map((file) => [file, {
          branches: 90,
          functions: 90,
          lines: 90,
          perFile: true,
          statements: 90
        }])),
        branches: 75,
        functions: 85,
        lines: 90,
        statements: 90,
        [videoFiles]: {lines: 90, statements: 90}
      }
    },
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts']
  }
});
