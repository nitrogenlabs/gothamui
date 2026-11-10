import {cn} from '@nlabs/utils';


import type {FC} from 'react';
import type {ISystemMessageProps} from '../type.js';

export const SystemMessage: FC<ISystemMessageProps> = (props) => (
  <div className={cn('rce-container-smsg', props.className)}>
    <div className='rce-smsg'>
      <div className='rce-smsg-text'>{props.text}</div>
    </div>
  </div>
);
