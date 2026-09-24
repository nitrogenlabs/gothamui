import {
  CircleAlert as Alert02Icon,
  CloudDownload as CloudDownloadIcon
} from 'lucide-react';

import {ProgressCircle} from '../Circle/Circle.js';

import type {FC} from 'react';
import type {IPhotoMessageProps, IProgressOptions} from '../type';

export const PhotoMessage: FC<IPhotoMessageProps> = (props) => {
  const progressOptions = {
    strokeWidth: 2.3,
    color: '#efe',
    trailColor: '#aaa',
    trailWidth: 1,
    step: (
      state: IProgressOptions,
      circle: {
        path: { setAttribute: (arg0: string, arg1: any) => void };
        value: () => number;
        setText: (arg0: string | number) => void;
      }
    ) => {
      circle.path.setAttribute('trail', state?.state?.color);
      circle.path.setAttribute('trailwidth-width', state?.state?.width);

      const value = Math.round(circle.value() * 100);

      if(value === 0) {
        circle.setText('');
      } else {
        circle.setText(value);
      }
    }
  };

  const error = props?.data?.status && props?.data?.status.error === true;

  return (
    <div className='rce-mbox-photo'>
      <div
        className='rce-mbox-photo--img'
        style={{
          ...(props?.data?.width &&
            props?.data?.height && {
            width: props.data.width,
            height: props.data.height
          })
        }}
      >
        <img className="cursor-pointer"
          src={props?.data?.uri}
          alt={props?.data?.alt}
          onClick={props.onOpen}
          onLoad={props.onLoad}
          onError={props.onPhotoError}
        />
        {error && (
          <div className='rce-mbox-photo--img__block'>
            <span className='rce-mbox-photo--img__block-item rce-mbox-photo--error'>
              <Alert02Icon  />
            </span>
          </div>
        )}
        {!error && props?.data?.status && !props?.data?.status?.download && (
          <div className='rce-mbox-photo--img__block'>
            {!props?.data?.status.click && (
              <button onClick={props.onDownload} className='cursor-pointer rce-mbox-photo--img__block-item rce-mbox-photo--download'>
                <CloudDownloadIcon  />
              </button>
            )}
            {typeof props?.data?.status.loading === 'number' && props?.data?.status.loading !== 0 && (
              <ProgressCircle
                animate={props?.data?.status.loading}
                progressOptions={progressOptions}
                className='rce-mbox-photo--img__block-item'
              />
            )}
          </div>
        )}
      </div>
      {props?.text && <div className='rce-mbox-text'>{props.text}</div>}
    </div>
  );
};
