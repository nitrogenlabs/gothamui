import {cn} from '@nlabs/utils';
import {useState} from 'react';

import {Button} from '../Button/Button.js';

import type {FC} from 'react';
import type {IDropdownItemType, IDropdownProps} from '../type.js';

export const Dropdown: FC<IDropdownProps> = ({animationPosition = 'nortwest', animationType = 'default', ...props}) => {
  const [show, setShow] = useState<boolean | undefined>(undefined);

  const onBlur = () => {
    if(show === true) {
      setShow(false);
    }
  };

  return (
    <div className={cn('rce-dropdown-container', props.className)} onBlur={onBlur}>
      {<Button {...props.buttonProps} onClick={() => setShow(!show)} />}
      <div
        className={cn(
          'rce-dropdown',
          animationType,
          `rce-dropdown-open__${animationPosition}`,
          {'dropdown-hide': show === false},
          {'dropdown-show': show === true}
        )}
      >
        <ul>
          {props.title && <span className='rce-dropdown-title'>{props.title}</span>}
          {props.items?.map((x: IDropdownItemType, i: number) => (
            <li key={i} onMouseDown={(e) => props.onSelect(i)}>
              {x instanceof Object ? (
                x.icon ? (
                  <span className='rce-button-icon--container'>
                    {(x.icon.float === 'right' || !x.icon.float) && <a>{x.text}</a>}

                    <span
                      style={{float: x.icon.float, color: x.icon.color, fontSize: x.icon.size || 12}}
                      className={cn('rce-button-icon', x.icon.className)}
                    >
                      {x.icon.component}
                    </span>

                    {x.icon.float === 'left' && <a>{x.text}</a>}
                  </span>
                ) : (
                  <a>{x.text}</a>
                )
              ) : (
                <a>{x}</a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
