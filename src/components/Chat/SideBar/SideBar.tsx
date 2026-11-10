import {cn} from '@nlabs/utils';


import type {FC} from 'react';
import type {ISideBarProps} from '../type.js';

export const SideBar: FC<ISideBarProps> = ({type = 'dark', ...props}) => (
  <div className={cn('rce-sbar', type, props.data.className)}>
    <div className='rce-sbar-item'>{props.data?.top}</div>
    <div className='rce-sbar-item rce-sbar-item__center'>{props.data?.center}</div>
    <div className='rce-sbar-item'>{props.data?.bottom}</div>
  </div>
);
