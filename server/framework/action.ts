import { z } from 'zod';

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
 *  { (req: z.infer<Input>): z.infer<Output> | Promise<z.infer<Output>>; }
 * 
 * If only `Input` is a zod type, it returns:
 *  { (req: z.infer<Input>): void; }
 * 
 * If only `Output` is a zod type, it returns:
 *  { (ignore?: unknown): z.infer<Output> | Promise<z.infer<Output>>; }
 */
type ActionHandler<Input, Output> = Input extends z.ZodRawShape
  ? (Output extends z.ZodType<infer A, infer B, infer C>
    ? {
      (
        req: z.infer<ReturnType<typeof z.object<Input>>>
      ): z.infer<z.ZodType<A, B, C>> | Promise<z.infer<z.ZodType<A, B, C>>>;
    }
    : { (req: z.infer<ReturnType<typeof z.object<Input>>>): void; }
  )
  : (Output extends z.ZodType<infer A, infer B, infer C>
    ? { (ignore?: unknown): z.infer<z.ZodType<A, B, C>> | Promise<z.infer<z.ZodType<A, B, C>>>; }
    : { (ignore?: unknown): void; }
  );

/**
 * Properties of an action.
 * These properties gets attached to the action handler.
 */
type ActionProps<ParamsType, QueryType, BodyType, HeadersType, OutputType> = {
  readonly method: HttpMethod;
  readonly route: Route;
  readonly isPublic: boolean;
  readonly params: ParamsType;
  readonly query: QueryType;
  readonly body: BodyType;
  readonly headers: HeadersType;
  readonly output: OutputType;
  readonly summary: string | undefined;
  readonly description: string | undefined;
};

/**
 * A type of action handler, including `ActionProps`.
 */
export type ActionType<Params, Query, Body, Headers, Output> =
  ActionHandler<Params & Query & Body & Headers, Output>
  & ActionProps<
  ZodObjectOrUndefined<Params>,
  ZodObjectOrUndefined<Query>,
  ZodObjectOrUndefined<Body>,
  ZodObjectOrUndefined<Headers>,
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
  Headers,
  Output,
  Input = Params & Query & Body & Headers,
  ParamsType = ZodObjectOrUndefined<Params>,
  QueryType = ZodObjectOrUndefined<Query>,
  BodyType = ZodObjectOrUndefined<Body>,
  HeadersType = ZodObjectOrUndefined<Headers>,
  OutputType = ZodTypeOrDefaultResponse<Output>,
>({
  route = '/',
  method,
  isPublic,
  params,
  query,
  body,
  headers,
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
  headers?: Headers;
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
    headers: headers ? z.object(headers) : z.undefined(),
    output: output ?? DefaultActionResponse,
    summary,
    description,
  } as ActionProps<ParamsType, QueryType, BodyType, HeadersType, OutputType>;

  const action = handler as ActionType<Params, Query, Body, Headers, Output>;
  Object.setPrototypeOf(action, props);

  return action;
}

/**
 * Returns options of the action
 */
type ActionParams<Params, Query, Body, Headers, Output> =
  Parameters<typeof action<Params, Query, Body, Headers, Output>>[0];

/**
 * Wraps `action()`.
 * Splits action options and handler into a separate arguments.
 * Removes `method` option, allowing to set it's value from within the wrapper.
 */
type ActionWrapper = <Params, Query, Body, Headers, Output>(
  settings: Omit<ActionParams<Params, Query, Body, Headers, Output>, 'method' | 'handler'>,
  handler: ActionParams<Params, Query, Body, Headers, Output>['handler'],
) => ReturnType<typeof action<Params, Query, Body, Headers, Output>>;

const actionGet: ActionWrapper = (settings, handler) => action({ method: 'GET', handler, ...settings });
const actionPut: ActionWrapper = (settings, handler) => action({ method: 'PUT', handler, ...settings });
const actionPatch: ActionWrapper = (settings, handler) => action({ method: 'PATCH', handler, ...settings });
const actionPost: ActionWrapper = (settings, handler) => action({ method: 'POST', handler, ...settings });
const actionDelete: ActionWrapper = (settings, handler) => action({ method: 'DELETE', handler, ...settings });

export default {
  get: actionGet,
  put: actionPut,
  patch: actionPatch,
  post: actionPost,
  delete: actionDelete,
};