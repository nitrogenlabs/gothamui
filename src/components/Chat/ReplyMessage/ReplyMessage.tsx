import {cn} from '@nlabs/utils';


import type {FC} from 'react';
import type {IReplyMessageProps} from '../type';

export const ReplyMessage: FC<IReplyMessageProps> = ({onClick, ...props}) => (
  <div
    className={cn('cursor-pointer rce-mbox-reply', {
      'rce-mbox-reply-border': !!props.titleColor
    })}
    style={{...(props.titleColor && {borderColor: props.titleColor})}}
    onClick={onClick}
  >
    <div className='rce-mbox-reply-left'>
      <div style={{...(props.titleColor && {color: props.titleColor})}} className='rce-mbox-reply-owner'>
        {props.title || 'Unknown'}
      </div>
      <div className='rce-mbox-reply-message'>{props.message || '...'}</div>
    </div>
    {props.photoURL && (
      <div className='rce-mbox-reply-right'>
        <img src={props.photoURL} alt='' />
      </div>
    )}
  </div>
);
