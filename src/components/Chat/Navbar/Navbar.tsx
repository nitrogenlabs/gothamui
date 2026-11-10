import {cn} from '@nlabs/utils';

import {INavbarProps} from '../type.js';

import type {FC} from 'react';

export const Navbar: FC<INavbarProps> = ({type = 'light', ...props}) => (
  <div className={cn('rce-navbar', type, props.className)}>
    <div className='rce-navbar-item rce-navbar-item__left'>{props.left}</div>
    <div className='rce-navbar-item rce-navbar-item__center'>{props.center}</div>
    <div className='rce-navbar-item rce-navbar-item__right'>{props.right}</div>
  </div>
);
