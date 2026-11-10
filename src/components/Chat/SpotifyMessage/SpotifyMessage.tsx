
import type {FC} from 'react';
import type {ISpotifyMessageProps} from '../type.js';

export const SpotifyMessage: FC<ISpotifyMessageProps> = ({
  width = 300,
  height = 380,
  ...props
}) => {
  const toUrl = (): string => {
    const formBody: string[] | string = [];
    for(const property in props) {
      const encodedKey = encodeURIComponent(property);
      // @ts-ignore
      const encodedValue = encodeURIComponent(props[property]);
      formBody.push(`${encodedKey}=${encodedValue}`);
    }

    return formBody.join('&');
  };

  if(!props.uri) {
    return null;
  }
  return (
    <div className='rce-mbox-spotify'>
      <iframe
        src={`https://open.spotify.com/embed?${toUrl()}`}
        width={width}
        height={height}
        frameBorder='0'
        allowTransparency={true}
      ></iframe>
    </div>
  );
};
