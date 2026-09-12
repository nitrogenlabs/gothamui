# Render performance

GothamUI uses shallow memoization around form controls, the code editor, Markdown, media and product collections, pricing, tabs, and application views. Lightweight structural components remain ordinary functions. State changes, context updates, and changed props must still render.

## Form isolation

Built-in text, checkbox, radio, select, and date fields subscribe to their own value, default value, and error through `useGothamFormField(name)`. The subscription adapter publishes committed React form state and preserves unchanged snapshots. Editing one field does not invalidate its siblings. Repeating the same value or clearing an absent error does not create a new form state.

`useGothamFormContext()` and render-function children retain access to the entire form. They intentionally update for cross-field UI. Custom controls can use `useGothamFormField` from `@nlabs/gothamui/form` when they only need one field. Existing direct form-context providers remain supported.

## Other render paths

- Gotham configuration is memoized without mutating shared defaults. Session updates retain router and translation instances.
- Table and row context values remain stable when only wrapper props change.
- Select labels are derived during rendering instead of synchronized through an additional state update.
- Inline Markdown is derived immediately. Remote content loads when its URL changes; template substitutions do not repeat the request, and obsolete responses are ignored.
- Chat scroll distance lives in a ref. Only down-button visibility changes use state; the rendered message list remains cached during scrolling.
- The date picker retains its initial fallback timestamp, so ordinary rendering cannot reset calendar navigation.
- Mobile controls subscribe to media-query changes. Breakpoint helper functions retain their identity until the breakpoint changes.
- Autocomplete invalidates obsolete requests when the query changes or the component unmounts.

## Consumer expectations

Update arrays and objects immutably. Reuse unchanged item objects and stable callbacks where practical. A newly created object, callback, or JSX child is a changed prop to React's shallow comparison. No deep comparator ignores updated callbacks or content.

These changes prevent the covered redundant update paths; they do not guarantee zero re-renders in every consuming application. Profile representative application interactions before adding more memoization or virtualization.

## Verification

- `npm test` runs the unit and render-isolation regression suite through Lex/Vitest.
- `npm test -- --collectCoverageFrom 'src/{components,views}/**/*.{ts,tsx}'` checks the existing coverage thresholds and exclusions.
- `lex test --e2e --e2eConfig ./playwright.config.ts` exercises desktop form editing, selection, password visibility, submission, and mobile native selection.

The installed Lex lint command expands its source glob through a shell and misses nested folders. A direct full-tree ESLint check also exposes an existing lint backlog, including a compatibility hook rule that incorrectly flags arrow-function components. The repository-wide lint result is not a clean baseline.
