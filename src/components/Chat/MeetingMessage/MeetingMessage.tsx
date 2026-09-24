import {cn} from '@nlabs/utils';
import {
  ChevronDown as ArrowDown01Icon,
  ChevronRight as ArrowRight01Icon,
  CalendarDays as Calendar04Icon,
  MessageSquare as MessageMultiple01Icon,
  Ellipsis as MoreHorizontalIcon,
  Video as Video01Icon
} from 'lucide-react';
import {useState} from 'react';

import {Avatar} from '../Avatar/Avatar.js';
import {Dropdown} from '../Dropdown/Dropdown.js';
import {formatRelativeDate} from '../utils/formatRelativeDate.js';

import type {FC} from 'react';
import type {IMeetingMessageProps, MeetingMessageEvent} from '../type';

export const MeetingMessage: FC<IMeetingMessageProps> = ({
  date,
  dateString,
  title,
  subject,
  collapseTitle,
  moreItems,
  participants,
  dataSource,

  onClick,
  onMeetingTitleClick,
  onMeetingVideoLinkClick,
  onMeetingMoreSelect,
  ...props
}) => {
  const [toogle, setToogle] = useState(false);

  const PARTICIPANT_LIMIT = props.participantsLimit;
  const dateText = dateString ? dateString : date && formatRelativeDate(date);

  const _onMeetingLinkClick: MeetingMessageEvent = (item, index, event) => {
    if(onMeetingTitleClick instanceof Function) {
      onMeetingTitleClick(item, index, event);
    }
  };

  const _onMeetingVideoLinkClick: MeetingMessageEvent = (item, index, event) => {
    if(onMeetingVideoLinkClick instanceof Function) {
      onMeetingVideoLinkClick(item, index, event);
    }
  };

  const toggleClick = () => {
    setToogle(!toogle);
  };

  return (
    <div className='rce-mbox-mtmg'>
      <div className='rce-mtmg'>
        <div className='rce-mtmg-subject'>{subject || 'Unknown Meeting'}</div>
        <div className='cursor-pointer rce-mtmg-body' onClick={onClick}>
          <div className='rce-mtmg-item'>
            <Calendar04Icon  />
            <div className='rce-mtmg-content'>
              <span className='rce-mtmg-title'>{title}</span>
              <span className='rce-mtmg-date'>{dateText}</span>
            </div>
          </div>

          {onMeetingMoreSelect && moreItems && moreItems.length > 0 && (
            <div>
              <Dropdown
                animationType='bottom'
                animationPosition='norteast'
                buttonProps={{
                  className: 'rce-mtmg-right-icon',
                  icon: {
                    component: <MoreHorizontalIcon  />,
                    size: 24
                  }
                }}
                items={moreItems}
                onSelect={onMeetingMoreSelect}
              />
            </div>
          )}
        </div>
        <div className='cursor-pointer rce-mtmg-body-bottom' onClick={toggleClick}>
          {toogle === true ? (
            <div className='rce-mtmg-bottom--tptitle'>
              <ArrowDown01Icon  />
              <span>{collapseTitle}</span>
            </div>
          ) : (
            <div className='rce-mtmg-body-bottom--bttitle'>
              <ArrowRight01Icon  />
              <span>
                {participants
                  ?.slice(0, PARTICIPANT_LIMIT)
                  .map((x) => x.title || 'Unknow')
                  .join(', ')}
                {participants &&
                  PARTICIPANT_LIMIT &&
                  participants.length > PARTICIPANT_LIMIT &&
                  `, +${participants.length - PARTICIPANT_LIMIT}`}
              </span>
            </div>
          )}
        </div>
        <div className={cn('rce-mtmg-toogleContent', {'rce-mtmg-toogleContent--click': toogle === true})}>
          {dataSource &&
            dataSource.map((x, i) => (
              <div key={i}>
                {!x.event && (
                  <div className='rce-mitem'>
                    <div className={cn('rce-mitem avatar', {'rce-mitem no-avatar': !x.avatar})}>
                      {x.avatar ? <Avatar src={x.avatar} /> : <MessageMultiple01Icon  />}
                    </div>
                    <div className='rce-mitem-body'>
                      <div className='rce-mitem-body--top'>
                        <div
                          className='cursor-pointer rce-mitem-body--top-title'
                          onClick={(e: React.MouseEvent<HTMLElement>) => _onMeetingLinkClick(x, i, e)}
                        >
                          {x.title}
                        </div>
                        <div className='rce-mitem-body--top-time'>
                          {x.dateString ? x.dateString : x.date && x.date && formatRelativeDate(x.date)}
                        </div>
                      </div>
                      <div className='rce-mitem-body--bottom'>
                        <div className='rce-mitem-body--bottom-title'>{x.message}</div>
                      </div>
                    </div>
                  </div>
                )}
                {x.event && (
                  <div className='rce-mitem-event'>
                    <div className='rce-mitem-bottom-body'>
                      <div className='rce-mitem-body avatar'>
                        <Video01Icon  />
                      </div>
                      <div className='rce-mitem-bottom-body-top'>
                        {x.event.title}
                        <div className='rce-mitem-body--top-time'>{x.dateString ? x.dateString : x.date && formatRelativeDate(x.date)}</div>
                        <div className='rce-mitem-avatar-content'>
                          {
                            <div className='rce-mitem-avatar'>
                              {x.event.avatars &&
                                  // x.event.avatars.slice(0, x.event.avatarsLimit).map((x, i) => x instanceof Avatar ? x : (
                                  x.event.avatars.slice(0, x.event.avatarsLimit).map((x, i) => <Avatar key={i} src={x.src} />)}
                              {x.event.avatars && x.event.avatarsLimit && x.event.avatars.length > x.event.avatarsLimit && (
                                <div
                                  className='rce-mitem-length rce-mitem-tooltip'
                                  title={x.event.avatars
                                    .slice(x.event.avatarsLimit, x.event.avatars.length)
                                    .map((avatar) => avatar.title)
                                    .join(',')
                                    .toString()}
                                >
                                  <span className='rce-mitem-tooltip-text'>
                                    {`+${x.event.avatars.length - x.event.avatarsLimit}`}
                                  </span>
                                </div>
                              )}
                            </div>
                          }
                        </div>
                        {x.record && (
                          <div className='rce-mtmg-call-record'>
                            <div className='rce-mtmg-call-body'>
                              <div
                                onClick={(e: React.MouseEvent<HTMLElement>) => _onMeetingVideoLinkClick(x, i, e)}
                                className='cursor-pointer rce-mtmg-call-avatars'
                              >
                                <Avatar className={'rce-mtmg-call-avatars'} src={x.record.avatar} />
                                <div className={'rce-mtmg-record-time'}>{x.record.time}</div>
                              </div>
                              <div className='rce-mtmg-call-body-title'>
                                <span>{x.record.title}</span>
                                <div className='rce-mtmg-call-body-bottom'>{x.record.savedBy}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
