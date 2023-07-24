import fastifySwagger, { FastifyDynamicSwaggerOptions } from '@fastify/swagger';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
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
}

export const server = async ({
  port,
  host,
  documentationRoute,
  openapi,
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
