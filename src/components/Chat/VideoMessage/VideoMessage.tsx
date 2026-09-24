import {cn} from '@nlabs/utils';
import {
  CircleAlert as Alert02Icon,
  CloudDownload as CloudDownloadIcon
} from 'lucide-react';

import {ProgressCircle} from '../Circle/Circle.js';

import type {FC} from 'react';
import type {IProgressOptions, IVideoMessageProps} from '../type';

export const VideoMessage: FC<IVideoMessageProps> = (props) => {
  const progressOptions = {
    strokeWidth: 2.3,
    color: '#efe',
    trailColor: '#aaa',
    trailWidth: 1,
    step: (
      data: IProgressOptions,
      circle: {
        path: { setAttribute: (arg0: string, arg1: string) => void };
        value: () => number;
        setText: (arg0: string | number) => void;
      }
    ) => {
      circle.path.setAttribute('trail', (data.state !== undefined && data?.state?.color) || '');
      circle.path.setAttribute('trailwidth-width', (data.state !== undefined && data?.state?.width) || '');

      const value = Math.round(circle?.value() * 100);

      if(value === 0) {
        circle?.setText('');
      } else {
        circle?.setText(value);
      }
    }
  };

  const error = props?.data?.status && props?.data?.status.error === true;
  const downloaded = props?.data?.status && props?.data?.status.download;

  return (
    <div
      className={cn('rce-mbox-video', {
        'padding-time': !props?.text
      })}
    >
      <div
        className='rce-mbox-video--video'
        style={{
          ...(props?.data.width &&
            props?.data.height && {
            width: props.data.width,
            height: props.data.height
          })
        }}
      >
        {!downloaded && (
          <img className="cursor-pointer"
            src={props?.data.uri}
            alt={props?.data.alt}
            onClick={props.onOpen}
            onLoad={props.onLoad}
            onError={props.onPhotoError}
          />
        )}

        {downloaded && (
          <video controls controlsList={props.controlsList}>
            <source src={props?.data.videoURL} type='video/mp4' />
            Your browser does not support HTML video.
          </video>
        )}

        {error && (
          <div className='rce-mbox-video--video__block'>
            <span className='rce-mbox-video--video__block-item rce-mbox-video--error'>
              <Alert02Icon  />
            </span>
          </div>
        )}
        {!error && props?.data?.status && !downloaded && (
          <div className='rce-mbox-video--video__block'>
            {!props.data.status.click && (
              <button onClick={props.onDownload} className='cursor-pointer rce-mbox-video--video__block-item rce-mbox-video--download'>
                <CloudDownloadIcon  />
              </button>
            )}
            {typeof props.data.status.loading === 'number' && props.data.status.loading !== 0 && (
              <ProgressCircle
                animate={props.data.status.loading}
                className='rce-mbox-video--video__block-item'
                progressOptions={progressOptions}
              />
            )}
          </div>
        )}
      </div>
      {props?.text && <div className='rce-mbox-text'>{props.text}</div>}
    </div>
  );
};
