import {IAudioMessageProps} from '../type.js';

import type {FC} from 'react';

export const AudioMessage: FC<IAudioMessageProps> = (props) => {
  const {controlsList} = props.data;

  return (
    <div className={'rce-mbox-audio'} style={props.customStyle}>
      <audio {...props.audioProps} controls controlsList={controlsList ? controlsList : 'nodownload'}>
        <source src={props.data.audioURL} type={props.data.audioType || 'audio/mp3'} />
        Your browser does not support the audio element.
      </audio>
      {props.text && <div className='rce-mbox-text'>{props.text}</div>}
    </div>
  );
};
