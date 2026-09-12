export default {
  entryJs: 'app.tsx',
  gitUrl: 'https://github.com/nitrogenlabs/gothamui',
  jest: {
    collectCoverage: false,
    coverageThreshold: {
      global: {
        branches: 0,
        functions: 0,
        lines: 0,
        statements: 0
      }
    },
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    globals: {
      'ts-jest': {
        tsconfig: './tsconfig.test.json'
      }
    },
    moduleNameMapper: {
      '\\.(css|jpg|png|svg|txt)$': '<rootDir>/node_modules/@nlabs/lex/emptyModule.js',
      '^@nlabs/utils$': '<rootDir>/node_modules/@nlabs/utils',
      '^@nlabs/utils/checks/isEmpty$': '<rootDir>/node_modules/@nlabs/utils/lib/checks/isEmpty/isEmpty.js',
      '^@nlabs/utils/objects/get$': '<rootDir>/node_modules/@nlabs/utils/lib/objects/get/get.js',
      '^@nlabs/utils/objects/merge$': '<rootDir>/node_modules/@nlabs/utils/lib/objects/merge/merge.js',
      '^@nlabs/utils/objects/set$': '<rootDir>/node_modules/@nlabs/utils/lib/objects/set/set.js',
      '^@nlabs/utils/objects/throttle$': '<rootDir>/node_modules/@nlabs/utils/lib/objects/throttle/throttle.js',
      '^@nlabs/utils/strings/cn$': '<rootDir>/node_modules/@nlabs/utils/lib/strings/cn/cn.js',
      '^@nlabs/utils/strings/qs$': '<rootDir>/node_modules/@nlabs/utils/lib/strings/qs/qs.js',
      '^react$': '<rootDir>/node_modules/react',
      '^react-dom$': '<rootDir>/node_modules/react-dom'
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jsdom',
    // Ensure coverage thresholds are permissive for local development
    transformIgnorePatterns: [
      'node_modules/(?!(strip-indent|chalk|@testing-library/jest-dom|zod|@nlabs|@nlabs/arkhamjs|@nlabs/utils|@nlabs/lex|react-markdown|react|react-dom|develop)/.*)'
    ]
  },
  outputPath: './lib',
  useTypescript: true
};
