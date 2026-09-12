/**
 * Copyright (c) 2024-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {Logger, LoggerDebugLevel} from '@nlabs/arkhamjs-middleware-logger';
import {BrowserStorage} from '@nlabs/arkhamjs-storage-browser';
import {useFlux} from '@nlabs/arkhamjs-utils-react';
import {merge} from '@nlabs/utils';
import i18n from 'i18next';
import {useEffect, useMemo, useState} from 'react';
import {I18nextProvider, initReactI18next} from 'react-i18next';
import {createBrowserRouter, RouterProvider} from 'react-router';

import {GothamActions} from '../../actions/GothamActions.js';
import {Config} from '../../config/appConfig.js';
import {GothamConstants} from '../../constants/GothamConstants.js';
import {gothamApp} from '../../stores/GothamAppStore.js';
import {createAwsRumBrowserClient} from '../../utils/awsRum.js';
import {GothamContext} from '../../utils/GothamContext.js';
import {registerInteractionAnalytics} from '../../utils/interactionAnalytics.js';
import {registerFlux} from '../../utils/navEventQueue.js';
import {parseRoutes} from '../../utils/routeUtils.js';
import {GothamRoot} from './GothamRoot.js';

import type {FluxFramework, FluxMiddlewareType, FluxOptions} from '@nlabs/arkhamjs';
import type {FC, ReactNode} from 'react';
import type {GothamRouteData} from '../../types/gotham.js';
import type {AwsRum} from '../../utils/awsRum.js';
import type {CustomRouteProps} from '../../utils/routeUtils.js';

export interface GothamProviderProps {
  readonly children?: ReactNode;
  readonly config: GothamConfiguration;
  readonly session?: Record<string, unknown>;
}

export type GothamPosition = 't' | 'tc' | 'tl' | 'tr' | 'b' | 'bc' | 'br' | 'bl';
export type GothamStatus = 'default' | 'error' | 'info' | 'success' | 'warning' | number;
export type ThemeDisplayMode = 'auto' | 'dark' | 'light';

export interface GothamConfiguration {
  readonly analytics?: {
    readonly interactions?: boolean;
  };
  readonly app?: {
    readonly logo?: string;
    readonly name?: string;
    readonly title?: string;
    readonly titleBarSeparator?: string;
  };
  readonly authRoute?: string;
  readonly awsRum?: AwsRum;
  readonly baseUrl?: string;
  readonly config?: FluxOptions;
  readonly displayMode?: ThemeDisplayMode;
  readonly flux?: FluxFramework;
  readonly isAuth?: () => boolean;
  readonly middleware?: FluxMiddlewareType[];
  readonly onInit?: () => void;
  readonly routes?: GothamRouteData[];
  readonly storageType?: 'local' | 'session' | false;
  readonly stores?: unknown[];
  readonly theme?: Record<string, unknown>;
  readonly translations?: Record<string, unknown>;
  readonly i18n?: typeof i18n;
}

export const defaultGothamConfig: GothamConfiguration = {
  analytics: {
    interactions: true
  },
  app: {
    name: 'gotham',
    title: 'GothamUI'
  },
  authRoute: '/',
  baseUrl: '',
  isAuth: () => false,
  middleware: [],
  routes: [],
  storageType: 'session',
  stores: [],
  theme: {},
  translations: {translation: {}}
};

const defaultAwsRum = createAwsRumBrowserClient();

export const init = (config: GothamConfiguration) => (): void => {
  const {onInit} = config;
  GothamActions.init();

  if(onInit) {
    onInit();
  }
};

export const signOut = (flux: FluxFramework) => async () => {
  await flux.clearAppData();
  await GothamActions.loading(false);

  const authRoute = Config.get('authRoute', '/') as string;
  GothamActions.navGoto(authRoute);
};

/* eslint-disable react-hooks/rules-of-hooks -- The compatibility rule does not recognize arrow-function components. */
export const GothamProvider: FC<GothamProviderProps> = ({config: appConfig}) => {
  const flux = useFlux();
  const config: GothamConfiguration = useMemo(() => merge({
    ...defaultGothamConfig,
    analytics: {...defaultGothamConfig.analytics},
    app: {...defaultGothamConfig.app},
    theme: {},
    translations: {translation: {}}
  }, appConfig), [appConfig]);
  const {
    isAuth,
    middleware,
    routes = [],
    storageType,
    stores,
    i18n: providedI18n,
    translations
  } = config;
  const name = config?.app?.name;
  const awsRum = config.awsRum || defaultAwsRum;
  const [session, setSession] = useState({});
  const [isFluxReady, setIsFluxReady] = useState(Boolean((flux as any)?.isInit));
  const router = useMemo(() => createBrowserRouter(
    [
      {
        Component: GothamRoot,
        children: parseRoutes(routes as unknown as CustomRouteProps[]),
        index: false,
        path: '/'
      }
    ]
  ), [routes]);

  // Initialize i18next if translations are provided but no i18n instance is given
  const i18nInstance = useMemo(() => {
    if(providedI18n) {
      return providedI18n;
    }

    if(translations && Object.keys(translations).length > 0) {
      // Create a new i18next instance and initialize it
      const newI18n = i18n.createInstance();

      newI18n
        .use(initReactI18next)
        .init({
          fallbackLng: 'en',
          interpolation: {
            escapeValue: false // React already escapes values
          },
          lng: 'en', // default language
          resources: translations as Record<string, Record<string, Record<string, string>>>
        });

      return newI18n;
    }

    return null;
  }, [providedI18n, translations]);

  useEffect(() => {
    Config.set(config as Record<string, unknown>);
    let isMounted = true;

    const setupFlux = async () => {
      if(!flux) {
        if(isMounted) {
          setIsFluxReady(true);
        }
        return;
      }

      const env: string = Config.get('environment') as string;
      const logger: Logger = new Logger({
        debugLevel: env === 'development' ? LoggerDebugLevel.DISPATCH : LoggerDebugLevel.DISABLED
      });
      const storage: BrowserStorage | undefined = storageType ? new BrowserStorage({type: storageType}) : undefined;
      const fluxMiddleware = [logger, ...(middleware || [])];
      const fluxStores = [gothamApp, ...(stores || [])];

      if((flux as any).isInit) {
        await flux.addStores(fluxStores);
        flux.addMiddleware(fluxMiddleware);
      } else {
        const fluxConfig: FluxOptions = {
          middleware: fluxMiddleware,
          name,
          stores: fluxStores,
          ...(storage ? {storage} : {})
        };

        await flux.init(fluxConfig);
      }

      flux.on(GothamConstants.SIGN_OUT, signOut(flux));
      flux.on(GothamConstants.UPDATE_SESSION, ({session}) => {
        setSession(session);
      });

      registerFlux(flux);
      if(isMounted) {
        setIsFluxReady(true);
      }
    };

    void setupFlux();

    init(config);

    return () => {
      isMounted = false;
    };
  }, [flux, config, middleware, name, storageType, stores]);

  useEffect(() => {
    const unregister = config.analytics?.interactions === false
      ? undefined
      : registerInteractionAnalytics(awsRum);

    return () => unregister?.();
  }, [awsRum, config.analytics?.interactions]);

  const contextValue = useMemo(() => ({Flux: flux, awsRum, isAuth, session}), [flux, awsRum, isAuth, session]);

  if(!isFluxReady) {
    return null;
  }

  if(i18nInstance) {
    return (
      <I18nextProvider i18n={i18nInstance}>
        <GothamContext.Provider value={contextValue}>
          <div>
            <RouterProvider router={router}/>
          </div>
        </GothamContext.Provider>
      </I18nextProvider>
    );
  }

  return (
    <GothamContext.Provider value={contextValue}>
      <div>
        <RouterProvider router={router}/>
      </div>
    </GothamContext.Provider>
  );
};
/* eslint-enable react-hooks/rules-of-hooks */
