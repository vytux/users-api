import Action from 'framework/action';

export type ControllerActions<T> = {
  [K in keyof T as string]: T[K] extends Action<infer Params, infer Query, infer Body, infer Headers, infer Output>
    ? Action<Params, Query, Body, Headers, Output>
    : never;
};

export type Router<T> = {
  [K in keyof T as string]: T[K] extends ControllerActions<infer T>
    ? ControllerActions<T>
    : never;
};

export const Controller = <
  T extends object,
>(
  route: `/${string}`,
  actions: T,
) => Object.freeze(Object.fromEntries(
  Object.entries(actions).map(([name, action]) => {
    const {
      route: actionRoute,
      ...props
    } = Object.getPrototypeOf(action);

    Object.setPrototypeOf(action, {
      ...props,
      route: `${route}${actionRoute}`,
    });

    return [name, action]
  }),
)) as ControllerActions<T>;
