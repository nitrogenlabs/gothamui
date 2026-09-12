import {cn} from '@nlabs/utils';
import {memo, useMemo} from 'react';
import Lightbox, {useController, useNavigationState} from 'yet-another-react-lightbox';
import Video from 'yet-another-react-lightbox/plugins/video';
import 'yet-another-react-lightbox/styles.css';

import {ChevronLeft, ChevronRight, X} from '../../icons/index.js';

import type {FC} from 'react';

type LightboxNavDirection = 'next' | 'prev';

export interface MediaLightboxProps {
  readonly close?: () => void;
  readonly enableVideo?: boolean;
  readonly hideNavigationWhenSingle?: boolean;
  readonly index?: number;
  readonly on?: Record<string, unknown>;
  readonly open?: boolean;
  readonly plugins?: unknown[];
  readonly render?: Record<string, unknown>;
  readonly slides?: unknown[];
  readonly toolbar?: Record<string, unknown>;
  readonly video?: Record<string, unknown>;
}

export const MediaLightboxCloseButton = () => {
  const {close} = useController();

  return (
    <button
      aria-label="Close"
      className="fixed top-4 right-4 z-[10001] inline-flex size-11 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-white/90 hover:text-white focus-visible:text-white"
      onClick={() => close()}
      type="button">
      <X aria-hidden="true" size={28} />
    </button>
  );
};

export const MediaLightboxNavButton: FC<{readonly direction: LightboxNavDirection}> = ({direction}) => {
  const {next, prev} = useController();
  const {nextDisabled, prevDisabled} = useNavigationState();
  const isPrev = direction === 'prev';
  const disabled = isPrev ? prevDisabled : nextDisabled;
  const label = isPrev ? 'Previous' : 'Next';
  const onClick = isPrev ? prev : next;
  const Icon = isPrev ? ChevronLeft : ChevronRight;

  return (
    <button
      aria-label={label}
      className={cn('yarl__button', `yarl__navigation_${direction}`)}
      disabled={disabled}
      onClick={() => onClick()}
      type="button">
      <Icon aria-hidden="true" size={24} />
    </button>
  );
};

const emptyItems: unknown[] = [];
const emptyRender: Record<string, unknown> = {};

const MediaLightboxComponent: FC<MediaLightboxProps> = ({
  close,
  enableVideo = false,
  hideNavigationWhenSingle = false,
  index = 0,
  on,
  open = false,
  plugins = emptyItems,
  render = emptyRender,
  slides = emptyItems,
  toolbar,
  video
}) => {
  const showNavigation = !hideNavigationWhenSingle || slides.length > 1;
  const lightboxPlugins = useMemo(() => (enableVideo ? [Video, ...plugins] : plugins), [enableVideo, plugins]);
  const lightboxRender = useMemo(() => ({
    ...render,
    buttonClose: () => <MediaLightboxCloseButton />,
    buttonNext: () => (showNavigation ? <MediaLightboxNavButton direction="next" /> : null),
    buttonPrev: () => (showNavigation ? <MediaLightboxNavButton direction="prev" /> : null)
  }), [render, showNavigation]);

  return (
    <Lightbox
      close={close}
      index={index}
      on={on as any}
      open={open}
      plugins={lightboxPlugins as any}
      render={lightboxRender}
      slides={slides as any}
      toolbar={toolbar as any}
      video={video as any}
    />
  );
};

export const MediaLightbox = memo(MediaLightboxComponent);
MediaLightbox.displayName = 'MediaLightbox';
