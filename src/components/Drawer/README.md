# Drawer

A modal side panel with focus trapping, Escape/backdrop dismissal, and a damped spring. Import from `@nlabs/gothamui/components`.

Control visibility with `open` and `onClose`. Keep the component mounted while closing; `onAfterClose` fires after the exit settles. Rapid direction changes preserve spring velocity. Reduced-motion preferences skip the animation.

Use `side="left"` for a left drawer (default: right). Supply an accessible `aria-label` or a `DialogTitle` child. Customize the panel through `className` and the scrim through `backdropClassName`. Consumers own content, actions, and brand colors.
