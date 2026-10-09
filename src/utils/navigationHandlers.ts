import type {NavigateFunction, NavigateOptions} from 'react-router';

export interface NavigationEvent {
  readonly params?: NavigateOptions;
  readonly path?: string;
}

export const navBack = (navigate: NavigateFunction) => (): void => {
  void navigate(-1);
};

export const navForward = (navigate: NavigateFunction) => (): void => {
  void navigate(1);
};

export const navGoto = (navigate: NavigateFunction) => ({params, path = ''}: NavigationEvent): void => {
  void navigate(path, params);
};

export const navReplace = (navigate: NavigateFunction) => ({params, path = ''}: NavigationEvent): void => {
  void navigate(path, {...params, replace: true});
};
