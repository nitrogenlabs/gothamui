# GothamUI

> **GothamJS is now GothamUI.** Install `@nlabs/gothamui`. Existing component APIs and subpath exports are preserved. See the [migration guide](MIGRATION.md).

![GothamUI lowercase g logo](docs/assets/gothamui-logo.png)

[![npm version](https://img.shields.io/npm/v/@nlabs/gothamui.svg?style=flat-square)](https://www.npmjs.com/package/@nlabs/gothamui)
[![npm downloads](https://img.shields.io/npm/dm/@nlabs/gothamui.svg?style=flat-square)](https://www.npmjs.com/package/@nlabs/gothamui)
[![Documentation](https://img.shields.io/badge/docs-gothamui.nitrogenx.co-6d28d9?style=flat-square)](https://gothamui.nitrogenx.co)
[![Issues](http://img.shields.io/github/issues/nitrogenlabs/gothamui.svg?style=flat-square)](https://github.com/nitrogenlabs/gothamui/issues)
[![TypeScript](https://badges.frapsoft.com/typescript/version/typescript-next.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Chat](https://img.shields.io/discord/446122412715802649.svg)](https://discord.gg/Ttgev58)

GothamUI provides React 19 components, routing, forms, and Tailwind CSS v4 styles.

## Documentation

Start with [Getting Started](#getting-started) below. Detailed guides live in `docs/`:

- [API reference](docs/api-reference.md), including authentication forms, document head, drawers, chat, and notifications
- [Analytics](docs/analytics.md)
- [Payment methods](docs/payments.md)
- [Video players](docs/video-player.md)
- [Migration from GothamJS](MIGRATION.md)

## Getting Started

```bash
# Install GothamUI
npm install @nlabs/gothamui

# Or with yarn
yarn add @nlabs/gothamui
```

Create your first GothamUI application:

```jsx
import {createRoot} from 'react-dom/client';
import {Gotham} from '@nlabs/gothamui';

// Define your application configuration
const config = {
  app: {
    name: 'my-awesome-app',
    title: 'My Awesome App'
  },
  routes: [
    {
      path: '/',
      element: <HomePage />,
      props: {
        topBar: {
          logo: <img src="/logo.png" alt="Logo" />,
          menu: [
            { label: 'Sign In', url: '/signin' },
            { label: 'Sign Up', url: '/signup' }
          ]
        }
      }
    }
  ]
};

// Render your application
const root = createRoot(document.getElementById('app'));
root.render(<Gotham config={config} />);
```

## CSS and Styling

GothamUI uses Tailwind CSS with custom theme variables for consistent styling. To use GothamUI components with proper styling in your project, you need to import the GothamUI theme CSS.

### Importing GothamUI Styles

```css
/* Import GothamUI theme CSS in your main CSS file */
@import '@nlabs/gothamui/styles/tailwind.css';
```

### Tailwind CSS v4 Configuration

Since GothamUI uses Tailwind CSS v4, configuration is done via CSS custom properties instead of a `tailwind.config.js` file. The GothamUI theme CSS already includes all the necessary color variables.

If you need to customize the theme further, you can override the CSS custom properties in your own CSS:

```css
/* In your main CSS file, after importing GothamUI styles */
@import '@nlabs/gothamui/styles/tailwind.css';

/* Override GothamUI theme variables */
@theme {
  --color-primary: #your-custom-primary;
  --color-secondary: #your-custom-secondary;
}
```

### Source Detection (Tailwind v4.2)

Tailwind v4.2 uses source detection instead of `content` arrays in JavaScript config.
GothamUI already includes `@source` for its own components, and your app can add sources in CSS when needed:

```css
/* src/styles/main.css */
@import '@nlabs/gothamui/styles/tailwind.css';

/* Optional: explicit app source paths (useful in monorepos/non-standard layouts) */
@source "../**/*.{js,jsx,ts,tsx}";
```

For PostCSS, use the Tailwind v4 plugin package (`@tailwindcss/postcss`):

#### Webpack Configuration

```js
// webpack.config.js
module.exports = {
  // ... other webpack config
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('@tailwindcss/postcss')
                ]
              }
            }
          }
        ]
      }
    ]
  }
};
```

#### Lex Configuration

```js
// lex.config.mjs
export default {
  // ... other config
  tailwindCssPath: './src/styles/main.css'
};
```

#### Vite Configuration

```js
// vite.config.js
export default {
  css: {
    postcss: {
      plugins: [
        require('@tailwindcss/postcss')
      ]
    }
  }
}
```

### What Gets Imported

The GothamUI theme CSS includes:

- **Custom Color Palette**: Primary, secondary, neutral, success, error, warning, and info colors
- **Dark Mode Support**: Automatic dark mode variants for all colors
- **Typography**: Inter font family with proper font weights
- **Autofill Styles**: Browser autofill styling fixes for form inputs
- **Base Styles**: Essential CSS resets and utilities

### Using GothamUI Colors in Your Components

```jsx
// GothamUI colors are available as Tailwind classes
<div className="bg-primary text-white dark:bg-primary-dark dark:text-black-dark">
  Styled with GothamUI theme
</div>

// Or use them in custom CSS
.my-component {
  background-color: var(--color-primary);
  color: var(--color-white);
}
```

## Components

GothamUI provides a rich set of components to accelerate your development:

### Chat Components

GothamUI now includes a first-party chat UI module based on the `react-chat-elements` component set.

```tsx
// Option 1: Namespace import from root package
import {Chat} from '@nlabs/gothamui';

// Option 2: Direct chat subpath import
import {ChatList, MessageBox, MessageList} from '@nlabs/gothamui/chat';
```

Chat components inherit their runtime styles from GothamUI's Tailwind v4 stylesheet, so import [`@nlabs/gothamui/styles/tailwind.css`](#importing-gothamui-styles) once at your app entrypoint.

### Icons

GothamUI includes the complete [Lucide React](https://lucide.dev/) icon library, providing you with over 1000+ beautifully designed, customizable icons that follow a consistent design language.

#### Quick Reference

- **Icon Gallery**: [Browse all available icons](https://lucide.dev/icons/)
- **Documentation**: [Lucide React documentation](https://lucide.dev/guide/packages/lucide-react)
- **GitHub**: [Lucide project on GitHub](https://github.com/lucide-icons/lucide)

#### Usage

```jsx
import { Camera, Heart, Star, Settings, LucideLoader } from '@nlabs/gothamui/icons';

const MyComponent = () => (
  <div>
    <Camera size={24} />
    <Heart size={24} color="red" />
    <Star size={24} fill="yellow" />
    <Settings size={24} />
    <LucideLoader size={24} /> {/* Use LucideLoader to avoid conflict with GothamUI Loader component */}
  </div>
);
```

#### Icon Properties

All Lucide React icons support these common properties:

```jsx
<Camera
  size={24}           // Icon size in pixels
  color="currentColor" // Icon color
  strokeWidth={2}     // Stroke width
  fill="none"         // Fill color
  className="my-icon" // CSS classes
/>
```

> **Note**: The `Loader` icon from Lucide React is exported as `LucideLoader` to avoid conflicts with GothamUI's `Loader` component.

### Forms

Use `Form` with a Zod schema and field components to collect and validate input:

```jsx
import { Button, Form, TextField } from '@nlabs/gothamui';
import { z } from 'zod';

// Define your form schema with Zod
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

const LoginForm = () => (
  <Form
    schema={loginSchema}
    onSubmit={handleSubmit}
    showErrors={true}        // Show form-level errors at top
    mode="onBlur"            // Validate on blur for better UX
  >
    {({isSubmitting, disabled}) => (
      <>
        <TextField
          name="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          required
        />
        <TextField
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          label="Sign In"
          disabled={isSubmitting}
          isLoading={isSubmitting}
        />
      </>
    )}
  </Form>
);
```

### Legacy Form Components

```jsx
import { Form, TextField, Button } from '@nlabs/gothamui';
import { z } from 'zod';

// Define your form schema with Zod
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

const LoginForm = () => (
  <Form
    schema={loginSchema}
    onSubmit={(data) => console.log('Form submitted:', data)}
  >
    <TextField
      name="email"
      label="Email"
      placeholder="Enter your email"
    />
    <TextField
      name="password"
      type="password"
      label="Password"
      placeholder="Enter your password"
    />
    <Button
      type="submit"
      variant="contained"
      color="primary"
      label="Sign In"
    />
  </Form>
);
```

### Payment Method Panel

`PaymentMethodPanel` displays an empty or masked saved-payment state while your application owns the provider integration. It never collects or stores card credentials.

```tsx
import {PaymentMethodPanel} from '@nlabs/gothamui';

<PaymentMethodPanel
  brand="Visa"
  last4="4242"
  onAdd={openPaymentProvider}
  onRemove={removePaymentMethod}
/>
```

Use `isAdding` and `isRemoving` to represent provider operations. See the [payment-method documentation](docs/payments.md) for empty states, customization, props, and the security boundary.

### UI Components

```jsx
import { Button, Notify, Loader } from '@nlabs/gothamui';

// Stylish button with multiple variants
<Button
  variant="contained" // 'contained', 'outlined', or 'text'
  color="primary"     // 'primary', 'secondary', 'success', 'error', etc.
  size="md"           // 'sm', 'md', or 'lg'
  onClick={handleClick}
>
  Click Me
</Button>

// Show notifications
<Notify
  message="Operation completed successfully!"
  severity="success" // 'success', 'info', 'warning', or 'error'
  autoHideDuration={5000}
/>

// Loading indicator
<Loader size="md" />
```

### Drawer

`Drawer` is a controlled modal side panel with focus trapping, Escape and backdrop
dismissal, and a damped spring animation. It opens from the right by default;
set `side="left"` to open from the left. Reduced-motion preferences skip the animation.

```tsx
import {DialogTitle, Drawer} from '@nlabs/gothamui/components';
import {useState} from 'react';

export const ProjectDetails = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} type="button">View project</button>
      <Drawer onClose={setOpen} open={open}>
        <header className="flex items-center justify-between border-b p-6">
          <DialogTitle>Project details</DialogTitle>
          <button onClick={() => setOpen(false)} type="button">Close</button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <p>Review the project without leaving this page.</p>
        </div>
      </Drawer>
    </>
  );
};
```

| Prop | Type / default | Purpose |
| --- | --- | --- |
| `open` | `boolean`, required | Controls visibility. |
| `onClose` | `(open: boolean) => void`, required | Receives dismissal requests; update your state to close. |
| `side` | `'left' \| 'right'`, default `'right'` | Selects the screen edge. |
| `onAfterClose` | `() => void` | Runs after the exit settles, useful for clearing selected content. |
| `className` | `string` | Customizes the panel, such as `max-w-xl` for a wider drawer. |
| `backdropClassName` | `string` | Customizes the backdrop. |
| `children` | `ReactNode` | Supplies the header, body, and actions. |

Keep `<Drawer>` mounted while `open` changes; wrapping it in `{open && ...}`
removes the exit animation and prevents `onAfterClose` from running. Keep selected
content until that callback if it should remain visible during the exit.
Include a `DialogTitle` child to give the dialog an accessible name, as above.
Panel HTML attributes and `style` are supported; the component owns its transform
for animation. The default panel is full height, full width up to `max-w-lg`;
give long content its own scrollable body. See the [Drawer notes](docs/api-reference.md#drawer).

### Markdown

`Markdown` is a lightweight wrapper around `react-markdown` for rendering inline or remote Markdown with optional template values:

```tsx
import {Markdown} from '@nlabs/gothamui';

<Markdown
  content="# GothamUI {{version}}\nAll UI components are publicly exported."
  values={{version: '1.5.4'}}
/>
```

### Image Upload and Paste

`DropUpload` includes a **Paste image** button next to the file browser. Pasted
images use the same `accept`, `maxFileSize`, `maxFiles`, resizing, preview, and
`onFilesChange` behavior as selected or dropped files.

```tsx
<DropUpload
  accept="image/*"
  browseLabel="Browse files"
  label="Drop an image here"
  maxFileSize={5_000_000}
  multiple={false}
  onFilesChange={handleFilesChange}
/>
```

Use `pasteLabel` to customize the button text, or `showPasteButton={false}` to
hide it. Clipboard reading requires HTTPS (or localhost) and may prompt for
permission. If access is unavailable or denied, focus the uploader or one of
its buttons and press Ctrl+V / ⌘V instead. Keyboard paste works independently of
the button and respects a custom `onPaste` handler calling `preventDefault()`.
Text and image URLs are not converted into image files.

### Upload Progress

Pass `progress` to `DropUpload` to show a circular progress overlay while an
upload is in flight. The dropzone is disabled and marked `aria-busy` until
`progress` is removed.

```tsx
<DropUpload
  onFilesChange={handleFilesChange}
  progress={uploading ? {label: 'Uploading…', value: percent} : undefined}
/>
```

### CircularProgress

`CircularProgress` is a determinate, gradient ring with a soft glow and a
centered percentage. It has no continuous animation; the arc transitions
between values and respects `prefers-reduced-motion`. It renders with
`role="progressbar"` and the matching `aria-value*` attributes.

```tsx
import { CircularProgress } from '@nlabs/gothamui';

<CircularProgress label="Uploading" size={112} value={64} />
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` | required | Progress from 0 to 100. Values outside the range are clamped; non-finite values are treated as 0. |
| `label` | `string` | `'Uploading'` | Accessible label (`aria-label`). |
| `size` | `number` | `112` | Width and height in pixels. |
| `className` | `string` | — | Class applied to the wrapper element. |

### Code Editor

Monaco 0.56.0 pins DOMPurify to vulnerable version 3.4.8. Until Monaco updates
that dependency, merge this override into your application's root `package.json`,
then run `npm install` and `npm audit`:

```json
{
  "overrides": {
    "monaco-editor": {
      "dompurify": "^3.4.15"
    }
  }
}
```

GothamUI applies this override for its own development, but npm does not inherit
overrides from installed libraries. Applications need the override even when
they do not import the editor, because Monaco is a package dependency. This
updates the npm dependency tree; it does not update a separately CDN-loaded Monaco.

`CodeEditor` is GothamUI's shared Monaco editor integration. Import it from the dedicated editor entry point so applications that do not use Monaco keep it out of their normal component imports:

```tsx
import {CodeEditor} from '@nlabs/gothamui/editor';

<CodeEditor
  height="400px"
  language="json"
  options={{minimap: {enabled: false}, wordWrap: 'on'}}
  value="{}"
/>
```

### Public Views

Every GothamUI view is part of the public package API. Import views from the package root or from the dedicated `views` entry point:

```tsx
import {DefaultView, Markdown} from '@nlabs/gothamui';
// Or: import {DefaultView} from '@nlabs/gothamui/views';

const ReleaseNotes = () => (
  <DefaultView title="Release notes">
    <Markdown content="# Release notes" />
  </DefaultView>
);
```

The public view exports are `AuthSignInView`, `AuthSignUpView`, `AuthView`, `DefaultView`, `Gotham`, `GothamProvider`, `GothamRoot`, `HomeView`, `LoaderView`, `MenuView`, and `NotFoundView`.

## State Management

GothamUI uses ArkhamJS, a Flux implementation, for state management:

```jsx
import {useFlux} from '@nlabs/arkhamjs-utils-react';
import {GothamActions} from '@nlabs/gothamui';

const MyComponent = () => {
  const flux = useFlux();

  // Navigate to a new route
  const handleNavigation = () => {
    GothamActions.navGoto('/dashboard');
  };

  // Show a notification
  const showNotification = () => {
    GothamActions.notify({
      message: 'This is a notification',
      severity: 'info'
    });
  };

  // Show/hide loading indicator
  const startLoading = () => {
    GothamActions.loading(true, 'Loading data...');

    // After operation completes
    setTimeout(() => {
      GothamActions.loading(false);
    }, 2000);
  };

  return (
    <div>
      <Button onClick={handleNavigation} label="Go to Dashboard" />
      <Button onClick={showNotification} label="Show Notification" />
      <Button onClick={startLoading} label="Start Loading" />
    </div>
  );
};
```

## Routing

GothamUI simplifies routing with React Router integration:

```jsx
const config = {
  routes: [
    {
      path: '/',
      element: <HomeView />,
      props: {
        // Props passed to the component
      }
    },
    {
      path: '/dashboard',
      element: <DashboardView />,
      authenticate: true, // Requires authentication
      children: [
        {
          path: 'profile',
          element: <ProfileView />
        },
        {
          path: 'settings',
          element: <SettingsView />
        }
      ]
    }
  ]
};
```

## Authentication

GothamUI provides built-in authentication support:

```jsx
const config = {
  // Define authentication check function
  isAuth: () => Boolean(localStorage.getItem('token')),
  routes: [
    {
      path: '/protected',
      element: <ProtectedView />,
      authenticate: true // This route requires authentication
    }
  ]
};
```

## Internationalization

Easy internationalization with i18next:

```jsx
const config = {
  translations: {
    en: {
      greeting: 'Hello, {{name}}!',
      buttons: {
        submit: 'Submit'
      }
    },
    es: {
      greeting: '¡Hola, {{name}}!',
      buttons: {
        submit: 'Enviar'
      }
    }
  }
};

// In your component
import {useTranslation} from '@nlabs/gothamui';

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('greeting', { name: 'User' })}</h1>
      <Button label={t('buttons.submit')} />
    </div>
  );
};
```

## Analytics

GothamUI can emit provider-neutral page views and UI events through an injected `awsRum` client. When paired with MetropolisJS, events are deduplicated, batched, and sent to a shared Reaktor analytics app.

```tsx
import {useAwsRum} from '@nlabs/gothamui';

const MyComponent = () => {
  const awsRum = useAwsRum();

  return (
    <button onClick={() => awsRum?.track({name: 'signup', type: 'click'})}>
      Sign up
    </button>
  );
};
```

Learn more in the [Analytics documentation](docs/analytics.md).

## Theming

GothamUI supports light/dark mode and custom themes:

```jsx
const config = {
  displayMode: 'dark', // 'light' or 'dark'
  theme: {
    // Custom theme properties
    colors: {
      primary: '#3f51b5',
      secondary: '#f50057'
    }
  }
};
```

## Configuration

GothamUI is highly configurable:

```jsx
const config = {
  app: {
    name: 'my-app',
    title: 'My Application',
    logo: '/logo.svg',
    titleBarSeparator: '|'
  },
  baseUrl: '',
  storageType: 'local', // 'local' or 'session'
  middleware: [customMiddleware],
  stores: [customStore],
  onInit: () => {
    // Custom initialization logic
    console.log('App initialized');
  }
};
```

## Learn More

Visit our [official documentation](https://gothamui.nitrogenx.co) for comprehensive guides, API references, and examples.

## Using with Lex

Use [Lex](https://github.com/nitrogenlabs/lex) to build, test, and run projects using GothamUI.

### Installation

```bash
# Install Lex globally
npm install -g @nlabs/lex

# Or install locally in your project
npm install --save-dev @nlabs/lex
```

### Lex Project Configuration

Create a `lex.config.mjs` file in your project root:

```js
export default {
  entryJs: 'src/index.tsx',     // Your main entry point
  outputPath: './dist',         // Build output directory
  useTypescript: true,          // Enable TypeScript support
  jest: {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jsdom'
  }
};
```

### Development Workflow

```bash
# Start development server with hot reload
lex dev

# Build for production
lex compile

# Run the complete test suite with coverage
npm test

# Lint and fix code
lex lint --fix

# Update dependencies
lex update --interactive
```

### Integration with GothamUI

Lex automatically detects GothamUI projects and configures Tailwind CSS integration. Your `lex.config.mjs` will include:

```js
export default {
  // ... other config
  tailwindCssPath: './src/styles/main.css',  // Your main CSS file
};
```

### Example Project Structure

```text
my-gothamui-app/
├── src/
│   ├── index.tsx
│   ├── App.tsx
│   ├── styles/
│   │   └── main.css
│   └── components/
├── lex.config.mjs
├── package.json
└── tsconfig.json
```

### CSS Setup with Lex

In your `src/styles/main.css`:

```css
@import '@nlabs/gothamui/styles/tailwind.css';

/* Your custom styles */
@theme {
  /* Override GothamUI theme variables if needed */
}
```

Lex will automatically process this CSS file and include it in your build output.

### Controlled selectors

`SelectField` supports `value` and `onChange(value)` alongside Gotham form context and uncontrolled `defaultValue`. Pass `label` for accessible desktop and mobile controls, `disabled` while updating, and `required` for native form validation. Base spacing is retained when a custom `className` is supplied. Desktop uses the keyboard-accessible listbox; mobile uses a labeled native selector.

### Video playback

Use `VideoPlayer`, `TimelineVideoPlayer`, and `PlaybackControls` from `@nlabs/gothamui/video` for native playback, composed timelines, or custom transports. See [the video player guide](docs/video-player.md) for scene data, callbacks, refs, and integration examples.

### Sidebar motion

Navbar's mobile sidebar uses a damped spring on both expansion and collapse, preserving velocity when direction changes. It responds immediately to `prefers-reduced-motion`, including changes during travel. Closed sidebar content is inert and hidden from assistive technology; closing from within the sidebar returns focus to its trigger. No consumer animation adapter is required.

`SidebarMenu` is a controlled grouped navigation component: provide `groups` (`id`, `label`, `content`), `expandedId`, and `onExpandedChange`. It animates group height with the same damped spring, supports changing content height, and makes collapsed links inert. Consumers render their own router links in each group's content.


### Route analytics metadata

Route `analytics` accepts a `GothamRouteAnalytics` object (`viewId`, optional `route`
and `title`) or a pure `(pathname: string) => GothamRouteAnalytics | undefined`
callback. These types are exported from `@nlabs/gothamui`. GothamRoot selects the
deepest defined metadata from matched routes; an undefined callback falls through
to the parent. Callbacks receive only the raw pathname, never query/hash data;
errors remain visible. Stable `viewId` values deduplicate page views.

Flux navigation uses React Router's NavigateFunction: back/forward move by -1/+1,
goto forwards navigation options, and replace always sets `replace: true` while
preserving caller state. Consumers use public `@nlabs/gothamui/router` hooks and
GothamProvider from `@nlabs/gothamui/views`; do not recreate history/event bindings.

AuthSignInForm and AuthSignUpForm provide reusable credential forms through the root, components and form entries. Full auth views compose them with unchanged defaults. See [auth form options and validation ownership](docs/api-reference.md#authentication-forms).


## Scrollable Navbar

`ScrollableNavbar` (root/components exports) composes `Navbar` with arbitrary children using its documented `navbar-section` and `navbar-item` slots. Pass `activeKey`, `ariaLabel`, Navbar `className`, `wrapperClassName` and `arrowClassName`. Defaults use `scrollable-navbar`/`scrollable-navbar-arrow` plus `is-overflowing`, `can-scroll-left`, `can-scroll-right`, `is-left` and `is-right`; applications own rail/layout styles, links and labels. Controls are native focusable buttons named "Show previous tabs" and "Show more tabs".

The selected item is centered automatically. Mark it with `is-active` or `aria-current="page"`. The arrow controls scroll adjacent items into view.

## License

GothamUI is [MIT licensed](./LICENSE).
