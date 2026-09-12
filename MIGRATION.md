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

The `Gotham` component, `GothamActions`, configuration, props, and existing subpath exports retain their names. No component API rename is required. Version 1.8.0 starts the new package's release history and includes the rendering improvements documented in [render performance](docs/render-performance.md).

## Existing installations

The old `@nlabs/gothamjs` package remains installable for existing applications. After the new package is published and verified, its npm deprecation notice will direct users to `@nlabs/gothamui`. It will receive no further releases. Replace the dependency rather than installing both packages directly.

Update your repository remote:

```sh
git remote set-url origin git@github.com:nitrogenlabs/gothamui.git
```

GitHub redirects old repository links after the repository rename. Documentation links should use the new hostname; the microsite migration also retains legacy path redirects.
