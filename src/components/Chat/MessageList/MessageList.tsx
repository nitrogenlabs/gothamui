import {cn} from '@nlabs/utils';
import {ChevronDown as ArrowDown01Icon} from 'lucide-react';
import {memo, useEffect, useMemo, useRef, useState} from 'react';

import {MessageBox} from '../MessageBox/MessageBox.js';

import type {FC} from 'react';
import type {IMessageListProps, MessageListEvent} from '../type';

const MessageListComponent: FC<IMessageListProps> = (listProps) => {
  const {
    referance = null,
    lockable = false,
    toBottomHeight = 300,
    downButton,
    ...props
  } = listProps;
  const scrollBottom = useRef(0);
  const [_downButton, setDownButton] = useState(false);
  const prevProps = useRef(props);

  const checkScroll = () => {
    const e = referance;
    if(!e || !e.current) {
      return;
    }

    if(toBottomHeight === '100%' || (typeof toBottomHeight === 'number' && scrollBottom.current < toBottomHeight)) {
      e.current.scrollTop = e.current.scrollHeight; // scroll to bottom
    } else {
      if(lockable === true) {
        e.current.scrollTop = e.current.scrollHeight - e.current.offsetHeight - scrollBottom.current;
      }
    }
  };

  useEffect(() => {
    if(!referance) {
      return;
    }

    if(prevProps.current.dataSource.length !== props.dataSource.length) {
      checkScroll();
      scrollBottom.current = getBottom(referance);
    }

    prevProps.current = props;
  }, [prevProps, props]);

  const getBottom = (e: any) => {
    if(e.current) {
      return e.current.scrollHeight - e.current.scrollTop - e.current.offsetHeight;
    }
    return e.scrollHeight - e.scrollTop - e.offsetHeight;
  };

  const onOpen: MessageListEvent = (item, index, event) => {
    if(props.onOpen instanceof Function) {
      props.onOpen(item, index, event);
    }
  };

  const onDownload: MessageListEvent = (item, index, event) => {
    if(props.onDownload instanceof Function) {
      props.onDownload(item, index, event);
    }
  };

  const onPhotoError: MessageListEvent = (item, index, event) => {
    if(props.onPhotoError instanceof Function) {
      props.onPhotoError(item, index, event);
    }
  };

  const onClick: MessageListEvent = (item, index, event) => {
    if(props.onClick instanceof Function) {
      props.onClick(item, index, event);
    }
  };

  const onTitleClick: MessageListEvent = (item, index, event) => {
    if(props.onTitleClick instanceof Function) {
      props.onTitleClick(item, index, event);
    }
  };

  const onForwardClick: MessageListEvent = (item, index, event) => {
    if(props.onForwardClick instanceof Function) {
      props.onForwardClick(item, index, event);
    }
  };

  const onReplyClick: MessageListEvent = (item, index, event) => {
    if(props.onReplyClick instanceof Function) {
      props.onReplyClick(item, index, event);
    }
  };

  const onReplyMessageClick: MessageListEvent = (item, index, event) => {
    if(props.onReplyMessageClick instanceof Function) {
      props.onReplyMessageClick(item, index, event);
    }
  };

  const onRemoveMessageClick: MessageListEvent = (item, index, event) => {
    if(props.onRemoveMessageClick instanceof Function) {
      props.onRemoveMessageClick(item, index, event);
    }
  };

  const onContextMenu: MessageListEvent = (item, index, event) => {
    if(props.onContextMenu instanceof Function) {
      props.onContextMenu(item, index, event);
    }
  };

  const onMessageFocused: MessageListEvent = (item, index, event) => {
    if(props.onMessageFocused instanceof Function) {
      props.onMessageFocused(item, index, event);
    }
  };

  const onMeetingMessageClick: MessageListEvent = (item, index, event) => {
    if(props.onMeetingMessageClick instanceof Function) {
      props.onMeetingMessageClick(item, index, event);
    }
  };

  const onScroll = (e: React.UIEvent<HTMLElement>): void => {
    const bottom = getBottom(e.currentTarget);
    scrollBottom.current = bottom;
    if(toBottomHeight === '100%' || (typeof toBottomHeight === 'number' && bottom > toBottomHeight)) {
      if(_downButton !== true) {
        setDownButton(true);
      }
    } else {
      if(_downButton !== false) {
        setDownButton(false);
      }
    }

    if(props.onScroll instanceof Function) {
      props.onScroll(e);
    }
  };

  const toBottom = (e: any) => {
    if(!referance) {
      return;
    }
    referance.current.scrollTop = referance.current.scrollHeight;
    if(props.onDownButtonClick instanceof Function) {
      props.onDownButtonClick(e);
    }
  };

  const onMeetingMoreSelect: MessageListEvent = (item, i, e) => {
    if(props.onMeetingMoreSelect instanceof Function) {
      props.onMeetingMoreSelect(item, i, e);
    }
  };

  const onMeetingLinkClick: MessageListEvent = (item, i, e) => {
    if(props.onMeetingLinkClick instanceof Function) {
      props.onMeetingLinkClick(item, i, e);
    }
  };

  const messages = useMemo(() => props.dataSource.map((x, i: number) => (
    <MessageBox
      {...(x as any)}
      // data={x}
      actionButtons={props.actionButtons}
      key={x.id ?? i}
      notchStyle={props.notchStyle}
      onClick={props.onClick && ((e: React.MouseEvent<HTMLElement>) => onClick(x, i, e))}
      onContextMenu={props.onContextMenu && ((e: React.MouseEvent<HTMLElement>) => onContextMenu(x, i, e))}
      onDownload={props.onDownload && ((e: React.MouseEvent<HTMLElement>) => onDownload(x, i, e))}
      onForwardClick={props.onForwardClick && ((e: React.MouseEvent<HTMLElement>) => onForwardClick(x, i, e))}
      onMeetingLinkClick={
        props.onMeetingLinkClick && ((e: React.MouseEvent<HTMLElement>) => onMeetingLinkClick(x, i, e))
      }
      onMeetingMessageClick={
        props.onMeetingMessageClick && ((e: React.MouseEvent<HTMLElement>) => onMeetingMessageClick(x, i, e))
      }
      onMeetingMoreSelect={
        props.onMeetingMoreSelect && ((e: React.MouseEvent<HTMLElement>) => onMeetingMoreSelect(x, i, e))
      }
      onMeetingTitleClick={props.onMeetingTitleClick}
      onMeetingVideoLinkClick={props.onMeetingVideoLinkClick}
      onMessageFocused={props.onMessageFocused && ((e: React.MouseEvent<HTMLElement>) => onMessageFocused(x, i, e))}
      onOpen={props.onOpen && ((e: React.MouseEvent<HTMLElement>) => onOpen(x, i, e))}
      onPhotoError={props.onPhotoError && ((e: React.MouseEvent<HTMLElement>) => onPhotoError(x, i, e))}
      onRemoveMessageClick={
        props.onRemoveMessageClick && ((e: React.MouseEvent<HTMLElement>) => onRemoveMessageClick(x, i, e))
      }
      onReplyClick={props.onReplyClick && ((e: React.MouseEvent<HTMLElement>) => onReplyClick(x, i, e))}
      onReplyMessageClick={
        props.onReplyMessageClick && ((e: React.MouseEvent<HTMLElement>) => onReplyMessageClick(x, i, e))
      }
      onTitleClick={props.onTitleClick && ((e: React.MouseEvent<HTMLElement>) => onTitleClick(x, i, e))}
      styles={props.messageBoxStyles}
    />

  )), [listProps]);

  return (
    <div className={cn(['rce-container-mlist', props.className])} {...props.customProps}>
      {!!props.children && props.isShowChild && props.children}
      <div className='rce-mlist' onScroll={onScroll} ref={referance}>
        {messages}
      </div>
      {downButton === true && _downButton && toBottomHeight !== '100%' && (
        <div className='rce-mlist-down-button' onClick={toBottom}>
          <ArrowDown01Icon  />
          {props.downButtonBadge !== undefined ? (
            <span className='rce-mlist-down-button--badge'>{props.downButtonBadge.toString()}</span>
          ) : null}
        </div>
      )}
    </div>
  );
};

export const MessageList = memo(MessageListComponent);
MessageList.displayName = 'MessageList';
