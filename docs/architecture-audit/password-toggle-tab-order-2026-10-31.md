# Password visibility tab order — 2026-10-31

GothamUI owns the password visibility button. Phantaze's sign-up form needs its two visibility controls omitted from sequential Tab navigation while retaining pointer activation. The additive public `TextFieldProps.passwordToggleTabIndex?: number` sets only the internal button's `tabIndex`; omission preserves the existing keyboard behavior and input attributes remain independent.

The producer branch starts at published 1.14.0 source commit `a3623ad`, retaining its content-tab APIs and the prior coalesced profile's public export paths. No consumer dependency has been changed as part of this package work. Registry publication and Phantaze adoption/browser validation remain gates owned by the coordinating task.

Validation on a normal `npm ci --ignore-scripts` install:

- Lex 2.1.0, Vitest/coverage-v8 4.1.11, TypeScript 7.0.2, React/types 19.3.0.
- Red regression reproduced the missing API: the custom prop leaked onto the input and the visibility control remained tabbable.
- `npm run build` passes. `npm test` passes 127 files / 458 tests, including built public root/components React 19 callback inference and ref declarations.
- Full suite coverage: statements 96.09%, branches 90.19%, functions 95.21%, lines 96.24%. TextField: 100%, 94.11%, 100%, 100%, respectively.
- Nonmutating `lex lint --check --config eslint.config.mjs --maxWarnings 0` has 1,337 baseline findings (1,301 errors / 36 warnings). The original changed files yield 1,339 findings; two preexisting test spacing errors were corrected and no new diagnostics remain. The shared rule incorrectly flags valid React `tabIndex` with `Did you mean "tabIndex"?`; two narrow explanatory property-rule suppressions preserve the valid API. The three existing component hook-classification diagnostics remain unchanged. A controlled fixture verified caller config, max-warning failure, and unchanged bytes.
- A clean temporary archive consumer installs the immutable package normally and passes six tests against public package entry points. It checks Tab skipping, unchanged default keyboard activation, pointer toggling/value preservation, and public React 19 types. Standard Vitest dependency inlining handles the package's existing lightbox CSS import; no source aliases, runner links, or installed patches are used.
- All 505 archived `lib` members match the tested producer build. All public export paths from Phantaze's installed 1.11.3 architecture profile remain present.
- Public Lex 2.1.2 immutable `publish --dryRun --packagePath ... --tag latest` succeeds with lifecycle scripts disabled. This does not publish or certify registry adoption.

Frozen review artifact: `/Users/nitrog7/Development/.codex-artifacts/gotham-password-tab-order/nlabs-gothamui-1.15.0.tgz` (515 total archive members).

SHA-256: `72dd1ae4416de30f28c6a77c0f32a0eb8ab9419b62c4f38232a5cabaaf862188`.

Logs are alongside the archive. Publish this exact artifact only after authorization; do not rebuild it from a changed tree. The audit document and regression tests are not shipped in the package archive.
