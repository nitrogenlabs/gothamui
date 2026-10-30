# Accessible content tabs

Use `Tabs` for the existing responsive navigation/link interface. For peer content views, GothamUI now exports `TabGroup`, `TabList`, `Tab`, `TabPanels` and `TabPanel` from both the root and `@nlabs/gothamui/components`.

These are public forwards of the maintained Headless UI primitives already used by GothamUI. They own generated IDs, reciprocal tab/panel ARIA relationships, roving focus, disabled-tab skipping, wrapping, Home/End keys and optional manual activation. There is no copied keyboard/listener protocol or separate mobile select. GothamUI also exports their supported public prop types.

```tsx
import {Tab, TabGroup, TabList, TabPanel, TabPanels} from '@nlabs/gothamui/components';

<TabGroup onChange={setSelectedIndex} selectedIndex={selectedIndex}>
  <TabList aria-label="Media type" className="flex gap-4 border-b">
    {['Image', 'Video', 'Audio'].map((label) => <Tab
      className={({selected}) => `cursor-pointer border-b-2 px-1 py-3 ${selected ? 'border-primary' : 'border-transparent'}`}
      key={label}
    >{label}</Tab>)}
  </TabList>
  <TabPanels>
    <TabPanel>Image settings</TabPanel>
    <TabPanel>Video settings</TabPanel>
    <TabPanel>Audio settings</TabPanel>
  </TabPanels>
</TabGroup>
```

Keep labels/order aligned with panels. Use `manual` to change focus without activating until Enter/Space. Use `unmount={false}` on a panel when its local component state must survive switches; otherwise inactive content follows Headless UI's default unmount behavior. Consumers supply product labels, controlled state callbacks and Tailwind styling, including underline presentation and enabled/disabled cursors. Do not add a second keyboard protocol or duplicate IDs/roles.

The existing `Tabs` API and its mobile navigation policy remain unchanged. Reactorbox adoption requires a verified registry release; source-only availability is not consumer adoption.
