# GothamUI API Reference

This document provides detailed information about the components and APIs available in GothamUI.

## Core Components

### `<Gotham>`

The main component that bootstraps your GothamUI application.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `config` | `GothamConfiguration` | `{}` | Configuration object for the application |
| `children` | `ReactNode` | - | Optional child components |
| `classes` | `Record<string, string>` | - | Custom CSS classes |
| `isAuth` | `() => boolean` | - | Authentication check function |

**Example:**

```jsx
import { Gotham } from '@nlabs/gothamui';

const config = {
  app: {
    name: 'my-app',
    title: 'My Application'
  },
  routes: [
    // Your routes
  ]
};

const App = () => (
  <Gotham config={config} />
);
```

### `<GothamProvider>`

Provider component that sets up the GothamUI context.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `config` | `GothamConfiguration` | Required | Configuration object for the application |
| `children` | `ReactNode` | - | Child components |
| `session` | `Record<string, unknown>` | `{}` | Initial session data |

## Public Views

All GothamUI views are public from both `@nlabs/gothamui` and `@nlabs/gothamui/views`.

| View | Purpose |
|------|---------|
| `AuthSignInView` | Complete sign-in screen built on `AuthView` |
| `AuthSignUpView` | Complete account-registration screen built on `AuthView` |
| `AuthView` | Shared authentication layout |
| `DefaultView` | Responsive application shell with standard navigation |
| `Gotham` | GothamUI application bootstrap component |
| `GothamProvider` | Configuration, session, and Flux provider |
| `GothamRoot` | Root route outlet with notifications, loading state, and analytics |
| `HomeView` | Responsive home-page shell |
| `LoaderView` | Flux-connected full-screen loading state |
| `MenuView` | Responsive sidebar application shell |
| `NotFoundView` | Full-page missing-route view |

## Form Components

### `<Form>`

Form component with built-in validation using Zod.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | Required | Form fields and controls |
| `className` | `string` | - | Custom CSS class |
| `defaultValues` | `Record<string, unknown>` | `{}` | Default form values |
| `mode` | `'onSubmit'` \| `'onBlur'` \| `'onChange'` \| `'onTouched'` \| `'all'` | `'onBlur'` | Form validation mode |
| `name` | `string` | `'default'` | Form name (used for test IDs) |
| `onChange` | `(data: unknown) => void` | - | Change handler |
| `onSubmit` | `(data: unknown, event: BaseSyntheticEvent, setError: (field: string, error: { type: string; message: string }) => void) => void` | Required | Submit handler |
| `schema` | `z.ZodSchema<Record<string, unknown>>` | - | Zod validation schema |
| `validate` | `(data: unknown) => void` | - | Custom validation function |
| `validateOnBlur` | `boolean` | - | Whether to validate on blur |

**Example:**

```jsx
import { Form, TextField, Button } from '@nlabs/gothamui';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const LoginForm = () => (
  <Form
    schema={schema}
    onSubmit={(data) => console.log(data)}
    defaultValues={{ email: '', password: '' }}
  >
    <TextField name="email" label="Email" />
    <TextField name="password" type="password" label="Password" />
    <Button type="submit" label="Submit" />
  </Form>
);
```

### `<TextField>`

Text input component.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Custom CSS class |
| `disabled` | `boolean` | `false` | Whether the field is disabled |
| `error` | `string` | - | Error message |
| `id` | `string` | - | Field ID |
| `label` | `string` | - | Field label |
| `name` | `string` | Required | Field name |
| `onChange` | `(event: ChangeEvent<HTMLInputElement>) => void` | - | Change handler |
| `placeholder` | `string` | - | Placeholder text |
| `required` | `boolean` | `false` | Whether the field is required |
| `type` | `'text'` \| `'password'` \| `'email'` \| `'number'` \| `'tel'` | `'text'` | Input type |
| `value` | `string` | - | Field value |

### `<SelectField>`

Dropdown select component.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Custom CSS class |
| `disabled` | `boolean` | `false` | Whether the field is disabled |
| `error` | `string` | - | Error message |
| `id` | `string` | - | Field ID |
| `label` | `string` | - | Field label |
| `name` | `string` | Required | Field name |
| `onChange` | `(event: ChangeEvent<HTMLSelectElement>) => void` | - | Change handler |
| `options` | `Array<{ label: string; value: string }>` | `[]` | Select options |
| `placeholder` | `string` | - | Placeholder text |
| `required` | `boolean` | `false` | Whether the field is required |
| `value` | `string` | - | Field value |

### `<RadioField>`

Radio button group component.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Custom CSS class |
| `disabled` | `boolean` | `false` | Whether the field is disabled |
| `error` | `string` | - | Error message |
| `id` | `string` | - | Field ID |
| `label` | `string` | - | Field label |
| `name` | `string` | Required | Field name |
| `onChange` | `(event: ChangeEvent<HTMLInputElement>) => void` | - | Change handler |
| `options` | `Array<{ label: string; value: string }>` | `[]` | Radio options |
| `required` | `boolean` | `false` | Whether the field is required |
| `value` | `string` | - | Field value |

### `<DateField>`

Date picker component.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Custom CSS class |
| `disabled` | `boolean` | `false` | Whether the field is disabled |
| `error` | `string` | - | Error message |
| `id` | `string` | - | Field ID |
| `label` | `string` | - | Field label |
| `name` | `string` | Required | Field name |
| `onChange` | `(date: Date) => void` | - | Change handler |
| `placeholder` | `string` | - | Placeholder text |
| `required` | `boolean` | `false` | Whether the field is required |
| `value` | `Date` | - | Field value |

## UI Components

### `<Markdown>`

Renders Markdown through `react-markdown` while providing GothamUI container styling, remote content loading, and template values.

```tsx
import {Markdown} from '@nlabs/gothamui';

<Markdown
  className="prose"
  content="# Welcome, {{name}}"
  values={{name: 'Bruce'}}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | Additional class names for the Markdown container |
| `content` | `string` | - | Inline Markdown content |
| `url` | `string` | - | URL whose response supplies the Markdown content |
| `values` | `Record<string, unknown>` | `{}` | Values substituted into the Markdown template |

### `<PaymentMethodPanel>`

Displays an empty or masked saved-payment state and delegates add, replace, and remove workflows to application callbacks. It does not collect or store payment credentials.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `brand` | `string` | `''` | Display-safe payment brand |
| `isAdding` | `boolean` | `false` | Shows add or replace progress and disables actions |
| `isRemoving` | `boolean` | `false` | Shows removal progress and disables actions |
| `last4` | `string` | `''` | Last four display digits |
| `onAdd` | `() => void` | Required | Starts the provider-owned add or replace flow |
| `onRemove` | `() => void` | `undefined` | Starts removal and controls whether the remove action is shown |

See [Payment methods](./payments.md) for all props, examples, loading states, and security guidance.

### `<Button>`

Button component with multiple variants and states.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Button content |
| `className` | `string` | - | Custom CSS class |
| `color` | `GothamColor` | `'primary'` | Button color |
| `disabled` | `boolean` | `false` | Whether the button is disabled |
| `hasNotification` | `boolean` | `false` | Show notification indicator |
| `hasShadow` | `boolean` | `false` | Show shadow effect |
| `icon` | `ReactNode` | - | Button icon |
| `isLoading` | `boolean` | `false` | Show loading spinner |
| `label` | `string` | `''` | Button label (used if children not provided) |
| `onClick` | `(event?: unknown) => void` | `() => {}` | Click handler |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Button size |
| `tabIndex` | `number` | - | Tab index |
| `type` | `'button'` \| `'reset'` \| `'submit'` | `'button'` | Button type |
| `variant` | `'text'` \| `'contained'` \| `'outlined'` | - | Button variant |

### `<Loader>`

Loading indicator component.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Custom CSS class |
| `color` | `string` | `'primary'` | Loader color |
| `content` | `string` | - | Loading message |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Loader size |

### `<Notify>`

Notification component for displaying alerts and messages.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `actions` | `Array<{ label: string; onClick: () => void }>` | `[]` | Action buttons |
| `anchorOrigin` | `{ horizontal: 'left' \| 'center' \| 'right', vertical: 'top' \| 'bottom' }` | `{ horizontal: 'center', vertical: 'bottom' }` | Position of the notification |
| `autoHideDuration` | `number` | `5000` | Auto-hide duration in milliseconds |
| `className` | `string` | - | Custom CSS class |
| `isOpen` | `boolean` | `false` | Whether the notification is open |
| `message` | `string` | Required | Notification message |
| `onClose` | `() => void` | - | Close handler |
| `severity` | `'success'` \| `'info'` \| `'warning'` \| `'error'` | `'info'` | Notification severity |

### `<Svg>`

SVG icon component.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Custom CSS class |
| `color` | `string` | - | Icon color |
| `height` | `number` | - | Icon height |
| `name` | `string` | Required | Icon name |
| `width` | `number` | - | Icon width |

## Navigation Components

### `<GothamRoute>`

Route component for defining routes with authentication.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `authenticate` | `boolean` | `false` | Whether the route requires authentication |
| `element` | `ReactElement` | Required | Component to render |
| `path` | `string` | Required | Route path |

### `<AuthRoute>`

Route component that handles authentication redirects.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `authenticate` | `boolean` | `false` | Whether the route requires authentication |
| `element` | `ReactElement` | Required | Component to render |
| `path` | `string` | Required | Route path |

## Configuration Types

### `GothamConfiguration`

Configuration object for GothamUI applications.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `app` | `{ logo?: string; name?: string; title?: string; titleBarSeparator?: string; }` | `{ name: 'gotham', title: 'GothamUI' }` | Application metadata |
| `baseUrl` | `string` | `''` | Base URL for the application |
| `config` | `FluxOptions` | - | Flux configuration options |
| `displayMode` | `'light'` \| `'dark'` | - | Theme display mode |
| `flux` | `FluxFramework` | - | Custom Flux instance |
| `isAuth` | `() => boolean` | `() => false` | Authentication check function |
| `middleware` | `FluxMiddlewareType[]` | `[]` | Flux middleware |
| `onInit` | `() => void` | - | Initialization callback |
| `routes` | `GothamRouteData[]` | `[]` | Application routes |
| `storageType` | `'local'` \| `'session'` | `'session'` | Storage type for persisted state |
| `stores` | `unknown[]` | `[]` | Additional Flux stores |
| `theme` | `Record<string, unknown>` | `{}` | Theme configuration |
| `translations` | `Record<string, unknown>` | `{ translation: {} }` | i18n translations |

## Actions

### `GothamActions`

Action creators for common operations.

| Method | Parameters | Description |
|--------|------------|-------------|
| `init` | `() => Promise<FluxAction>` | Initialize the application |
| `loading` | `(isLoading: boolean, content?: string) => Promise<FluxAction>` | Show/hide loading indicator |
| `navBack` | `() => Promise<FluxAction>` | Navigate back |
| `navForward` | `() => Promise<FluxAction>` | Navigate forward |
| `navGoto` | `(path: string, params?: Record<string, unknown>) => Promise<FluxAction>` | Navigate to a path |
| `navReplace` | `(path: string, params?: Record<string, unknown>) => Promise<FluxAction>` | Replace current route |
| `notify` | `(params: GothamNotifyParams) => Promise<FluxAction>` | Show notification |
| `notifyClose` | `() => Promise<FluxAction>` | Close notification |
| `setConfig` | `(config: GothamConfiguration) => Promise<FluxAction>` | Update configuration |
| `signOut` | `() => Promise<FluxAction>` | Sign out user |
| `updateTitle` | `(title: string, separator?: string) => Promise<FluxAction>` | Update page title |

## Containers

There are 2 included containers to choose from:

*default*

Has a top bar with logo and menu. The top bar is transparent and turns translucent with a backdrop blur when scrolling down. Use `transparentScrollBackdropFilter` to customize the blur while keeping the top state transparent.

*menu*

A side bar on the left.

## Drawer

A modal side panel with focus trapping, Escape/backdrop dismissal, and a damped spring. Import from `@nlabs/gothamui/components`.

Control visibility with `open` and `onClose`. Keep the component mounted while closing; `onAfterClose` fires after the exit settles. Rapid direction changes preserve spring velocity. Reduced-motion preferences skip the animation.

Use `side="left"` for a left drawer (default: right). Supply an accessible `aria-label` or a `DialogTitle` child. Customize the panel through `className` and the scrim through `backdropClassName`. Consumers own content, actions, and brand colors.

## Chat

GothamUI includes chat UI components vendored from `react-chat-elements`.

### Import Options

```ts
import {Chat} from '@nlabs/gothamui';
```

```ts
import {MessageBox, MessageList, ChatList} from '@nlabs/gothamui/chat';
```

### Migration From `react-chat-elements`

```ts
// Before
import {MessageBox, MessageList, ChatList} from 'react-chat-elements';

// After
import {MessageBox, MessageList, ChatList} from '@nlabs/gothamui/chat';
```

### Exported Components

- `MessageBox`
- `ChatItem`
- `ChatList`
- `MessageList`
- `MeetingItem`
- `MeetingList`
- `SystemMessage`
- `ReplyMessage`
- `MeetingMessage`
- `AudioMessage`
- `FileMessage`
- `LocationMessage`
- `SpotifyMessage`
- `VideoMessage`
- `PhotoMessage`
- `MeetingLink`
- `Input`
- `Button`
- `Avatar`
- `Navbar`
- `Dropdown`
- `SideBar`
- `Popup`
- `Circle`

## Notification examples

The Notify component provides a customizable notification system for displaying alerts, messages, and interactive notifications to users.

### Features

- **Multiple Severity Levels**: Support for error, warning, info, and success notifications
- **Customizable Positioning**: Position notifications at any corner or edge of the screen
- **Auto-dismiss**: Automatically hide notifications after a configurable duration
- **Interactive Actions**: Add buttons or icon buttons for user interaction
- **Tailwind CSS Styling**: Fully styled with Tailwind CSS for easy customization

### Usage

```tsx
import {GothamActions} from '@nlabs/gothamui';

// Basic notification
GothamActions.notify({
  message: 'This is a basic notification',
  autoHideDuration: 5000
});

// Notification with severity
GothamActions.notify({
  message: 'Operation completed successfully',
  severity: 'success'
});

// Notification with custom position
GothamActions.notify({
  message: 'This appears in the top right',
  anchorOrigin: {
    horizontal: 'right',
    vertical: 'top'
  }
});

// Notification with actions
GothamActions.notify({
  message: 'Would you like to undo?',
  actions: [
    {
      label: 'Undo',
      onClick: (key) => {
        console.log('Undo clicked', key);
        // Perform undo action
      }
    },
    {
      icon: 'close',
      onClick: (key) => {
        console.log('Close clicked', key);
        GothamActions.notifyClose();
      }
    }
  ]
});
```

### Props

The `GothamNotifyParams` interface accepts the following properties:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `message` | ReactElement \| string | - | The content of the notification |
| `severity` | 'error' \| 'warning' \| 'info' \| 'success' | - | The severity level of the notification |
| `autoHideDuration` | number | 3000 | Time in milliseconds before automatically dismissing |
| `anchorOrigin` | { horizontal: 'left' \| 'center' \| 'right', vertical: 'top' \| 'bottom' } | { horizontal: 'left', vertical: 'bottom' } | Position of the notification |
| `actions` | GothamNotifyAction[] | [] | Array of action buttons to display |

#### GothamNotifyAction

| Property | Type | Description |
|----------|------|-------------|
| `icon` | string | Icon name to display (uses the Svg component) |
| `label` | string | Text label for the button |
| `onClick` | (key: string) => void | Callback function when the action is clicked |

## Document head

Import `DocumentHead` and descriptor types from `@nlabs/gothamui/head`. Import `renderDocumentHead` from `@nlabs/gothamui/head/static` for Node/static rendering; this entry has no React, router, DOM or styles dependency.

Pass a stable nonempty `owner` and a complete `metadata` snapshot with optional `title`, `canonicalUrl`, `meta` (`name` or `property`, plus `content`) and `jsonLd` (`id`, JSON-compatible `value`). Empty string values are preserved. JSON-LD requires plain JSON values: finite numbers, no cycles, accessors, array holes or serialization hooks. Validation and script collision checks precede DOM writes.

Distinct metadata owners overlap by mount order; updates do not promote priority. Cleanup restores original values/node identity by default, or removes nodes created by the owner. `missingTags: 'ignore'` skips absent meta/canonical/script nodes. Metadata cleanup supports `restore`/`retain`; structured-data cleanup also supports `remove`. Removal only affects the explicitly identified script. Duplicate active owners and conflicting script IDs/types/owner markers fail visibly. Unrelated scripts remain untouched.

External value/attribute writes or node replacements survive cleanup. A subsequent explicit update resolves the current target and can reclaim valid metadata or a compatible script; its external state becomes the restoration baseline. Browser effects and events remain outside the pure serializer. The component renders null and is safe to render in Node.

Static rendering uses `renderDocumentHead({metadata, owner})`. Output escapes markup and JSON script-breaking text and marks each JSON-LD script with `data-gotham-head-owner`. Give the browser the same owner/ID to adopt the static node. Product schema objects, route policy, defaults and analytics remain in the consumer.

Check that your installed GothamUI version includes the `head` and `head/static` exports before using these APIs.

## Authentication forms

AuthSignInForm and AuthSignUpForm are public through @nlabs/gothamui, @nlabs/gothamui/components and @nlabs/gothamui/form. The full AuthSignInView/AuthSignUpView screens compose these forms and preserve their existing layout, validation and links.

The forms own credential fields, password toggles, consent/remember checkboxes and pending submission through Form. Pass an awaited onSubmit callback; provider calls, session policy, product validation and routing remain in the application.

Omitted schema retains existing validation: valid email/nonempty password for signin; accepted terms, confirmation, matching passwords and an eight-character minimum for signup. Pass a typed custom schema to replace it. Pass schema={null} only when the callback owns validation. This option deliberately bypasses all package schema checks.

Both forms accept className/name, per-field fields overrides, fieldsClassName, optionsContent/optionsClassName, beforeSubmit, submitLabel/pendingLabel, submitClassName/submitVariant and showSubmitLoading. Field overrides allow autoComplete, borderColor, borderType, inputClass, label, labelClass and placeholder. Empty classes replace defaults; names/types/password toggles remain owned by the form. fieldsClassName={null} renders direct fields. optionsContent and beforeSubmit render inside the Form context; footers and branded shells remain outside.

Signin accepts defaultEmail and showRememberEmail (default true; hidden remember has a false value). Signup accepts showPasswordStrength (default true) and termsProps for label/description/containerClass/labelClass/optionClass; acceptTerms identity remains fixed. Values are typed AuthSignInValues/AuthSignUpValues and callbacks retain Form's runtime event/error arguments.

Submit buttons stay disabled during the entire callback. Default loading spinner and labels Sign In/Sign Up remain. pendingLabel changes pending copy; showSubmitLoading={false} retains a text-only indicator. Catch provider errors in the callback and supply error content through beforeSubmit; full views retain their error block outside the form.

For a branded rounded form, set borderType rounded and clear inputClass/labelClass in every fields override; set fieldsClassName null and supply your form gap/class. Opt out of remember/strength only as an explicit product decision. Do not copy fields or implement another pending controller locally.
