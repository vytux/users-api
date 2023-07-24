import Action from 'framework/action';

export type ControllerActions<T> = {
  [K in keyof T as string]: T[K] extends Action<infer Input, infer Output>
    ? Action<Input, Output>
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
