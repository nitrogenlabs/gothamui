# Chat declaration packaging — 2026-11-10

Vault's strict frontend check cannot resolve the Chat contract imported by the public components declarations in published GothamUI1.15.0. The source contract was named `type.d.ts`; Lex emitted an empty `type.d.js` and omitted the actual declaration from the package. This affects consumers of public components as well as the dedicated chat entry point.

The source baseline is clean published1.15.0 producer b1581499267ea62a0dbe30a6d2d11bd9be2dae56. Registry dist SHA1 `fd4f83ec530e4964c4920748549051264d5df8db` matches the preserved1.15 archive (SHA256 `72dd1ae4416de30f28c6a77c0f32a0eb8ab9419b62c4f38232a5cabaaf862188`). The original producer branch/archive remain preserved; this candidate uses codex/gotham-chat-type-packaging.

The candidate emits the same contract from `type.ts`, retains ambient class signatures with `declare`, uses React19's `React.JSX`, and exports four event/item types already consumed by sibling Chat components. Relative Chat entry and contract import specifiers include `.js` so emitted declarations resolve under NodeNext as well as Bundler. Component behavior and the historical public Object/Function/union/interface contracts are preserved.

The standalone `tests/chat-declarations` public consumer checks components and chat package exports, React19 callback inference, rejected invalid properties, and retained broad legacy Object/Function assignability. It uses strict/exactOptionalPropertyTypes and skipLibCheck:false, with the usual browser CSS asset module binding. `npm run test:public-types` runs both module modes after the build. It is a separate compiler integration check, not a unit test spawning a compiler or performing real filesystem/network work.

Qualification uses the existing installed Lex2.1.0, TypeScript7.0.2 and React19.3.0 producer profile without a new install. Lex2.1.0 can report successful process exit after a declaration failure, so actual declaration success logs and the independent public compiler checks are mandatory; the build now includes the latter. There is no installed dependency patch or source alias.

The historical ambient file has an inherited lint baseline. Exact original b158 contract and candidate were both passed through the same installed public Lex-resolved ESLint via stdin classified as src/components/Chat/type.ts: original463errors0warnings, candidate462errors0warnings. The candidate does not suppress these rules or narrow the legacy public ABI to satisfy semantic autofixes. An attempted Object→object autofix was rejected and restored before qualification because it rejects existing Avatar size values. New consumer fixtures pass scoped lint with zero warnings. Full producer strict compilation also has an independently recorded57-error dependency baseline (Jest/Vitest matcher augmentation, dom-webcodecs/lib.dom, Monaco and lightbox); the new public consumer's strict check is clean in both modes.

Full owner suite, immutable archive review, publication and actual registry consumer adoption remain separately recorded gates. No archive is a consumer dependency substitute. The intended patch is1.15.1; distribution tag/publishing needs coordinating owner approval, and latest must not move implicitly.

Local producer verification completed:

- Full Lex owner suite:127files/458tests passed18.27s; unchanged full-suite coverage96.09% statements/90.19% branches/95.21% functions/96.24% lines.
- Fresh `npm run build` generates declarations successfully and runs both strict public consumer modes; both pass. No dependency installation or installed-package patch was required.
- Scoped public fixture lint passes with zero warnings. Exact inherited ambient-file baseline is463original/462candidate errors under identical forced `.ts` classification, with0warnings in both cases.
- Mutation checks prove the new public regression: removing emitted type.d.ts fails with missing declarations; changing legacy Avatar.size Object to object fails the positive legacy assignment. Both generated-file mutations were restored byte-exact in finally, then the complete build/public checks passed again. Restoration SHA256577174aeb60cfc5694a271d2377539fa7ce7a9d0c654da7b1af4d6a1ca0032b2.

Publication remains held for coordinating owner review of clean source and frozen archive. No registry tag or Vault manifest was changed by this candidate.
