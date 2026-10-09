# Migrate from GothamJS to GothamUI

The project is now **GothamUI**, published as **`@nlabs/gothamui`**. The repository is [nitrogenlabs/gothamui](https://github.com/nitrogenlabs/gothamui) and documentation lives at [gothamui.nitrogenx.co](https://gothamui.nitrogenx.co).

## Update your dependency

```sh
npm uninstall @nlabs/gothamjs
npm install @nlabs/gothamui
```

Keep your existing React 19 and ArkhamJS peer dependencies. Replace `@nlabs/gothamjs` with `@nlabs/gothamui` in imports, mocks, aliases, dependency overrides, bundler configuration, and Tailwind source scanning paths. Regenerate and commit your lockfile with your package manager.

```tsx
import {Gotham, Button} from '@nlabs/gothamui';
import {Check} from '@nlabs/gothamui/icons';
import '@nlabs/gothamui/styles/tailwind.css';
```

```css
@source '../../../node_modules/@nlabs/gothamui/lib/**/*.{js,jsx,ts,tsx}';
```

The `Gotham` component, `GothamActions`, configuration, props, and existing subpath exports retain their names. No component API rename is required.

## Monaco sanitizer security

Monaco 0.57.0 pins DOMPurify 3.4.15, which is affected by
[GHSA-p98j-92pf-mc4p](https://github.com/advisories/GHSA-p98j-92pf-mc4p).
DOMPurify 3.4.16 fixes the detached-subtree event-handler issue. This repository
enforces that minimum in its Monaco override and tests Monaco's resolved sanitizer.

Npm only applies overrides from the application's root manifest; library overrides
do not propagate to consumers. Applications consuming this Monaco version need:

```json
{
  "overrides": {
    "dompurify": "3.4.16"
  }
}
```

Regenerate the lockfile and verify the resolved version with `npm ls dompurify` and
`npm audit`. Remove the override only after Monaco declares a patched sanitizer
and the consumer audit confirms the dependency chain is clean.

## Existing installations

The old `@nlabs/gothamjs` package remains installable for existing applications. After the new package is published and verified, its npm deprecation notice will direct users to `@nlabs/gothamui`. It will receive no further releases. Replace the dependency rather than installing both packages directly.
