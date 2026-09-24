import {cn} from '@nlabs/utils';
import {
  Clock3 as ClockIcon,
  Trash2 as Delete02Icon,
  Share2 as LinkForwardIcon,
  Reply as MessageOutgoing01Icon,
  Check as Tick02Icon,
  CheckCheck as TickDouble02Icon,
  Ban as UnavailableIcon
} from 'lucide-react';
import {useEffect, useRef} from 'react';

import {AudioMessage} from '../AudioMessage/AudioMessage.js';
import {Avatar} from '../Avatar/Avatar.js';
import {FileMessage} from '../FileMessage/FileMessage.js';
import {LocationMessage} from '../LocationMessage/LocationMessage.js';
import {MeetingLink} from '../MeetingLink/MeetingLink.js';
import {MeetingMessage} from '../MeetingMessage/MeetingMessage.js';
import {PhotoMessage} from '../PhotoMessage/PhotoMessage.js';
import {ReplyMessage} from '../ReplyMessage/ReplyMessage.js';
import {SpotifyMessage} from '../SpotifyMessage/SpotifyMessage.js';
import {SystemMessage} from '../SystemMessage/SystemMessage.js';
import {resolveDateValue, useRelativeDateText} from '../utils/formatRelativeDate.js';
import {VideoMessage} from '../VideoMessage/VideoMessage.js';

import type {FC} from 'react';
import type {MessageBoxType} from '../type';

export const MessageBox: FC<MessageBoxType> = ({focus = false, notch = true, styles, ...props}) => {
  const prevProps = useRef(focus);
  const messageRef = useRef<HTMLDivElement>(null);

  const positionCls = cn('rce-mbox', {'rce-mbox-right': props.position === 'right'});
  const thatAbsoluteTime =
    !/(text|video|file|meeting|audio)/g.test(props.type || 'text') && !(props.type === 'location' && props.text);
  const timestamp = resolveDateValue(props.added, props.date);
  const dateText = useRelativeDateText(timestamp, props.dateString);

  useEffect(() => {
    if(prevProps.current !== focus && focus === true) {
      if(messageRef) {
        messageRef.current?.scrollIntoView({
          block: 'center',
          behavior: 'smooth'
        });

        props.onMessageFocused(prevProps);
      }
    }
    prevProps.current = focus;
  }, [focus, prevProps]);

  return (
    <div ref={messageRef} className={cn('cursor-pointer rce-container-mbox', props.className)} onClick={props.onClick}>
      {props.renderAddCmp instanceof Function ? props.renderAddCmp() : props.renderAddCmp}
      {props.type === 'system' ? (
        <SystemMessage {...props} focus={focus} notch={notch} />
      ) : (
        <div
          style={styles}
          className={cn(
            positionCls,
            {'rce-mbox--clear-padding': thatAbsoluteTime},
            {'rce-mbox--clear-notch': !notch},
            {'message-focus': focus}
          )}
        >
          <div className='rce-mbox-body' onContextMenu={props.onContextMenu}>
            {!props.retracted && props.forwarded === true && (
              <div
                className={cn(
                  'cursor-pointer rce-mbox-forward',
                  {'rce-mbox-forward-right': props.position === 'left'},
                  {'rce-mbox-forward-left': props.position === 'right'}
                )}
                onClick={props.onForwardClick}
              >
                <LinkForwardIcon size={20}  />
              </div>
            )}

            {!props.retracted && props.replyButton === true && (
              <div
                className={
                  props.forwarded !== true
                    ? cn(
                      'cursor-pointer rce-mbox-forward',
                      {'rce-mbox-forward-right': props.position === 'left'},
                      {'rce-mbox-forward-left': props.position === 'right'}
                    )
                    : cn(
                      'cursor-pointer rce-mbox-forward',
                      {'rce-mbox-reply-btn-right': props.position === 'left'},
                      {'rce-mbox-reply-btn-left': props.position === 'right'}
                    )
                }
                onClick={props.onReplyClick}
              >
                <MessageOutgoing01Icon size={20}  />
              </div>
            )}

            {!props.retracted && props.removeButton === true && (
              <div
                className={
                  props.forwarded === true
                    ? cn(
                      'cursor-pointer rce-mbox-remove',
                      {'rce-mbox-remove-right': props.position === 'left'},
                      {'rce-mbox-remove-left': props.position === 'right'}
                    )
                    : cn(
                      'cursor-pointer rce-mbox-forward',
                      {'rce-mbox-reply-btn-right': props.position === 'left'},
                      {'rce-mbox-reply-btn-left': props.position === 'right'}
                    )
                }
                onClick={props.onRemoveMessageClick}
              >
                <Delete02Icon size={20}  />
              </div>
            )}

            {(props.title || props.avatar) && (
              <div
                style={{...(props.titleColor && {color: props.titleColor})}}
                onClick={props.onTitleClick}
                className={cn('cursor-pointer rce-mbox-title', {
                  'rce-mbox-title--clear': props.type === 'text'
                })}
              >
                {props.avatar && <Avatar letterItem={props.letterItem} src={props.avatar} />}
                {props.title && <span>{props.title}</span>}
              </div>
            )}

            {props.forwardedMessageText ? (
              <div className='rce-mbox-forwardedMessage'>
                <div className='rce-mbox-forwarded-message'>
                  <LinkForwardIcon size={18}  />
                  <i style={{margin: '0 3px 1px 0'}}> {props.forwardedMessageText}</i>
                </div>
              </div>
            ) : null}

            {!props.forwardedMessageText && props.reply ? (
              <ReplyMessage onClick={props.onReplyMessageClick} {...props.reply} />
            ) : null}

            {props.type === 'text' && (
              <div
                className={cn('rce-mbox-text', {
                  'rce-mbox-text-retracted': props.retracted,
                  left: props.position === 'left',
                  right: props.position === 'right'
                })}
              >
                {props.retracted && <UnavailableIcon size={14}  />}
                {props.text}
              </div>
            )}

            {props.type === 'location' && <LocationMessage focus={focus} notch={notch} {...props} />}

            {props.type === 'photo' && <PhotoMessage focus={focus} notch={notch} {...props} />}

            {props.type === 'video' && <VideoMessage focus={focus} notch={notch} {...props} />}

            {props.type === 'file' && <FileMessage focus={focus} notch={notch} {...props} />}

            {props.type === 'spotify' && <SpotifyMessage focus={focus} notch={notch} {...props} />}

            {props.type === 'meeting' && <MeetingMessage focus={focus} notch={notch} {...props} />}
            {props.type === 'audio' && <AudioMessage focus={focus} notch={notch} {...props} />}

            {props.type === 'meetingLink' && (
              <MeetingLink focus={focus} notch={notch} {...props} actionButtons={props?.actionButtons} />
            )}

            <div
              title={props.statusTitle}
              className={cn(
                'rce-mbox-time',
                {'rce-mbox-time-block': thatAbsoluteTime},
                {'non-copiable': !props.copiableDate}
              )}
              data-text={props.copiableDate ? undefined : dateText}
            >
              {props.copiableDate && dateText}
              {props.status && (
                <span className='rce-mbox-status'>
                  {props.status === 'waiting' && <ClockIcon size={14}  />}

                  {props.status === 'sent' && <Tick02Icon size={14}  />}

                  {props.status === 'received' && <TickDouble02Icon size={14}  />}

                  {props.status === 'read' && <TickDouble02Icon color='#4FC3F7' size={14}  />}
                </span>
              )}
            </div>
          </div>

          {notch &&
            (props.position === 'right' ? (
              <svg
                style={props.notchStyle}
                className={cn('rce-mbox-right-notch', {'message-focus': focus})}
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
              >
                <path d='M0 0v20L20 0' />
              </svg>
            ) : (
              <svg
                style={props.notchStyle}
                className={cn('rce-mbox-left-notch', {'message-focus': focus})}
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
              >
                <path d='M20 0v20L0 0' />
              </svg>
            ))}
        </div>
      )}
    </div>
  );
};
