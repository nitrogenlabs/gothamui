import {Circle} from 'progressbar.js';
import {useCallback, useEffect, useMemo} from 'react';

import type {FC} from 'react';
import type {ICircleProps} from '../type.js';

let wrapper: HTMLDivElement;

export const ProgressCircle: FC<ICircleProps> = ({animate, progressOptions, className}) => {
  const bar = useMemo(() => {
    wrapper = document.createElement('div');
    return new Circle(wrapper, progressOptions);
  }, []);

  const node = useCallback((node: any) => {
    if(node) {
      node.appendChild(wrapper);
    }
  }, []);

  useEffect(() => {
    bar.animate(animate);
  }, [animate, bar]);

  return <div className={className} ref={node} />;
};
