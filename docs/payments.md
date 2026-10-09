# Payment methods

`PaymentMethodPanel` presents the payment method attached to an account and starts application-owned add, replace, or remove workflows. It does not render card-number inputs, collect payment credentials, call a payment API, or store sensitive payment data.

Use a hosted payment-provider flow in `onAdd`, then pass only display-safe values such as the card brand and last four digits back to the panel.

## Empty state

```tsx
import {PaymentMethodPanel} from '@nlabs/gothamui';

export const BillingSettings = () => (
  <PaymentMethodPanel
    onAdd={() => {
      // Open the payment provider's hosted collection flow.
    }}
  />
);
```

## Saved payment method

```tsx
import {PaymentMethodPanel} from '@nlabs/gothamui';

export const BillingSettings = () => (
  <PaymentMethodPanel
    brand="Visa"
    last4="4242"
    onAdd={() => {
      // Open the provider flow in replacement mode.
    }}
    onRemove={() => {
      // Confirm removal, then call the application's payment action.
    }}
  />
);
```

Supplying either `brand` or `last4` switches the panel from its empty state to its saved-method state. Pass both when they are available so the masked label is meaningful.

## Loading states

Set `isAdding` while the provider flow is opening or being confirmed. Set `isRemoving` while removal is in progress. The panel disables competing actions and gives the active button its loading treatment.

```tsx
<PaymentMethodPanel
  brand="Mastercard"
  isRemoving={isRemoving}
  last4="4444"
  onAdd={replacePaymentMethod}
  onRemove={removePaymentMethod}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `actionIcon` | `ReactNode` | Credit-card icon | Icon used by the add or replace action |
| `addLabel` | `string` | `'Add payment method'` | Empty-state action label |
| `brand` | `string` | `''` | Display-safe payment brand |
| `description` | `ReactNode` | Provider-storage explanation | Supporting panel copy; pass `null` to hide it |
| `emptyDescription` | `ReactNode` | Add-method explanation | Supporting empty-state copy |
| `emptyTitle` | `ReactNode` | `'No payment method saved'` | Empty-state heading |
| `isAdding` | `boolean` | `false` | Shows add or replace progress and disables actions |
| `isRemoving` | `boolean` | `false` | Shows removal progress and disables actions |
| `last4` | `string` | `''` | Last four display digits; never pass a complete account number |
| `onAdd` | `() => void` | Required | Starts the provider-owned add or replace flow |
| `onRemove` | `() => void` | `undefined` | Starts removal; omit it to hide the remove action |
| `removeLabel` | `string` | `'Remove'` | Remove-action label |
| `replaceLabel` | `string` | `'Replace payment method'` | Saved-method primary action label |
| `title` | `ReactNode` | `'Payment method'` | Panel heading |

Standard section attributes such as `className`, `id`, and `data-*` attributes are also supported.

## Security boundary

Treat `PaymentMethodPanel` as presentation only. Use the payment provider's hosted fields or checkout experience for credential collection, keep provider secrets on the server, and store only provider tokens and display-safe metadata in application state.
