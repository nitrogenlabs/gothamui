
import {Tab, TabGroup, TabList, TabPanel, TabPanels} from '../../src/components/TabGroup/index.js';

import type {ReactElement} from 'react';

export const TabExample = (): ReactElement => <main className="tab-demo">
  <style>{`.tab-demo [role="tablist"] {display:flex;gap:16px}
      .tab-demo [role="tab"] {cursor:pointer;border:0;border-bottom:2px solid transparent;background:transparent;padding:12px 4px}
      .tab-demo [role="tab"][aria-selected="true"] {border-bottom-color:rebeccapurple}
      .tab-demo [role="tabpanel"] {padding:16px 0}`}</style>
  <TabGroup defaultIndex={0}>
    <TabList aria-label="Media type"><Tab>Image</Tab><Tab>Video</Tab><Tab>Audio</Tab></TabList>
    <TabPanels>
      <TabPanel>Image settings</TabPanel><TabPanel>Video settings</TabPanel><TabPanel>Audio settings</TabPanel>
    </TabPanels>
  </TabGroup>
</main>;
