
import type {FC} from 'react';
import type {IMeetingLinkMessageProps, MeetingLinkActionButtons} from '../type';

export const MeetingLink: FC<IMeetingLinkMessageProps> = (props) => (
  <div className='rce-mtlink'>
    <div className='rce-mtlink-content'>
      <div className='rce-mtlink-item'>
        <div className='rce-mtlink-title'>{props.text}</div>
      </div>
      <div className='rce-mtlink-btn'>
        {props?.actionButtons?.map((Item: MeetingLinkActionButtons) => (
          <div className='cursor-pointer rce-mtlink-btn-content' onClick={() => Item.onClickButton(props?.meetingID ?? '')}>
            <Item.Component />
          </div>
        ))}
      </div>
    </div>
  </div>
);
