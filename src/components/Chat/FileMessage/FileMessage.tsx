import {
  CircleAlert as Alert02Icon,
  CloudDownload as CloudDownloadIcon,
  File as File01Icon
} from 'lucide-react';

import {ProgressCircle} from '../Circle/Circle.js';

import type {FC} from 'react';
import type {IFileMessageProps} from '../type';

export const FileMessage: FC<IFileMessageProps> = (props) => {
  const progressOptions = {
    strokeWidth: 5,
    color: '#333',
    trailColor: '#aaa',
    trailWidth: 5,
    step: (
      state: { color: string; width: string },
      circle: {
        path: { setAttribute: (arg0: string, arg1: string) => void };
        value: () => number;
        setText: (arg0: string | number) => void;
      }
    ) => {
      circle.path.setAttribute('trail', state.color);
      circle.path.setAttribute('trailwidth-width', state.width);

      const value = Math.round(circle.value() * 100);
      if(value === 0) {
        circle.setText('');
      } else {
        circle.setText(value);
      }
    }
  };

  const error = props?.data?.status && props?.data?.status.error === true;

  const onClick = (e: React.MouseEvent) => {
    if(!props?.data?.status) {
      return;
    }

    if(!props?.data?.status.download && props.onDownload instanceof Function) {
      props.onDownload(e);
    } else if(props?.data?.status.download && props.onOpen instanceof Function) {
      props.onOpen(e);
    }
  };

  return (
    <div className='rce-mbox-file'>
      <button className="cursor-pointer" onClick={onClick}>
        <div className='rce-mbox-file--icon'>
          <File01Icon color='#aaa'  />
          <div className='rce-mbox-file--size'>{props?.data.size}</div>
        </div>
        <div className='rce-mbox-file--text'>{props.text}</div>
        <div className='rce-mbox-file--buttons'>
          {error && (
            <span className='rce-error-button'>
              <Alert02Icon color='#ff3d3d'  />
            </span>
          )}
          {!error && props?.data?.status && !props?.data?.status.download && !props?.data?.status.click && (
            <CloudDownloadIcon color='#aaa'  />
          )}
          {!error &&
            props?.data?.status &&
            typeof props?.data?.status.loading === 'number' &&
            props?.data?.status.loading !== 0 && (
            <ProgressCircle
              animate={props?.data?.status.loading}
              className='rce-mbox-file--loading'
              progressOptions={progressOptions}
            />
          )}
        </div>
      </button>
    </div>
  );
};
