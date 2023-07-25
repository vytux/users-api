import { ActionType } from 'framework/action';

/**
 * Defines a `Controllers` object,
 * where each entry has a `Controller` inside.
 */
export type Controllers = Record<string, Record<string, unknown>>;

/**
 * Defines generic `Controller`.
 */
export type ControllerActions<T> = {
  [K in keyof T as string]: T[K] extends ActionType<infer Params, infer Query, infer Body, infer Headers, infer Output>
    ? ActionType<Params, Query, Body, Headers, Output>
    : never;
};

/**
 * Creates a new controller with given actions, where each action's
 * route is prefixed with controller's route.
 * 
 * @param route A route to add as a prefix to each action
 * @param actions Object with controller actions
 * @returns Controller object
 */
export const Controller = <
  T extends object,
>(
  route: `/${string}`,
  actions: T,
) => Object.freeze(
  Object.fromEntries(
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
  )
) as T;
