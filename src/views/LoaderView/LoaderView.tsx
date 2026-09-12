import {useFluxListener} from '@nlabs/arkhamjs-utils-react';
import {memo, useState} from 'react';

import {Loader} from '../../components/Loader/Loader.js';
import {GothamConstants} from '../../constants/GothamConstants.js';


export interface LoaderContent {
  content?: string;
  isLoading: boolean;
}

export const toggleLoader = (setLoading, setLoaderContent) => ({content, isLoading}: LoaderContent) => {
  setLoading(isLoading);
  setLoaderContent(content);
};

const LoaderViewComponent = () => {
  const [isLoading, setLoading] = useState(false);
  const [content, setLoaderContent] = useState<string | undefined>();

  useFluxListener(GothamConstants.LOADING, ({content, isLoading}: LoaderContent) => {
    setLoading(isLoading);
    setLoaderContent(content);
  });

  if(!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <Loader content={content} />
    </div>
  );
};

export const LoaderView = memo(LoaderViewComponent);
LoaderView.displayName = 'LoaderView';
