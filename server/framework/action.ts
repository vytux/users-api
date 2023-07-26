import { z } from 'zod';

/**
 * Controller's action.
 * Action is performed when api route is called
 * and contains all logic for that route
 */

export type Route = `/${string}`;
export type HttpMethod = 'GET' | 'PUT' | 'PATCH' | 'POST' | 'DELETE';

/**
 * Default value to return if action has no `output` type
 */
export const DefaultActionResponse = z.literal('OK');
export const DefaultActionResponseValue: z.infer<typeof DefaultActionResponse> = 'OK';

/**
 * Returns inferred type from given zod shape.
 * If `T` is not a zod shape, will return `ZodUndefined`.
 */
type ZodObjectOrUndefined<T> = T extends z.ZodRawShape
  ? ReturnType<typeof z.object<T>>
  : z.ZodUndefined;

/**
 * If `T` is a zod type, returns `T`.
 * If `T` is not a zod type, returns `DefaultActionResponse` type.
 */
type ZodTypeOrDefaultResponse<T> = T extends z.ZodType<infer A, infer B, infer C>
  ? z.ZodType<A, B, C>
  : typeof DefaultActionResponse;

/**
 * Returns action handler type, depending on `Input` and `Output` values.
 * 
 * If both `Input` and `Output` are zod types, it returns:
 *  { (userId: string | undefined, req: z.infer<Input>): z.infer<Output> | Promise<z.infer<Output>>; }
 * 
 * If only `Input` is a zod type, it returns:
 *  { (userId: string | undefined, req: z.infer<Input>): void; }
 * 
 * If only `Output` is a zod type, it returns:
 *  { (userId: string | undefined, ignore?: unknown): z.infer<Output> | Promise<z.infer<Output>>; }
 */
type ActionHandler<Input, Output> = Input extends z.ZodRawShape
  ? (Output extends z.ZodType<infer A, infer B, infer C>
    ? { (
      userId: string | undefined,
      req: z.infer<ReturnType<typeof z.object<Input>>>
    ): z.infer<z.ZodType<A, B, C>> | Promise<z.infer<z.ZodType<A, B, C>>>; }
    : { (
      userId: string | undefined,
      req: z.infer<ReturnType<typeof z.object<Input>>>
    ): void; }
  )
  : (Output extends z.ZodType<infer A, infer B, infer C>
    ? { (
      userId: string | undefined,
      ignore?: unknown
    ): z.infer<z.ZodType<A, B, C>> | Promise<z.infer<z.ZodType<A, B, C>>>; }
    : { (
      userId: string | undefined,
      ignore?: unknown
    ): void; }
  );

/**
 * Properties of an action.
 * These properties gets attached to the action handler.
 */
type ActionProps<ParamsType, QueryType, BodyType, OutputType> = {
  readonly method: HttpMethod;
  readonly route: Route;
  readonly isPublic: boolean;
  readonly params: ParamsType;
  readonly query: QueryType;
  readonly body: BodyType;
  readonly output: OutputType;
  readonly summary: string | undefined;
  readonly description: string | undefined;
};

/**
 * A type of action handler, including `ActionProps`.
 */
export type ActionType<Params, Query, Body, Output> =
  ActionHandler<Params & Query & Body, Output>
  & ActionProps<
  ZodObjectOrUndefined<Params>,
  ZodObjectOrUndefined<Query>,
  ZodObjectOrUndefined<Body>,
  ZodTypeOrDefaultResponse<Output>
  >;

/**
 * Creates new action.
 * Infers types and attaches action options to action handler.
 * 
 * @param ActionProps Action options
 * @param ActionHandler Action handler
 * @returns Typed action handler with action options attached
 */
function action<
  Params,
  Query,
  Body,
  Output,
  Input = Params & Query & Body,
  ParamsType = ZodObjectOrUndefined<Params>,
  QueryType = ZodObjectOrUndefined<Query>,
  BodyType = ZodObjectOrUndefined<Body>,
  OutputType = ZodTypeOrDefaultResponse<Output>,
>({
  route = '/',
  method,
  isPublic,
  params,
  query,
  body,
  output,
  summary,
  description,
  handler,
}: {
  method: HttpMethod;
  route?: Route;
  isPublic?: true;
  params?: Params;
  query?: Query;
  body?: Body;
  output?: Output;
  summary?: string,
  description?: string,
  handler: ActionHandler<Input, Output>;
}) {
  const props = {
    method,
    route,
    isPublic: isPublic ?? false,
    params: params ? z.object(params) : z.undefined(),
    query: query ? z.object(query) : z.undefined(),
    body: body ? z.object(body) : z.undefined(),
    output: output ?? DefaultActionResponse,
    summary,
    description,
  } as ActionProps<ParamsType, QueryType, BodyType, OutputType>;

  const action = handler as ActionType<Params, Query, Body, Output>;
  Object.setPrototypeOf(action, props);

  return action;
}

/**
 * Returns options of the action
 */
type ActionParams<Params, Query, Body, Output> =
  Parameters<typeof action<Params, Query, Body, Output>>[0];

/**
 * Wraps `action()`.
 * Splits action options and handler into a separate arguments.
 * Removes `method` option, allowing to set it's value from within the wrapper.
 */
type ActionWrapper = <Params, Query, Body, Output>(
  settings: Omit<ActionParams<Params, Query, Body, Output>, 'method' | 'handler' | 'isPublic'>,
  handler: ActionParams<Params, Query, Body, Output>['handler'],
) => ReturnType<typeof action<Params, Query, Body, Output>>;

// Actions that do not require user authorization
const publicActionGet: ActionWrapper = (settings, handler) =>
  action({ method: 'GET', isPublic: true, handler, ...settings });
const publicActionPut: ActionWrapper = (settings, handler) =>
  action({ method: 'PUT', isPublic: true, handler, ...settings });
const publicActionPatch: ActionWrapper = (settings, handler) =>
  action({ method: 'PATCH', isPublic: true, handler, ...settings });
const publicActionPost: ActionWrapper = (settings, handler) =>
  action({ method: 'POST', isPublic: true, handler, ...settings });
const publicActionDelete: ActionWrapper = (settings, handler) =>
  action({ method: 'DELETE', isPublic: true, handler, ...settings });

// Actions that require user authorization
const privateActionGet: ActionWrapper = (settings, handler) =>
  action({ method: 'GET', handler, ...settings });
const privateActionPut: ActionWrapper = (settings, handler) =>
  action({ method: 'PUT', handler, ...settings });
const privateActionPatch: ActionWrapper = (settings, handler) =>
  action({ method: 'PATCH', handler, ...settings });
const privateActionPost: ActionWrapper = (settings, handler) =>
  action({ method: 'POST', handler, ...settings });
const privateActionDelete: ActionWrapper = (settings, handler) =>
  action({ method: 'DELETE', handler, ...settings });

export default {
  publicGet: publicActionGet,
  publicPut: publicActionPut,
  publicPatch: publicActionPatch,
  publicPost: publicActionPost,
  publicDelete: publicActionDelete,

  get: privateActionGet,
  put: privateActionPut,
  patch: privateActionPatch,
  post: privateActionPost,
  delete: privateActionDelete,
};