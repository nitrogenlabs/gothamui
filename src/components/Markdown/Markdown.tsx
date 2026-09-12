import React, {memo, useEffect, useMemo, useState} from 'react';
import ReactMarkdown from 'react-markdown';

import {fetchJsonFromUrl, parseTemplate} from '../../utils/contentUtils.js';

export interface MarkdownProps {
  className?: string;
  content?: string;
  url?: string;
  values?: Record<string, unknown>;
}

const defaultStyles: React.CSSProperties = {
  backgroundColor: 'transparent',
  height: '100%',
  overflow: 'auto',
  width: '100%'
};

const emptyValues: Record<string, unknown> = {};

const MarkdownComponent: React.FC<MarkdownProps> = ({
  className = '',
  content,
  url,
  values = emptyValues
}) => {
  const [remoteContent, setRemoteContent] = useState({content: '', url: ''});

  useEffect(() => {
    if(!url) {
      return undefined;
    }
    let active = true;
    const loadContent = async () => {
      try {
        const data = await fetchJsonFromUrl<string>(url);
        if(active) {
          setRemoteContent({content: data, url});
        }
      } catch{
        if(active) {
          setRemoteContent({content: 'Error loading content', url});
        }
      }
    };

    void loadContent();
    return () => {
      active = false;
    };
  }, [url]);

  const remoteSource = remoteContent.url === url ? remoteContent.content : '';
  const source = url ? remoteSource : content ?? '';
  const markdown = useMemo(() => parseTemplate(source, values), [source, values]);

  return (
    <div className={`markdown-container ${className}`.trim()} style={defaultStyles}>
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
};

export const Markdown = memo(MarkdownComponent);
Markdown.displayName = 'Markdown';
