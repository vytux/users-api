import { z } from 'zod';

export type Route = `/${string}`;
export type HttpMethod = 'GET' | 'PUT' | 'POST' | 'DELETE';

type ActionInput<Input> = Input extends z.ZodRawShape
  ? ReturnType<typeof z.object<Input>>
  : z.ZodOptional<z.ZodUndefined>;

type ActionOutput<Output> = Output extends z.ZodType<infer A, infer B, infer C>
  ? z.ZodType<A, B, C>
  : z.ZodVoid;

type ActionHandler<Input, Output> = Input extends z.ZodRawShape
  ? (Output extends z.ZodType<infer A, infer B, infer C>
    ? {
      (body: z.infer<ReturnType<typeof z.object<Input>>>): z.infer<z.ZodType<A, B, C>>;
    }
    : {
      (body: z.infer<ReturnType<typeof z.object<Input>>>): void;
    }
  )
  : (Output extends z.ZodType<infer A, infer B, infer C>
    ? {
      (): z.infer<z.ZodType<A, B, C>>;
    }
    : {
      (): void;
    }
  );

type ActionProps<InputType, OutputType> = {
  readonly method: HttpMethod;
  readonly route: Route;
  readonly input: InputType;
  readonly output: OutputType;
};

type Action<Input, Output> =
  ActionHandler<Input, Output> & ActionProps<ActionInput<Input>, ActionOutput<Output>>;

function action<
  Input,
  Output,
  InputType = ActionInput<Input>,
  OutputType = ActionOutput<Output>,
>({
  route = '/',
  method,
  input,
  output,
  handler,
}: {
  method: HttpMethod;
  route?: Route;
  input?: Input;
  output?: Output;
  handler: ActionHandler<Input, Output>;
}) {
  const props = {
    method,
    route,
    input: input ? z.object(input) : z.undefined(),
    output: output ?? z.void(),
  } as ActionProps<InputType, OutputType>;

  const action = handler as Action<Input, Output>;
  Object.setPrototypeOf(action, props);

  return action;
}

type ActionParams<Input, Output> = Parameters<typeof action<Input, Output>>[0];

type ActionWrapper = <Input, Output>(
  settings: Omit<ActionParams<Input, Output>, 'method' | 'handler'>,
  handler: ActionParams<Input, Output>['handler'],
) => ReturnType<typeof action<Input, Output>>;

export const actionGet: ActionWrapper = (settings, handler) => action({ method: 'GET', handler, ...settings });
export const actionPost: ActionWrapper = (settings, handler) => action({ method: 'POST', handler, ...settings });
export const actionPut: ActionWrapper = (settings, handler) => action({ method: 'PUT', handler, ...settings });
export const actionDelete: ActionWrapper = (settings, handler) => action({ method: 'DELETE', handler, ...settings });

export default Action;