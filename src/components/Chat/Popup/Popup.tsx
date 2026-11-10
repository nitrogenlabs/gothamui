import {cn} from '@nlabs/utils';

import {Button} from '../Button/Button.js';

import type {FC} from 'react';
import type {IPopupProps} from '../type.js';

export const Popup: FC<IPopupProps> = ({...props}) => {
  if(props.popup?.show === true) {
    return (
      <div className={cn('rce-popup-wrapper', props.type, props.className)}>
        <div className='rce-popup'>
          {props.popup?.renderHeader ? (
            <div className='rce-popup-header'>{props.popup?.renderHeader()}</div>
          ) : (
            <div className='rce-popup-header'>
              <span>{props.popup?.header}</span>
              {props.popup?.header && props.popup?.headerButtons?.map((x, i) => <Button key={i} {...x} />)}
            </div>
          )}
          <div className='rce-popup-content' style={{color: props.popup?.color}}>
            {props.popup?.renderContent ? props.popup?.renderContent() : props.popup?.text}
          </div>
          <div className='rce-popup-footer'>
            {props.popup?.renderFooter
              ? props.popup?.renderFooter()
              : props.popup?.footerButtons?.map((x, i) => <Button key={i} {...x} />)}
          </div>
        </div>
      </div>
    );
  }
  return null;
};
