import {cn} from '@nlabs/utils';
import {
  ChevronDown as ArrowDown01Icon,
  ChevronUp as ArrowUp01Icon,
  Video as Video01Icon,
  Volume2 as VolumeHighIcon,
  VolumeX as VolumeOffIcon
} from 'lucide-react';
import {useEffect, useState} from 'react';

import {Avatar} from '../Avatar/Avatar.js';
import {IChatItemProps} from '../type';
import {resolveDateValue, useRelativeDateText} from '../utils/formatRelativeDate.js';

import type {FC, Key} from 'react';

export const ChatItem: FC<IChatItemProps> = ({
  avatarFlexible = false,
  unread = 0,
  statusColorType = 'badge',
  lazyLoadingImage = undefined,
  onAvatarError = () => void 0,
  ...props
}) => {
  const [onHoverTool, setOnHoverTool] = useState(false);
  const [onDrag, setOnDrag] = useState(false);
  const timestamp = resolveDateValue(props.added, props.date);
  const dateText = useRelativeDateText(timestamp, props.dateString);

  useEffect(() => {
    props.setDragStates?.(setOnDrag);
  }, []);

  const handleOnMouseEnter = () => {
    setOnHoverTool(true);
  };

  const handleOnMouseLeave = () => {
    setOnHoverTool(false);
  };

  const handleOnClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if(onHoverTool === true) {
      return;
    }

    props.onClick?.(e);
  };

  const onDragOver = (e: React.MouseEvent) => {
    e.preventDefault();
    if(props.onDragOver instanceof Function) {
      props.onDragOver(e, props.id);
    }
  };

  const onDragEnter = (e: React.MouseEvent) => {
    e.preventDefault();
    if(props.onDragEnter instanceof Function) {
      props.onDragEnter(e, props.id);
    }
    if(!onDrag) {
      setOnDrag(true);
    }
  };

  const onDragLeave = (e: React.MouseEvent) => {
    e.preventDefault();
    if(props.onDragLeave instanceof Function) {
      props.onDragLeave(e, props.id);
    }
    if(onDrag) {
      setOnDrag(false);
    }
  };

  const onDrop = (e: React.MouseEvent) => {
    e.preventDefault();
    if(props.onDrop instanceof Function) {
      props.onDrop(e, props.id);
    }
    if(onDrag) {
      setOnDrag(false);
    }
  };

  const onExpandItem = (e: React.MouseEvent, id: string | number) => {
    e.preventDefault();
    e.stopPropagation();
    if(props.onExpandItem instanceof Function) {
      props.onExpandItem(id);
    }
  };

  return (
    <>
      <div
        key={props.id as Key}
        className={cn('cursor-pointer rce-container-citem', props.className)}
        onClick={handleOnClick}
        onContextMenu={props.onContextMenu}
      >
        <div className='rce-citem' onDragOver={onDragOver} onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDrop={onDrop}>
          {!!props.onDragComponent && onDrag && props.onDragComponent(props.id)}
          {((onDrag && !props.onDragComponent) || !onDrag) && [
            <div
              key={'avatar'}
              className={cn('rce-citem-avatar', {'rce-citem-status-encircle': statusColorType === 'encircle'})}
            >
              <Avatar
                src={props.avatar}
                alt={props.alt}
                className={statusColorType === 'encircle' ? 'rce-citem-avatar-encircle-status' : ''}
                size={props.avatarSize || 'large'}
                letterItem={props.letterItem}
                sideElement={
                  props.statusColor ? (
                    <span
                      className='rce-citem-status'
                      style={
                        statusColorType === 'encircle'
                          ? {
                            border: `solid 2px ${props.statusColor}`
                          }
                          : {
                            backgroundColor: props.statusColor
                          }
                      }
                    >
                      {props.statusText}
                    </span>
                  ) : (
                    <></>
                  )
                }
                onError={onAvatarError}
                lazyLoadingImage={lazyLoadingImage}
                type={cn('circle', {flexible: avatarFlexible})}
              />
              {props.subList && props.subList.length > 0 && (
                <button className='cursor-pointer rce-citem-expand-button' onClick={(e) => onExpandItem(e, props.id)}>
                  {props.expanded ? <ArrowUp01Icon  /> : <ArrowDown01Icon  />}
                </button>
              )}
            </div>,
            <div key={'rce-citem-body'} className='rce-citem-body'>
              <div className='rce-citem-body--top'>
                <div className='rce-citem-body--top-title'>{props.title}</div>
                <div className='rce-citem-body--top-time'>{dateText}</div>
              </div>

              <div className='rce-citem-body--bottom'>
                <div className='rce-citem-body--bottom-title'>{props.subtitle}</div>
                <div className='rce-citem-body--bottom-tools' onMouseEnter={handleOnMouseEnter} onMouseLeave={handleOnMouseLeave}>
                  {props.showMute && (
                    <div className='cursor-pointer rce-citem-body--bottom-tools-item' onClick={props.onClickMute}>
                      {props.muted === true && <VolumeOffIcon  />}
                      {props.muted === false && <VolumeHighIcon  />}
                    </div>
                  )}
                  {props.showVideoCall && (
                    <div className='cursor-pointer rce-citem-body--bottom-tools-item' onClick={props.onClickVideoCall}>
                      <Video01Icon  />
                    </div>
                  )}
                </div>
                <div className='rce-citem-body--bottom-tools-item-hidden-hover'>
                  {props.showMute && props.muted && (
                    <div className='rce-citem-body--bottom-tools-item'>
                      <VolumeOffIcon  />
                    </div>
                  )}
                </div>
                <div className='rce-citem-body--bottom-status'>{unread && unread > 0 ? <span>{unread}</span> : null}</div>
                {props.customStatusComponents !== undefined ? props.customStatusComponents.map((Item) => <Item />) : null}
              </div>
            </div>
          ]}
        </div>
      </div>
    </>
  );
};
