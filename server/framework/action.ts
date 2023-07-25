import { z } from 'zod';

export type Route = `/${string}`;
export type HttpMethod = 'GET' | 'PUT' | 'POST' | 'DELETE';

type ActionInput<Input> = Input extends z.ZodRawShape
  ? ReturnType<typeof z.object<Input>>
  : z.ZodUndefined;

type ActionOutput<Output> = Output extends z.ZodType<infer A, infer B, infer C>
  ? z.ZodType<A, B, C>
  : z.ZodVoid;

type ActionHandler<Input, Output> = Input extends z.ZodRawShape
  ? (Output extends z.ZodType<infer A, infer B, infer C>
    ? {
      (req: z.infer<ReturnType<typeof z.object<Input>>>): z.infer<z.ZodType<A, B, C>>;
    }
    : {
      (req: z.infer<ReturnType<typeof z.object<Input>>>): void;
    }
  )
  : (Output extends z.ZodType<infer A, infer B, infer C>
    ? {
      (ignore?: unknown): z.infer<z.ZodType<A, B, C>>;
    }
    : {
      (ignore?: unknown): void;
    }
  );

type ActionProps<ParamsType, QueryType, BodyType, HeadersType, OutputType> = {
  readonly method: HttpMethod;
  readonly route: Route;
  readonly isPublic: boolean;
  readonly params: ParamsType;
  readonly query: QueryType;
  readonly body: BodyType;
  readonly headers: HeadersType;
  readonly output: OutputType;
};

type Action<Params, Query, Body, Headers, Output> =
  ActionHandler<Params & Query & Body & Headers, Output>
  & ActionProps<ActionInput<Params>, ActionInput<Query>, ActionInput<Body>, ActionInput<Headers>, ActionOutput<Output>>;

function action<
  Params,
  Query,
  Body,
  Headers,
  Output,
  Input = Params & Query & Body & Headers,
  ParamsType = ActionInput<Params>,
  QueryType = ActionInput<Query>,
  BodyType = ActionInput<Body>,
  HeadersType = ActionInput<Headers>,
  OutputType = ActionOutput<Output>,
>({
  route = '/',
  method,
  isPublic,
  params,
  query,
  body,
  headers,
  output,
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
    output: output ?? z.void(),
  } as ActionProps<ParamsType, QueryType, BodyType, HeadersType, OutputType>;

  const action = handler as Action<Params, Query, Body, Headers, Output>;
  Object.setPrototypeOf(action, props);

  return action;
}

type ActionParams<Params, Query, Body, Headers, Output> =
  Parameters<typeof action<Params, Query, Body, Headers, Output>>[0];

type ActionWrapper = <Params, Query, Body, Headers, Output>(
  settings: Omit<ActionParams<Params, Query, Body, Headers, Output>, 'method' | 'handler'>,
  handler: ActionParams<Params, Query, Body, Headers, Output>['handler'],
) => ReturnType<typeof action<Params, Query, Body, Headers, Output>>;

export const actionGet: ActionWrapper = (settings, handler) => action({ method: 'GET', handler, ...settings });
export const actionPost: ActionWrapper = (settings, handler) => action({ method: 'POST', handler, ...settings });
export const actionPut: ActionWrapper = (settings, handler) => action({ method: 'PUT', handler, ...settings });
export const actionDelete: ActionWrapper = (settings, handler) => action({ method: 'DELETE', handler, ...settings });

export default Action;