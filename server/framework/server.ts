import { ActionType, DefaultActionResponse, DefaultActionResponseValue } from 'framework/action';
import { ControllerActions, Controllers } from 'framework/controller';
import {
  ZodTypeProvider,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import fastifySwagger, { FastifyDynamicSwaggerOptions } from '@fastify/swagger';
import Fastify from 'fastify';
import { RequestError } from 'framework/errors';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { STATUS_CODES as statusCodes } from 'http';
import { z } from 'zod';

export interface FrameworkOptions {
  /**
   * Port of the HTTP server
   */
  port: number;
  /**
   * Host of the HTTP server
   */
  host?: string;
  /**
   * Enable logging
   */
  logger?: boolean;
  /**
   * Documentation route
   */
  documentationRoute?: `/${string}`;
  /**
   * OpenAPI configuration
   */
  openapi: FastifyDynamicSwaggerOptions['openapi'];
  /**
   * All controllers in this object will be accessible through HTTP
   */
  controllers: Controllers;
}

export const server = async ({
  port,
  host,
  documentationRoute,
  openapi,
  controllers,
  ...fastifyOptions
}: FrameworkOptions) => {
  const httpServer = Fastify(fastifyOptions);

  /** Setup swagger */
  httpServer.setValidatorCompiler(validatorCompiler);
  httpServer.setSerializerCompiler(serializerCompiler);

  await httpServer.register(fastifySwagger, {
    openapi,
    transform: jsonSchemaTransform,
  });

  if (documentationRoute) {
    await httpServer.register(fastifySwaggerUI, {
      routePrefix: documentationRoute,
    });
  }

  // Registers controller routes into Fastify
  Object.entries<ControllerActions<unknown>>(controllers).forEach(([tag, controller]) => {
    Object.values<ActionType<unknown, unknown, unknown, unknown, unknown>>(controller).forEach(action => {
      const params = action.params instanceof z.ZodUndefined
        ? {}
        : { params: action.params };

      const query = action.query instanceof z.ZodUndefined
        ? {}
        : { query: action.query };

      const headers = action.headers instanceof z.ZodUndefined
        ? {}
        : { headers: action.headers };

      const body = action.method === 'GET' || action.body instanceof z.ZodUndefined
        ? {}
        : { body: action.body };

      const response = action.output === DefaultActionResponse
        ? { 200: DefaultActionResponse }
        : { 200: action.output as unknown };

      httpServer.withTypeProvider<ZodTypeProvider>().route({
        url: action.route,
        method: action.method,
        schema: {
          summary: action.summary,
          description: action.description,
          tags: [tag],
          ...params,
          ...query,
          ...body,
          ...headers,
          ...response,
        },
        handler: async (req, res) => {
          const data = {
            ...(req.params ?? {}),
            ...(req.query ?? {}),
            ...(req.body ?? {}),
            ...(req.headers ?? {}),
          };

          const result = await action(data) as unknown;

          if (action.output === DefaultActionResponse) {
            res.send(DefaultActionResponseValue);
          } else {
            res.send(result);
          }
        },
      });
    });
  });

  httpServer.setErrorHandler(function (error, _, reply) {
    if (error instanceof RequestError) {
      reply
        .status(error.statusCode)
        .send({
          error: statusCodes[error.statusCode],
          message: error.message,
          statusCode: error.statusCode
        });
    } else if (error instanceof z.ZodError) {
      const status = 400;
      reply
        .status(status)
        .send({
          error: statusCodes[status],
          message: error.issues,
          statusCode: error.statusCode
        });
    } else {
      reply.send(error);
    }
  })

  return {
    start: async (callback: (
      server: typeof httpServer,
      error: Error | null,
      address: string,
    ) => void) => {
      await httpServer.ready();
      await httpServer.listen(
        { host, port },
        (err, address) => {
          callback(httpServer, err, address);
          if (documentationRoute) {
            httpServer.log.info(`Documentation available at http://${host}:${port}${documentationRoute}`);
          }
        },
      );
    },
  };
};
