import {cn} from '@nlabs/utils';

import {ILocationMessageProps} from '../type';

import type {FC} from 'react';

const STATIC_URL =
  'https://maps.googleapis.com/maps/api/staticmap?markers=color:MARKER_COLOR|LATITUDE,LONGITUDE&zoom=ZOOM&size=270x200&scale=2&key=KEY';
const MAP_URL = 'https://www.google.com/maps/search/?api=1&query=LATITUDE,LONGITUDE&zoom=ZOOM';

export const LocationMessage: FC<ILocationMessageProps> = ({markerColor = 'red', target = '_blank', zoom = '14', ...props}) => {
  const buildURL = (url: string) => url
    .replace(/LATITUDE/g, props?.data.latitude)
    .replace(/LONGITUDE/g, props?.data.longitude)
    .replace('MARKER_COLOR', markerColor)
    .replace('ZOOM', zoom)
    .replace('KEY', props.apiKey);
  const className = () => {
    let _className = cn('cursor-pointer rce-mbox-location', props.className);

    if(props.text) {
      _className = cn(_className, 'rce-mbox-location-has-text');
    }

    return _className;
  };

  return (
    <div className='rce-container-lmsg'>
      <a
        onClick={props.onOpen}
        target={target}
        href={props.href || props.src || buildURL(props.data.mapURL || MAP_URL)}
        className={className()}
      >
        <img
          onError={props.onError}
          className='rce-mbox-location-img'
          src={props.src || buildURL(props.data.staticURL || STATIC_URL)}
        />
      </a>
      {props.text && <div className='rce-mbox-text rce-mbox-location-text'>{props.text}</div>}
    </div>
  );
};
