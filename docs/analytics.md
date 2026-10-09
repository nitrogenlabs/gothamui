# AWS RUM Analytics

GothamUI emits analytics through its browser analytics channel by default. When an application is wrapped by both Gotham and Metropolis, Metropolis automatically receives these events and delivers them to Reaktor. Gotham does not load an analytics SDK or send network requests by itself.

For local demos or troubleshooting, use the debug adapter to inspect the exact event passed to the analytics client:

```tsx
import {createAwsRumDebugClient} from '@nlabs/gothamui';

const awsRum = createAwsRumDebugClient({
  enabled: import.meta.env.DEV,
  target: metropolisAwsRum
});
```

When enabled, the adapter logs `[GothamUI] awsRum.track` and the event object. If a `target` is supplied, the same object is then forwarded for Metropolis delivery. Omitting `target` is useful for a console-only component demo.

## Plug-and-play configuration

```tsx
import {Gotham} from '@nlabs/gothamui';
import {Metropolis} from '@nlabs/metropolisjs';

root.render(
  <Metropolis config={metropolisConfig}>
    <Gotham config={{routes}} />
  </Metropolis>
);
```

Set an application name and the shared Reaktor endpoint in Metropolis. The application name becomes the default analytics `appId`; `app.rum.appId` can override it:

```ts
const metropolisConfig = {
  production: {
    app: {
      api: {
        rum: 'https://analytics.example.com/public'
      },
      name: 'my-app',
      rum: {
        respectPrivacySignals: true
      }
    }
  }
};
```

If `app.api.rum` is omitted, Metropolis uses its configured public endpoint. Every application uses the same endpoint and supplies its own `appId`. This allows a future dashboard to filter the shared log collection by application.

## Page views

Gotham automatically calls `awsRum.track()` once when the route changes. Add stable analytics metadata so dynamic identifiers and titles never become dimensions:

```tsx
const routes = [{
  analytics: {route: '/stories/:storyId', title: 'Story', viewId: 'story.detail'},
  element: <StoryView />,
  path: 'stories/:storyId'
}];
```

## View performance

Use one terminal measurement instead of separate start/end beacons. A measurement starts when a view begins loading and finishes with exactly one outcome: `success`, `failure`, `timeout`, or `cancelled`. Gotham emits the resulting `view_performance` event; Metropolis handles delivery.

### React views

Call `useViewPerformance()` inside the view being measured. Keep its status `pending` while required content is loading, then change it to `success` or `failure` when the view reaches a terminal state.

```tsx
import {useViewPerformance} from '@nlabs/gothamui';

interface StoryViewProps {
  readonly error?: Error;
  readonly loading: boolean;
}

export const StoryView = ({error, loading}: StoryViewProps) => {
  useViewPerformance({
    route: '/stories/:storyId',
    status: error ? 'failure' : loading ? 'pending' : 'success',
    title: 'Story',
    viewId: 'story.detail'
  });

  if(error) {
    return <p>Unable to load this story.</p>;
  }

  if(loading) {
    return <p>Loading story…</p>;
  }

  return <article>Story content</article>;
};
```

Options:

- `viewId` is required. Use a stable product identifier such as `story.detail`, never a database ID or URL.
- `status` is required and must be `pending`, `success`, or `failure`.
- `route` should be a stable route template such as `/stories/:storyId`, not the current dynamic pathname.
- `title` is an optional stable display name for the view.
- `timeoutMs` defaults to 30 seconds. Set it to `0` or a negative value to disable the automatic timeout.

The hook starts a new measurement when `awsRum`, `route`, `timeoutMs`, `title`, or `viewId` changes. It reports `cancelled` if the view unmounts or one of those values changes before completion. Once a measurement finishes, later status changes cannot emit a second event.

### Non-React lifecycles

`startView()` only measures time; it does not send analytics by itself. Supply an `onComplete` callback and pass the completed measurement to `reportViewPerformance()`:

```ts
import {
  createAwsRumBrowserClient,
  reportViewPerformance,
  startView
} from '@nlabs/gothamui';

const awsRum = createAwsRumBrowserClient();

export const loadStory = async () => {
  const view = startView({
    onComplete: (measurement) => reportViewPerformance(awsRum, measurement),
    route: '/stories/:storyId',
    timeoutMs: 10_000,
    title: 'Story',
    viewId: 'story.detail'
  });

  try {
    const story = await loadStoryData();
    view.succeed();
    return story;
  } catch(error) {
    view.fail();
    throw error;
  }
};
```

The returned handle provides four terminal methods:

- `succeed()` records `success`.
- `fail()` records `failure`.
- `timeout()` records `timeout` immediately; the configured timer does this automatically when it expires.
- `cancel()` records `cancelled`, typically when navigation abandons unfinished work.

Only the first terminal method has an effect. Later calls are ignored and the timeout is cleared.

### Event payload

Gotham sends the completed measurement in this shape:

```ts
{
  name: 'view_performance',
  path: '/stories/:storyId',
  properties: {
    durationMs: 842,
    outcome: 'success',
    viewId: 'story.detail',
    viewTitle: 'Story'
  },
  type: 'view_performance'
}
```

`path` and `viewTitle` are omitted when `route` and `title` are not supplied. `durationMs` is rounded to a non-negative whole number. Keep all identifiers stable and free of names, account IDs, query strings, or other identifying information.

## Automatic interaction tracking

Gotham automatically tracks semantic interactive elements rendered anywhere in the document while `GothamProvider` is mounted. This includes links, buttons, form controls, sliders, switches, tabs, menu items, editable regions, and keyboard-only form submissions. Delegated listeners also cover elements rendered later or in portals.

Interaction events contain only the control type, interaction type, and current pathname. Gotham never reads visible text, URLs, query strings, or control values. Give important interactions a stable event name with `data-analytics-name`:

```tsx
<button data-analytics-name="checkout_started">Checkout</button>
<input data-analytics-name="volume_changed" type="range" />
```

Use `data-analytics-track="false"` on a control or container for a private region that must not emit interaction events:

```tsx
<section data-analytics-track="false">...</section>
```

Automatic interaction tracking is enabled by default. It can be disabled application-wide when an application provides its own delegated tracker:

```tsx
<Gotham config={{analytics: {interactions: false}}} />
```

## Custom events

Use `useAwsRum()` for domain events that need additional stable properties:

```tsx
import {useAwsRum} from '@nlabs/gothamui';

export const SignupButton = () => {
  const awsRum = useAwsRum();

  const onClick = () => {
    awsRum?.track({
      name: 'signup_started',
      path: window.location.pathname,
      properties: {placement: 'header'},
      type: 'click'
    });
  };

  return <button onClick={onClick}>Sign up</button>;
};
```

Properties must be strings, numbers, or booleans. Do not include names, email addresses, form values, account IDs, query strings, or other identifying information.

## Delivery behavior

Metropolis:

- Generates a memory-only journey ID that resets with the application runtime.
- Adds an event ID, timestamp, and sequence number.
- Suppresses identical events during the deduplication window.
- Debounces events into batches.
- Throttles requests to the shared endpoint.
- Sends JSON through Rip-Hunter.
- Dispatches `AWS_RUM_TRACK_QUEUED`, `AWS_RUM_TRACK_SUCCESS`, and `AWS_RUM_TRACK_ERROR` Flux events.

The shared Reaktor mutation stores standalone `logs` documents. Each document contains `appId`; no graph edge is required.
