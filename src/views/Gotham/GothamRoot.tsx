/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {useFluxListener} from '@nlabs/arkhamjs-utils-react';
import {useContext, useEffect, useRef} from 'react';
import {Outlet, useLocation, useMatches, useNavigate} from 'react-router';

import {Notify} from '../../components/Notify/Notify.js';
import {GothamConstants} from '../../constants/GothamConstants.js';
import {navBack, navForward, navGoto, navReplace} from '../../utils/navigationHandlers.js';
import {resolveRouteAnalytics} from '../../utils/routeAnalytics.js';
import {GothamContext} from '../../utils/GothamContext.js';
import {LoaderView} from '../LoaderView/LoaderView.js';

import type {FC} from 'react';

export {navBack, navForward, navGoto, navReplace} from '../../utils/navigationHandlers.js';

export const GothamRoot: FC = () => {
  const {awsRum} = useContext(GothamContext);
  const navigate = useNavigate();
  const location = useLocation();
  const matches = useMatches();
  const lastTrackedPath = useRef<string | undefined>(undefined);

  useFluxListener(GothamConstants.NAV_BACK, navBack(navigate));
  useFluxListener(GothamConstants.NAV_FORWARD, navForward(navigate));
  useFluxListener(GothamConstants.NAV_GOTO, navGoto(navigate));
  useFluxListener(GothamConstants.NAV_REPLACE, navReplace(navigate));

  useEffect(() => {
    const analytics = resolveRouteAnalytics(matches, location.pathname);
    const path = analytics?.route || location.pathname;
    const viewId = analytics?.viewId || path;

    if(!awsRum || lastTrackedPath.current === viewId) {
      return;
    }

    lastTrackedPath.current = viewId;
    awsRum.track({
      name: 'page_view',
      path,
      properties: {
        title: analytics?.title || document.title,
        viewId
      },
      type: 'page_view'
    });
  }, [awsRum, location.pathname, matches]);

  return (
    <>
      <Outlet/>
      <Notify />
      <LoaderView />
    </>
  );
};
