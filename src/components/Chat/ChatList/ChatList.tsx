import {cn} from '@nlabs/utils';

import {ChatItem} from '../ChatItem/ChatItem.js';

import type {Dispatch, FC, Key, SetStateAction} from 'react';
import type {ChatListEvent, IChatListProps} from '../type.js';

const list: Dispatch<SetStateAction<any>>[] = [];

export const ChatList: FC<IChatListProps> = (props) => {
  const onClick: ChatListEvent = (item, index, event) => {
    if(props.onClick instanceof Function) {
      props.onClick(item, index, event);
    }
  };

  const onContextMenu: ChatListEvent = (item, index, event) => {
    event.preventDefault();
    if(props.onContextMenu instanceof Function) {
      props.onContextMenu(item, index, event);
    }
  };

  const onAvatarError: ChatListEvent = (item, index, event) => {
    if(props.onAvatarError instanceof Function) {
      props.onAvatarError(item, index, event);
    }
  };

  const setDragStates = <S,>(state: Dispatch<SetStateAction<S>>) => {
    list.push(state);
  };

  const onDragLeaveMW = (e: React.MouseEvent<HTMLElement>, id: number | string) => {
    if(list.length > 0) {
      list.forEach((item) => item(false));
    }
    props.onDragLeave?.(e, id);
  };

  const onExpand: ChatListEvent = (item, index, event) => {
    if(props.onExpand instanceof Function) {
      props.onExpand(item, index, event);
    }
  };

  return (
    <div className={cn('rce-container-clist', props.className)}>
      {props.dataSource.map((x, i: number) => (
        <>
          <ChatItem
            {...x}
            key={i as Key}
            lazyLoadingImage={props.lazyLoadingImage}
            onAvatarError={(e: React.MouseEvent<HTMLElement>) => onAvatarError(x, i, e)}
            onContextMenu={(e: React.MouseEvent<HTMLElement>) => onContextMenu(x, i, e)}
            onClick={(e: React.MouseEvent<HTMLElement>) => onClick(x, i, e)}
            onClickMute={(e: React.MouseEvent<HTMLElement>) => props.onClickMute?.(x, i, e)}
            onClickVideoCall={(e: React.MouseEvent<HTMLElement>) => props.onClickVideoCall?.(x, i, e)}
            onDragOver={props?.onDragOver}
            onDragEnter={props?.onDragEnter}
            onDrop={props.onDrop}
            onDragLeave={onDragLeaveMW}
            onDragComponent={props.onDragComponent}
            setDragStates={setDragStates}
            onExpandItem={(e: React.MouseEvent<HTMLElement>) => onExpand(x, i, e)}
            expanded={x.expanded}
          />
          {x.subList && x.subList.length > 0 && (
            <>
              {x.expanded && x.subList.map((sub, j) => (
                <ChatItem
                  {...sub}
                  className='subitem'
                  avatarSize='xsmall'
                  key={`${i}-${j}`}
                  lazyLoadingImage={props.lazyLoadingImage}
                  onAvatarError={(e: React.MouseEvent<HTMLElement>) => onAvatarError(sub, j, e)}
                  onContextMenu={(e: React.MouseEvent<HTMLElement>) => onContextMenu(sub, j, e)}
                  onClick={(e: React.MouseEvent<HTMLElement>) => onClick(sub, j, e)}
                  onClickMute={(e: React.MouseEvent<HTMLElement>) => props.onClickMute?.(sub, j, e)}
                  onClickVideoCall={(e: React.MouseEvent<HTMLElement>) => props.onClickVideoCall?.(sub, j, e)}
                  onDragOver={props?.onDragOver}
                  onDragEnter={props?.onDragEnter}
                  onDrop={props.onDrop}
                  onDragLeave={onDragLeaveMW}
                  onDragComponent={props.onDragComponent}
                  setDragStates={setDragStates}
                />
              ))}
            </>
          )}
        </>
      ))}
    </div>
  );
};
